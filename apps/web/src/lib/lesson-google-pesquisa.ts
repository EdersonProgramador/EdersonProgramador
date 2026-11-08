export type LessonPesquisaTab = "all" | "videos" | "news" | "books" | "scholar" | "trusted";

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

export function buildLessonGoogleSearchUrl(query: string, tab: LessonPesquisaTab): string {
  const q = query.trim() || "ENEM";
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

  if (tab === "videos") url.searchParams.set("tbm", "vid");
  else if (tab === "news") url.searchParams.set("tbm", "nws");
  else if (tab === "books") url.searchParams.set("tbm", "bks");

  return url.toString();
}
