/** Capa 16:9 (padrão de vitrine de cursos). */
export function CourseCover({
  title,
  coverUrl,
  className = ""
}: {
  title: string;
  coverUrl?: string | null;
  className?: string;
}) {
  const initials = title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className={`course-cover ${className}`.trim()} aria-hidden={coverUrl ? undefined : true}>
      {coverUrl ? (
        <img src={coverUrl} alt="" className="course-cover__img" loading="lazy" decoding="async" />
      ) : (
        <div className="course-cover__placeholder">
          <span className="course-cover__initials">{initials || "EP"}</span>
        </div>
      )}
    </div>
  );
}
