import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ACADEMY_ADMIN_COURSES_BASE,
  ACADEMY_STORE_BASE,
  COURSES_UI,
  isAcademyInternalAdmin
} from "@ederson-agencia/shared";
import { CourseCatalogCard, type CourseCatalogItem } from "../components/courses/CourseCatalogCard";
import { CourseCatalogGridSkeleton } from "../components/courses/CourseCatalogCardSkeleton";
import { fetchMyCourses } from "../courses/catalog-cache";
import { useAcademySession } from "../stores/authStore";
import "../styles/course-study.css";

export function CoursesCatalogPage() {
  const academyUser = useAcademySession()?.user;
  const [courses, setCourses] = useState<CourseCatalogItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const list = await fetchMyCourses();
        if (!cancelled) setCourses(list);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar cursos.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="courses-academy space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">{COURSES_UI.catalog.title}</h1>
          <p className="course-text-muted mt-2 text-sm">{COURSES_UI.catalog.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {academyUser && isAcademyInternalAdmin(academyUser) ? (
            <>
              <a href={ACADEMY_STORE_BASE} className="btn-primary inline-flex min-h-11 items-center text-sm">
                {COURSES_UI.store.title}
              </a>
              <Link to={ACADEMY_ADMIN_COURSES_BASE} className="btn-secondary inline-flex min-h-11 items-center text-sm">
                Gerenciar cursos
              </Link>
            </>
          ) : null}
        </div>
      </div>

      {error ? <p className="text-red-300">{error}</p> : null}

      {loading ? (
        <CourseCatalogGridSkeleton count={Math.max(courses.length, 3)} />
      ) : courses.length > 0 ? (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <li key={course.id}>
              <CourseCatalogCard course={course} variant="mine" />
            </li>
          ))}
        </ul>
      ) : (
        <div className="panel space-y-4 p-6 text-center">
          <p className="course-text-subtle text-sm">{COURSES_UI.catalog.empty}</p>
          {academyUser && isAcademyInternalAdmin(academyUser) ? (
            <a href={ACADEMY_STORE_BASE} className="btn-secondary inline-flex min-h-11 items-center text-sm">
              {COURSES_UI.catalog.emptyStoreLink} →
            </a>
          ) : (
            <p className="course-text-muted text-xs leading-relaxed">{COURSES_UI.catalog.emptyStudentHint}</p>
          )}
        </div>
      )}
    </div>
  );
}
