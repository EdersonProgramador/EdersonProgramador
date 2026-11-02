export function CourseCatalogCardSkeleton() {
  return (
    <div className="course-card course-card--skeleton panel flex h-full flex-col p-0" aria-hidden>
      <div className="course-cover course-cover--card course-card__shimmer" />
      <div className="flex flex-1 flex-col space-y-3 p-4 sm:p-6">
        <div className="course-card__shimmer h-3 w-24 rounded" />
        <div className="course-card__shimmer h-5 w-full max-w-[16rem] rounded" />
        <div className="course-card__shimmer h-3 w-full rounded" />
        <div className="course-card__shimmer h-3 w-4/5 rounded" />
        <div className="course-card__shimmer mt-auto h-11 w-full rounded-lg sm:w-36" />
      </div>
    </div>
  );
}

export function CourseCatalogGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Carregando cursos">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <CourseCatalogCardSkeleton />
        </li>
      ))}
    </ul>
  );
}
