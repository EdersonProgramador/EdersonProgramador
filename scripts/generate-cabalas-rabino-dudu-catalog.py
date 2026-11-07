"""Gera apps/api/src/courses/catalog/cabalas-rabino-dudu.json a partir do dump yt-dlp."""
from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PLAYLIST = ROOT / "scripts/playlist-cabalas-rabino-dudu.raw.json"
OUT = ROOT / "apps/api/src/courses/catalog/cabalas-rabino-dudu.json"
PLAYLIST_URL = "https://www.youtube.com/playlist?list=PL1F8E81E875BF490F"
LESSONS_PER_MODULE = 20


def slugify(text: str, max_len: int = 52) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return (text[:max_len].strip("-") or "aula")


def load_playlist() -> dict:
    raw = PLAYLIST.read_bytes()
    for encoding in ("utf-8-sig", "utf-8", "utf-16"):
        try:
            return json.loads(raw.decode(encoding))
        except (UnicodeDecodeError, json.JSONDecodeError):
            continue
    raise SystemExit(f"Não foi possível ler {PLAYLIST}")


def format_duration(seconds: int | None) -> str:
    if not seconds:
        return ""
    m, s = divmod(int(seconds), 60)
    h, m = divmod(m, 60)
    if h:
        return f"{h} h {m} min"
    return f"{m} min {s} s" if s else f"{m} min"


def main() -> None:
    data = load_playlist()
    entries = sorted(data.get("entries") or [], key=lambda e: e.get("playlist_index") or 0)
    if not entries:
        raise SystemExit("Playlist sem entradas.")

    lessons: list[dict] = []
    seen_slugs: set[str] = set()
    for idx, entry in enumerate(entries, start=1):
        title = (entry.get("title") or f"Aula {idx}").strip()
        base = f"{idx:03d}-{slugify(title)}"
        slug = base
        n = 2
        while slug in seen_slugs:
            slug = f"{base}-{n}"
            n += 1
        seen_slugs.add(slug)
        vid = entry.get("id")
        dur = entry.get("duration")
        body = (
            f'<p class="course-text-muted text-sm">Duração aproximada: {format_duration(dur)}.</p>'
            if dur
            else None
        )
        lessons.append(
            {
                "slug": slug,
                "title": title,
                "videoId": vid,
                "durationSeconds": dur,
                "bodyHtml": body,
            }
        )

    modules: list[dict] = []
    for start in range(0, len(lessons), LESSONS_PER_MODULE):
        chunk = lessons[start : start + LESSONS_PER_MODULE]
        end = start + len(chunk)
        modules.append(
            {
                "title": f"Aulas {start + 1}–{end}",
                "lessons": chunk,
            }
        )

    channel = data.get("channel") or data.get("playlist_uploader") or "YouTube"
    thumbs = data.get("thumbnails") or entries[0].get("thumbnails") or []
    cover = thumbs[-1].get("url") if thumbs else f"https://i.ytimg.com/vi/{entries[0]['id']}/hqdefault.jpg"

    desc = (data.get("description") or "").strip()
    desc_html = "".join(f"<p>{line.strip()}</p>" for line in desc.splitlines() if line.strip())

    catalog = {
        "slug": "cabalas-rabino-dudu",
        "title": data.get("title") or "Cabalas — Rabino Dudu",
        "summary": (
            f"Trilha com {len(lessons)} aulas em vídeo do canal {channel}, "
            "sincronizada com a playlist oficial no YouTube (embed)."
        ),
        "playlistUrl": data.get("webpage_url") or PLAYLIST_URL,
        "channel": channel,
        "coverUrl": cover,
        "sortOrder": 4,
        "introModule": {
            "title": "Apresentação",
            "lessons": [
                {
                    "slug": "sobre-a-trilha",
                    "title": "Sobre a playlist e como estudar",
                    "lessonType": "article",
                    "bodyHtml": (
                        f"<p>Trilha montada a partir da playlist <strong>{data.get('title', '')}</strong> "
                        f"no canal <strong>{channel}</strong>. Os vídeos abrem embutidos do YouTube.</p>"
                        f'<p><a href="{PLAYLIST_URL}" target="_blank" rel="noopener noreferrer">'
                        "Abrir playlist no YouTube</a></p>"
                        + (desc_html if desc_html else "")
                    ),
                }
            ],
        },
        "modules": modules,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUT} ({len(modules)} módulos, {len(lessons)} vídeos)")


if __name__ == "__main__":
    main()
