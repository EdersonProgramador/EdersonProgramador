/** Extrai o ID de 11 caracteres de URLs watch/youtu.be ou devolve o próprio id. */
export function parseYoutubeVideoId(urlOrId: string | null | undefined): string | null {
  if (!urlOrId?.trim()) return null;
  const raw = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      const v = u.searchParams.get("v");
      if (v) return v;
      const embed = u.pathname.match(/^\/embed\/([a-zA-Z0-9_-]{11})/);
      if (embed) return embed[1];
    }
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      if (id) return id;
    }
  } catch {
    return null;
  }
  return null;
}

export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
}

export function isYoutubeUrl(url: string | null | undefined): boolean {
  return parseYoutubeVideoId(url) != null;
}
