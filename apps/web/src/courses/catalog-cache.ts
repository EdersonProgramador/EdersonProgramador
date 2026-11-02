import { apiGet } from "../api";
import type { CourseCatalogItem } from "../components/courses/CourseCatalogCard";

const CACHE_TTL_MS = 90_000;

let mineCache: { at: number; courses: CourseCatalogItem[] } | null = null;
let mineInflight: Promise<CourseCatalogItem[]> | null = null;

export function invalidateMyCoursesCatalog() {
  mineCache = null;
  mineInflight = null;
}

/** Lista "Meus cursos" — deduplica requests e reutiliza cache curto. */
export async function fetchMyCourses(options?: { force?: boolean }): Promise<CourseCatalogItem[]> {
  const force = options?.force ?? false;
  if (!force && mineCache && Date.now() - mineCache.at < CACHE_TTL_MS) {
    return mineCache.courses;
  }
  if (!force && mineInflight) return mineInflight;

  mineInflight = apiGet<{ courses: CourseCatalogItem[] }>("/courses")
    .then((data) => {
      mineCache = { at: Date.now(), courses: data.courses };
      return data.courses;
    })
    .finally(() => {
      mineInflight = null;
    });

  return mineInflight;
}

/** Dispara fetch cedo (ex.: ao montar o shell) para aquecer cache antes da página. */
export function prefetchMyCourses() {
  void fetchMyCourses().catch(() => {});
}
