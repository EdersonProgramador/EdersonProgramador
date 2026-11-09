export type LessonPesquisaTab = "all" | "videos" | "news" | "books" | "scholar" | "trusted";

export type LessonPesquisaContext = {
  displayTitle: string;
  breadcrumb: string[];
};

const TRUSTED_SITES =
  "site:gov.br OR site:edu.br OR site:scielo.br OR site:brasilescola.uol.com.br OR site:khanacademy.org";

export function defaultLessonSearchQuery(displayTitle: string, breadcrumb: string[]): string {
  const discipline = breadcrumb[0]?.trim();
  const parts = [displayTitle.trim(), discipline, "ENEM"].filter(Boolean);
  return parts.join(" ");
}

function withTrustedSites(query: string): string {
  return `${query} (${TRUSTED_SITES})`;
}

/** Consulta otimizada para a aba Vídeos (YouTube + tema da aula). */
export function lessonYoutubeSearchQuery(
  query: string,
  displayTitle: string,
  breadcrumb: string[]
): string {
  const discipline = breadcrumb[0]?.trim();
  const anchor = defaultLessonSearchQuery(displayTitle, breadcrumb);
  let videoQ = (query.trim() || anchor).replace(/\s+/g, " ");

  const titleToken = displayTitle.trim().split(/\s+/).slice(0, 2).join(" ");
  if (titleToken && !videoQ.toLowerCase().includes(titleToken.toLowerCase())) {
    videoQ = `${displayTitle.trim()} ${videoQ}`;
  }

  if (discipline && !videoQ.toLowerCase().includes(discipline.toLowerCase())) {
    videoQ = `${discipline} ${videoQ}`;
  }

  if (!/\baula\b/i.test(videoQ)) videoQ = `${videoQ} aula`;
  if (!/\benem\b/i.test(videoQ)) videoQ = `${videoQ} ENEM`;

  return videoQ.replace(/\s+/g, " ").trim();
}

function buildYoutubeResultsUrl(videoQ: string): string {
  const url = new URL("https://www.youtube.com/results");
  url.searchParams.set("search_query", videoQ);
  return url.toString();
}

export function buildLessonGoogleSearchUrl(
  query: string,
  tab: LessonPesquisaTab,
  context?: LessonPesquisaContext
): string {
  const q = query.trim() || "ENEM";

  if (tab === "videos" && context) {
    const videoQ = lessonYoutubeSearchQuery(q, context.displayTitle, context.breadcrumb);
    return buildYoutubeResultsUrl(videoQ);
  }

  if (tab === "videos") {
    const url = new URL("https://www.google.com/search");
    url.searchParams.set("q", `site:youtube.com ${q} aula ENEM`);
    url.searchParams.set("igu", "1");
    url.searchParams.set("hl", "pt-BR");
    url.searchParams.set("tbm", "vid");
    return url.toString();
  }

  if (tab === "scholar") {
    const url = new URL("https://scholar.google.com/scholar");
    url.searchParams.set("q", q);
    url.searchParams.set("hl", "pt-BR");
    url.searchParams.set("as_sdt", "0,5");
    return url.toString();
  }

  const url = new URL("https://www.google.com/search");
  url.searchParams.set("q", tab === "trusted" ? withTrustedSites(q) : q);
  url.searchParams.set("igu", "1");
  url.searchParams.set("hl", "pt-BR");

  if (tab === "news") url.searchParams.set("tbm", "nws");
  else if (tab === "books") url.searchParams.set("tbm", "bks");

  return url.toString();
}

/** URL do iframe / abrir externo — inclui contexto da aula quando necessário. */
export function buildLessonPesquisaIframeUrl(
  query: string,
  tab: LessonPesquisaTab,
  context: LessonPesquisaContext
): string {
  return buildLessonGoogleSearchUrl(query, tab, context);
}
