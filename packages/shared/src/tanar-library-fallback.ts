import { TANAR_COURSE } from "./courses-copy.js";

export const TANAR_BIBLIA_HEBRAICA = {
  slug: "biblia-hebraica-gorodovits",
  title: "Bíblia Hebraica",
  author: "David Gorodovits",
  summary: "Edição de referência para leitura paralela hebraico-português na trilha Tanar.",
  coverUrl: "/course-covers/tanar-tanakh.jpg",
  /** Servido pelo front (Vite/CDN) — leitura direta quando a API ainda não listou o livro. */
  publicPdfPath: "/course-materials/tanar/biblia-hebraica-gorodovits.pdf"
} as const;

export type TanarLibraryBookLike = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  author?: string | null;
  summary?: string | null;
  coverUrl?: string | null;
  pageCount?: number | null;
  lastPage?: number;
  pdfStreamPath?: string;
  /** PDF estático no mesmo host do front (fallback). */
  publicPdfPath?: string;
};

export function mergeTanarLibraryBooks(
  courseSlug: string,
  books: TanarLibraryBookLike[]
): TanarLibraryBookLike[] {
  if (courseSlug !== TANAR_COURSE.slug) return books;
  if (books.some((b) => b.slug === TANAR_BIBLIA_HEBRAICA.slug)) return books;

  const fallback: TanarLibraryBookLike = {
    id: `fallback-${TANAR_BIBLIA_HEBRAICA.slug}`,
    slug: TANAR_BIBLIA_HEBRAICA.slug,
    title: TANAR_BIBLIA_HEBRAICA.title,
    subtitle: null,
    author: TANAR_BIBLIA_HEBRAICA.author,
    summary: TANAR_BIBLIA_HEBRAICA.summary,
    coverUrl: TANAR_BIBLIA_HEBRAICA.coverUrl,
    pageCount: null,
    publicPdfPath: TANAR_BIBLIA_HEBRAICA.publicPdfPath
  };

  return [fallback, ...books];
}

/** PDF servido pelo front (public/) — evita proxy Render quando o arquivo já está no Vite. */
export function resolveTanarLibraryPdfUrl(
  courseSlug: string,
  bookSlug: string,
  apiPdfUrl: string
): string {
  if (courseSlug === TANAR_COURSE.slug && bookSlug === TANAR_BIBLIA_HEBRAICA.slug) {
    return TANAR_BIBLIA_HEBRAICA.publicPdfPath;
  }
  return apiPdfUrl;
}

export function tanarLibraryBookDetailFallback(
  courseSlug: string,
  bookSlug: string
): TanarLibraryBookLike | null {
  if (courseSlug !== TANAR_COURSE.slug || bookSlug !== TANAR_BIBLIA_HEBRAICA.slug) return null;
  return {
    id: `fallback-${TANAR_BIBLIA_HEBRAICA.slug}`,
    slug: TANAR_BIBLIA_HEBRAICA.slug,
    title: TANAR_BIBLIA_HEBRAICA.title,
    subtitle: null,
    author: TANAR_BIBLIA_HEBRAICA.author,
    summary: TANAR_BIBLIA_HEBRAICA.summary,
    coverUrl: TANAR_BIBLIA_HEBRAICA.coverUrl,
    pageCount: null,
    lastPage: 1,
    publicPdfPath: TANAR_BIBLIA_HEBRAICA.publicPdfPath
  };
}
