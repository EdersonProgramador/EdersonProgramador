"""Gera apps/api/src/courses/catalog/usp-leitura-escrita.json a partir de playlist.json (yt-dlp)."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PLAYLIST = ROOT / "playlist.json"
OUT = ROOT / "apps/api/src/courses/catalog/usp-leitura-escrita.json"

pat = re.compile(r"^(.*?)\s*\(Aula\s*(\d+),\s*parte\s*(\d+)\)\s*$", re.I)


def main() -> None:
    d = json.loads(PLAYLIST.read_text(encoding="utf-8-sig"))
    modules: dict[int, dict] = {}
    for e in d["entries"]:
        m = pat.match(e["title"])
        if not m:
            raise SystemExit(f"Título fora do padrão: {e['title']!r}")
        theme, aula, parte = m.group(1).strip(), int(m.group(2)), int(m.group(3))
        if aula not in modules:
            modules[aula] = {
                "aula": aula,
                "title": f"Aula {aula}: {theme}",
                "lessons": [],
            }
        modules[aula]["lessons"].append(
            {
                "slug": f"aula-{aula:02d}-parte-{parte}",
                "title": e["title"],
                "videoId": e["id"],
                "durationSeconds": e.get("duration"),
            }
        )

    desc = (d.get("description") or "").strip()
    desc_html = "".join(f"<p>{line.strip()}</p>" for line in desc.splitlines() if line.strip())
    playlist_url = d.get("webpage_url") or d.get("original_url") or ""

    catalog = {
        "slug": "praticas-leitura-escrita-academicas-usp",
        "title": d["title"],
        "summary": (
            "Disciplina da USP (FLF0506) sobre leitura e escrita acadêmicas nas humanidades. "
            "Aulas gravadas no 2º semestre de 2017 (Canal USP)."
        ),
        "playlistUrl": playlist_url,
        "channel": d.get("channel"),
        "coverUrl": "/course-covers/praticas-leitura-escrita-academicas-usp.png",
        "sortOrder": 2,
        "introModule": {
            "title": "Apresentação",
            "lessons": [
                {
                    "slug": "sobre-o-curso",
                    "title": "Sobre a disciplina e a playlist",
                    "lessonType": "article",
                    "bodyHtml": (
                        "<p>Trilha organizada a partir da playlist oficial do <strong>Canal USP</strong>. "
                        "Os vídeos são reproduzidos via YouTube embutido.</p>"
                        '<p><a href="https://uspdigital.usp.br/jupiterweb/obterDisciplina?sgldis=FLF0506" '
                        'target="_blank" rel="noopener noreferrer">Programa FLF0506 na USP</a></p>'
                        f'<p><a href="{playlist_url}" target="_blank" rel="noopener noreferrer">'
                        "Abrir playlist no YouTube</a></p>"
                        + (desc_html if desc_html else "")
                    ),
                }
            ],
        },
        "modules": [{"title": m["title"], "lessons": m["lessons"]} for m in sorted(modules.values(), key=lambda x: x["aula"])],
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUT} ({len(catalog['modules'])} módulos de aula + intro)")


if __name__ == "__main__":
    main()
