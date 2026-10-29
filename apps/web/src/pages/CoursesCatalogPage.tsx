import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ACADEMY_ADMIN_COURSES_BASE,
  ACADEMY_STORE_BASE,
  COURSES_UI
} from "@ederson-agencia/shared";
import { apiGet } from "../api";
import { CourseCatalogCard, type CourseCatalogItem } from "../components/courses/CourseCatalogCard";
import { useAcademySession } from "../stores/authStore";
import "../styles/course-study.css";

export function CoursesCatalogPage() {
  const academyUser = useAcademySession()?.user;
  const [courses, setCourses] = useState<CourseCatalogItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const data = await apiGet<{ courses: CourseCatalogItem[] }>("/courses");
        setCourses(data.courses);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar cursos.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <p className="course-text-muted">{COURSES_UI.catalog.loading}</p>;
  }

  if (error) {
    return <p className="text-red-300">{error}</p>;
  }

  return (
    <div className="courses-academy space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">{COURSES_UI.catalog.title}</h1>
          <p className="course-text-muted mt-2 text-sm">{COURSES_UI.catalog.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={ACADEMY_STORE_BASE} className="btn-primary inline-flex min-h-11 items-center text-sm">
            {COURSES_UI.store.title}
          </Link>
          {academyUser?.role === "ADMIN" ? (
            <Link to={ACADEMY_ADMIN_COURSES_BASE} className="btn-secondary inline-flex min-h-11 items-center text-sm">
              Gerenciar cursos
            </Link>
          ) : null}
        </div>
      </div>

      {courses.length > 0 ? (
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
          <Link to={ACADEMY_STORE_BASE} className="btn-secondary inline-flex min-h-11 items-center text-sm">
            {COURSES_UI.catalog.emptyStoreLink} →
          </Link>
        </div>
      )}
    </div>
  );
}
