import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ExternalLink, LayoutList } from "lucide-react";
import {
  ACADEMY_ADMIN_COURSES_BASE,
  ACADEMY_APP_BASE,
  ACADEMY_STORE_BASE,
  COURSES_UI
} from "@ederson-agencia/shared";
import { apiGet } from "../api";
import { CourseCover } from "../components/courses/CourseCover";
import "../styles/course-admin.css";
import "../styles/academy-portal.css";

type AdminCourse = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  status: string;
  visibility: string;
  priceCents: number | null;
  contentKey: string | null;
  coverUrl: string | null;
  enrollments: number;
};

const UI = COURSES_UI.internalAnalysis;
const ADMIN = COURSES_UI.adminCourses;

function StatusBadge({ status }: { status: string }) {
  const label =
    status === "PUBLISHED" ? ADMIN.statusPublished : status === "ARCHIVED" ? ADMIN.statusArchived : ADMIN.statusDraft;
  const mod = status === "PUBLISHED" ? "published" : status === "ARCHIVED" ? "archived" : "draft";
  return <span className={`course-admin__badge course-admin__badge--${mod}`}>{label}</span>;
}

function formatPrice(cents: number | null) {
  if (cents == null || cents <= 0) return "—";
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** /academia/vitrine — análise operacional (admin), não vitrine de matrícula. */
export function AcademyInternalVitrinePage() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo(() => {
    const published = courses.filter((c) => c.status === "PUBLISHED").length;
    const draft = courses.filter((c) => c.status === "DRAFT").length;
    const sale = courses.filter((c) => c.visibility === "PUBLIC_SALE").length;
    const enrollments = courses.reduce((s, c) => s + c.enrollments, 0);
    return { total: courses.length, published, draft, sale, enrollments };
  }, [courses]);

  useEffect(() => {
    void (async () => {
      try {
        const data = await apiGet<{ courses: AdminCourse[] }>("/admin/courses");
        setCourses(data.courses);
      } catch (err) {
        setError(err instanceof Error ? err.message : UI.loading);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <p className="text-sm text-[var(--app-text-muted)]">{UI.loading}</p>;
  }

  return (
    <div className="course-admin courses-academy space-y-6">
      <header className="course-admin__header">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-indigo-600">{UI.kicker}</p>
          <h1 className="course-admin__title mt-2">{UI.title}</h1>
          <p className="course-admin__subtitle">{UI.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={ACADEMY_APP_BASE} className="btn-secondary inline-flex min-h-11 items-center px-5 text-sm font-bold">
            {UI.backCatalog}
          </Link>
          <Link
            to={ACADEMY_ADMIN_COURSES_BASE}
            className="btn-primary inline-flex min-h-11 items-center px-5 text-sm font-bold"
          >
            {UI.manage}
          </Link>
        </div>
      </header>

      <div className="course-admin__stats">
        <div className="course-admin__stat">
          <p className="course-admin__stat-label">Total</p>
          <p className="course-admin__stat-value">{stats.total}</p>
        </div>
        <div className="course-admin__stat">
          <p className="course-admin__stat-label">{UI.statsPublished}</p>
          <p className="course-admin__stat-value">{stats.published}</p>
        </div>
        <div className="course-admin__stat">
          <p className="course-admin__stat-label">{UI.statsDraft}</p>
          <p className="course-admin__stat-value">{stats.draft}</p>
        </div>
        <div className="course-admin__stat">
          <p className="course-admin__stat-label">{UI.statsSale}</p>
          <p className="course-admin__stat-value">{stats.sale}</p>
        </div>
        <div className="course-admin__stat">
          <p className="course-admin__stat-label">Matrículas</p>
          <p className="course-admin__stat-value">{stats.enrollments}</p>
        </div>
      </div>

      {error ? <div className="course-admin__alert course-admin__alert--err">{error}</div> : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--app-text)]">{UI.listTitle}</h2>

        {courses.length === 0 ? (
          <div className="course-admin__empty">
            <p>{UI.listEmpty}</p>
            <Link to={ACADEMY_ADMIN_COURSES_BASE} className="btn-primary mt-4 inline-flex min-h-11 items-center px-5">
              {UI.manage}
            </Link>
          </div>
        ) : (
          <div className="course-admin__table-wrap">
            <table className="course-admin__table">
              <thead>
                <tr>
                  <th>{ADMIN.colCourse}</th>
                  <th>{ADMIN.colStatus}</th>
                  <th>{ADMIN.colAccess}</th>
                  <th>Investimento</th>
                  <th className="text-right">{ADMIN.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <div className="course-admin__course-cell">
                        <CourseCover
                          title={course.title}
                          coverUrl={course.coverUrl}
                          className="course-cover--admin-thumb shrink-0"
                        />
                        <div className="course-admin__course-meta">
                          <p className="course-admin__course-name">{course.title}</p>
                          <p className="course-admin__course-slug">{course.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={course.status} />
                    </td>
                    <td>
                      <p className="text-sm text-[var(--app-text-muted)]">
                        {course.visibility === "PUBLIC_SALE" ? ADMIN.visibilitySale : ADMIN.visibilityInternal}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--app-text-subtle)]">
                        {ADMIN.enrollments(course.enrollments)}
                      </p>
                    </td>
                    <td className="text-sm text-[var(--app-text-muted)]">{formatPrice(course.priceCents)}</td>
                    <td>
                      <div className="course-admin__actions">
                        {course.contentKey !== "fl" ? (
                          <Link
                            to={`${ACADEMY_ADMIN_COURSES_BASE}/${course.id}/conteudo`}
                            className="btn-primary inline-flex items-center gap-1 text-xs"
                          >
                            <LayoutList className="h-3.5 w-3.5" aria-hidden />
                            {ADMIN.actionContent}
                          </Link>
                        ) : null}
                        <Link
                          to={`${ACADEMY_APP_BASE}/cursos/${course.slug}`}
                          className="btn-secondary inline-flex items-center gap-1 text-xs"
                        >
                          <BookOpen className="h-3.5 w-3.5" aria-hidden />
                          {ADMIN.actionPreview}
                        </Link>
                        {course.visibility === "PUBLIC_SALE" && course.status === "PUBLISHED" ? (
                          <a
                            href={`${ACADEMY_STORE_BASE}/${encodeURIComponent(course.slug)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-ghost inline-flex items-center gap-1 text-xs"
                          >
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                            {UI.publicPage}
                          </a>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}