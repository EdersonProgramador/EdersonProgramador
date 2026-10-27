/** Chaves de conteúdo empacotado no monorepo (packages/courses-fl). */
export const FL_CONTENT_KEY = "fl" as const;

export type SupportedContentKey = typeof FL_CONTENT_KEY;

export function resolveCourseContentKey(contentKey: string | null | undefined): SupportedContentKey | null {
  const normalized = contentKey?.trim() || FL_CONTENT_KEY;
  if (normalized === FL_CONTENT_KEY) return FL_CONTENT_KEY;
  return null;
}
