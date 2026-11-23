import { resolveCourseCoverUrl } from "@ederson-agencia/shared";

/** Capa 16:9 (padrão de vitrine de cursos). */
export function CourseCover({
  title,
  coverUrl,
  courseSlug,
  className = ""
}: {
  title: string;
  coverUrl?: string | null;
  /** Quando informado, aplica capas canônicas do monorepo (ex.: Tanar). */
  courseSlug?: string;
  className?: string;
}) {
  const resolvedCover = courseSlug ? resolveCourseCoverUrl(courseSlug, coverUrl) : coverUrl;
  const initials = title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className={`course-cover ${className}`.trim()} aria-hidden={resolvedCover ? undefined : true}>
      {resolvedCover ? (
        <img src={resolvedCover} alt="" className="course-cover__img" loading="lazy" decoding="async" />
      ) : (
        <div className="course-cover__placeholder">
          <span className="course-cover__initials">{initials || "EP"}</span>
        </div>
      )}
    </div>
  );
}
