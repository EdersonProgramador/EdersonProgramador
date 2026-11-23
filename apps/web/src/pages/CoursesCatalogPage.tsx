import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ACADEMY_ADMIN_COURSES_BASE,
  ACADEMY_STORE_BASE,
  ACADEMY_VITRINE_PATH,
  COURSES_UI,
  isAcademyInternalAdmin
} from "@ederson-agencia/shared";
import { CourseCatalogCard, type CourseCatalogItem } from "../components/courses/CourseCatalogCard";
import { CourseCatalogGridSkeleton } from "../components/courses/CourseCatalogCardSkeleton";
import { fetchMyCourses } from "../courses/catalog-cache";
import { useAcademySession } from "../stores/authStore";
import "../styles/course-study.css";
import "../styles/academy-portal.css";

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
    <div className="courses-academy space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-xl">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-indigo-600">Academia</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            {COURSES_UI.catalog.title}
          </h1>
          <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500 sm:text-base">
            {COURSES_UI.catalog.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {academyUser && isAcademyInternalAdmin(academyUser) ? (
            <>
              <a href={ACADEMY_VITRINE_PATH} className="btn-primary inline-flex min-h-11 items-center px-5 text-sm font-bold">
                {COURSES_UI.internalAnalysis.title}
              </a>
              <a
                href={ACADEMY_ADMIN_COURSES_BASE}
                className="btn-secondary inline-flex min-h-11 items-center px-5 text-sm font-bold"
              >
                Gerenciar cursos
              </a>
            </>
          ) : null}
        </div>
      </div>

      {error ? <p className="text-sm font-bold text-rose-600">{error}</p> : null}

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
        <div className="panel space-y-4 rounded-3xl p-8 text-center">
          <p className="text-sm font-medium text-slate-500">{COURSES_UI.catalog.empty}</p>
          {academyUser && isAcademyInternalAdmin(academyUser) ? (
            <a href={ACADEMY_VITRINE_PATH} className="btn-secondary inline-flex min-h-11 items-center text-sm font-bold">
              {COURSES_UI.internalAnalysis.title} →
            </a>
          ) : (
            <p className="text-xs font-medium leading-relaxed text-slate-400">{COURSES_UI.catalog.emptyStudentHint}</p>
          )}
        </div>
      )}
    </div>
  );
}
