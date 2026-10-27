/** Pacote FL em packages/courses-fl */
export const FL_CONTENT_KEY = "fl" as const;
/** Trilha editável no admin (Postgres) */
export const PORTAL_CONTENT_KEY = "portal" as const;

export type CourseContentKey = typeof FL_CONTENT_KEY | typeof PORTAL_CONTENT_KEY;

export function normalizeContentKey(contentKey: string | null | undefined): CourseContentKey | null {
  const raw = contentKey?.trim().toLowerCase();
  if (!raw || raw === FL_CONTENT_KEY) return FL_CONTENT_KEY;
  if (raw === PORTAL_CONTENT_KEY) return PORTAL_CONTENT_KEY;
  return null;
}

/** Legado: slugs de teste ou chaves inválidas → portal (conteúdo no admin). */
export function effectiveContentKey(contentKey: string | null | undefined): CourseContentKey {
  return normalizeContentKey(contentKey) ?? PORTAL_CONTENT_KEY;
}
