import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, LayoutList, Plus, X } from "lucide-react";
import { ACADEMY_ADMIN_COURSES_BASE, ACADEMY_APP_BASE, COURSE_COVER, COURSES_UI } from "@ederson-agencia/shared";
import { apiGet, apiPatch, apiPost } from "../api";
import { CourseCover } from "../components/courses/CourseCover";
import "../styles/course-admin.css";

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
  sortOrder: number;
  enrollments: number;
};

type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
type CourseVisibility = "INTERNAL" | "PUBLIC_SALE";

type CourseForm = {
  slug: string;
  title: string;
  summary: string;
  status: CourseStatus;
  visibility: CourseVisibility;
  priceCents: string;
  coverUrl: string;
  sortOrder: string;
};

const emptyForm: CourseForm = {
  slug: "",
  title: "",
  summary: "",
  status: "DRAFT",
  visibility: "INTERNAL",
  priceCents: "",
  coverUrl: "",
  sortOrder: "0"
};

const UI = COURSES_UI.adminCourses;

function slugifyTitle(title: string) {
  return title
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function StatusBadge({ status }: { status: string }) {
  const label =
    status === "PUBLISHED" ? UI.statusPublished : status === "ARCHIVED" ? UI.statusArchived : UI.statusDraft;
  const mod = status === "PUBLISHED" ? "published" : status === "ARCHIVED" ? "archived" : "draft";
  return <span className={`course-admin__badge course-admin__badge--${mod}`}>{label}</span>;
}

function Field({
  label,
  hint,
  children
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="course-admin__field">
      <label>
        <span>{label}</span>
        {children}
        {hint ? <p className="course-admin__field-hint">{hint}</p> : null}
      </label>
    </div>
  );
}

export function AdminCoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [grantEmail, setGrantEmail] = useState<Record<string, string>>({});
  const [enrollOpenId, setEnrollOpenId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const editingCourse = editId ? courses.find((c) => c.id === editId) : null;
  const isFixedFl = editingCourse?.contentKey === "fl";

  const stats = useMemo(() => {
    const published = courses.filter((c) => c.status === "PUBLISHED").length;
    const draft = courses.filter((c) => c.status === "DRAFT").length;
    return { total: courses.length, published, draft };
  }, [courses]);

  async function refresh() {
    const data = await apiGet<{ courses: AdminCourse[] }>("/admin/courses");
    setCourses(data.courses);
  }

  useEffect(() => {
    void refresh()
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar."))
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setEditId(null);
    setForm({ ...emptyForm });
    setFormOpen(true);
    setError(null);
    setMessage(null);
  }

  function openEdit(course: AdminCourse) {
    setEditId(course.id);
    setForm({
      slug: course.slug,
      title: course.title,
      summary: course.summary ?? "",
      status: course.status as CourseStatus,
      visibility: course.visibility as CourseVisibility,
      priceCents: course.priceCents != null ? String(course.priceCents / 100) : "",
      coverUrl: course.coverUrl ?? "",
      sortOrder: String(course.sortOrder)
    });
    setFormOpen(true);
    setError(null);
    setMessage(null);
  }

  function closeForm() {
    setFormOpen(false);
    setEditId(null);
    setForm({ ...emptyForm });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);

    const payload = {
      slug: form.slug.trim(),
      title: form.title.trim(),
      summary: form.summary.trim() || null,
      status: form.status,
      visibility: form.visibility,
      sortOrder: Number(form.sortOrder) || 0,
      contentKey: isFixedFl ? "fl" : "portal",
      coverUrl: form.coverUrl.trim() || null,
      priceCents:
        form.visibility === "PUBLIC_SALE" ? Math.round(Number(form.priceCents.replace(",", ".")) * 100) : null
    };

    try {
      if (editId) {
        const { slug: _s, ...patch } = payload;
        await apiPatch(`/admin/courses/${editId}`, patch);
        setMessage(UI.updated);
        closeForm();
      } else {
        const res = await apiPost<{ course: { id: string } }>("/admin/courses", payload);
        setMessage(UI.created);
        closeForm();
        navigate(`${ACADEMY_ADMIN_COURSES_BASE}/${res.course.id}/conteudo`);
        return;
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function grantAccess(courseId: string) {
    const email = grantEmail[courseId]?.trim();
    if (!email) return;
    setError(null);
    try {
      await apiPost(`/admin/courses/${courseId}/enrollments`, { email });
      setMessage(`${UI.enrollOk} (${email})`);
      setGrantEmail((prev) => ({ ...prev, [courseId]: "" }));
      setEnrollOpenId(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao liberar acesso.");
    }
  }

  if (loading) {
    return <p className="text-sm text-[var(--app-text-muted)]">{UI.loading}</p>;
  }

  return (
    <div className="course-admin space-y-6">
      <header className="course-admin__header">
        <div>
          <Link
            to={ACADEMY_APP_BASE}
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-primary hover:underline"
          >
            ← {UI.backCatalog}
          </Link>
          <h1 className="course-admin__title mt-2">{UI.title}</h1>
          <p className="course-admin__subtitle">{UI.subtitle}</p>
        </div>
        {!formOpen ? (
          <button type="button" className="btn-primary inline-flex min-h-11 items-center gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden />
            {UI.newCourse}
          </button>
        ) : null}
      </header>

      <div className="course-admin__stats">
        <div className="course-admin__stat">
          <p className="course-admin__stat-label">Total</p>
          <p className="course-admin__stat-value">{stats.total}</p>
        </div>
        <div className="course-admin__stat">
          <p className="course-admin__stat-label">{UI.statusPublished}</p>
          <p className="course-admin__stat-value">{stats.published}</p>
        </div>
        <div className="course-admin__stat">
          <p className="course-admin__stat-label">{UI.statusDraft}</p>
          <p className="course-admin__stat-value">{stats.draft}</p>
        </div>
      </div>

      {message ? <div className="course-admin__alert course-admin__alert--ok">{message}</div> : null}
      {error ? <div className="course-admin__alert course-admin__alert--err">{error}</div> : null}

      {formOpen ? (
        <div className="course-admin__form-shell">
          <div className="course-admin__form-head">
            <h2>{editId ? UI.editCourse : UI.newCourse}</h2>
            <button type="button" className="btn-ghost inline-flex min-h-9 items-center gap-1 text-sm" onClick={closeForm}>
              <X className="h-4 w-4" aria-hidden />
              {UI.cancel}
            </button>
          </div>
          <form className="course-admin__form-body" onSubmit={(e) => void submit(e)}>
            {isFixedFl ? (
              <p className="course-admin__alert course-admin__alert--ok mb-4">{UI.fixedTrail}</p>
            ) : null}
            <div className="course-admin__form-grid">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={UI.fieldTitle}>
                    <input
                      className="input w-full"
                      value={form.title}
                      required
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      onBlur={() => {
                        if (!editId && !form.slug.trim() && form.title.trim()) {
                          setForm((f) => ({ ...f, slug: slugifyTitle(f.title) }));
                        }
                      }}
                    />
                  </Field>
                  <Field label={UI.fieldSlug} hint={UI.fieldSlugHint}>
                    <input
                      className="input w-full font-mono text-sm"
                      value={form.slug}
                      disabled={Boolean(editId)}
                      required
                      onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    />
                  </Field>
                </div>
                <Field label={UI.fieldSummary}>
                  <textarea
                    className="input w-full text-sm"
                    rows={4}
                    value={form.summary}
                    onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={UI.fieldStatus}>
                    <select
                      className="input w-full"
                      value={form.status}
                      onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as CourseStatus }))}
                    >
                      <option value="DRAFT">{UI.statusDraft}</option>
                      <option value="PUBLISHED">{UI.statusPublished}</option>
                      <option value="ARCHIVED">{UI.statusArchived}</option>
                    </select>
                  </Field>
                  <Field label={UI.fieldVisibility}>
                    <select
                      className="input w-full"
                      value={form.visibility}
                      onChange={(e) => setForm((f) => ({ ...f, visibility: e.target.value as CourseVisibility }))}
                    >
                      <option value="INTERNAL">{UI.visibilityInternal}</option>
                      <option value="PUBLIC_SALE">{UI.visibilitySale}</option>
                    </select>
                  </Field>
                  {form.visibility === "PUBLIC_SALE" ? (
                    <Field label={UI.fieldPrice}>
                      <input
                        className="input w-full"
                        inputMode="decimal"
                        value={form.priceCents}
                        required
                        onChange={(e) => setForm((f) => ({ ...f, priceCents: e.target.value }))}
                      />
                    </Field>
                  ) : null}
                  <Field label={UI.fieldSort}>
                    <input
                      className="input w-full"
                      type="number"
                      value={form.sortOrder}
                      onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                    />
                  </Field>
                </div>
              </div>
              <aside className="space-y-3">
                <Field label={UI.fieldCover} hint={COURSE_COVER.adminHint}>
                  <input
                    className="input w-full text-sm"
                    type="url"
                    placeholder="https://…"
                    value={form.coverUrl}
                    onChange={(e) => setForm((f) => ({ ...f, coverUrl: e.target.value }))}
                  />
                </Field>
                <div className="course-admin__cover-preview">
                  <CourseCover
                    title={form.title || "Curso"}
                    coverUrl={form.coverUrl.trim() || null}
                    className="course-cover--welcome"
                  />
                </div>
              </aside>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 border-t border-[var(--app-border)] pt-4">
              <button type="submit" className="btn-primary min-h-11" disabled={saving}>
                {editId ? UI.saveUpdate : UI.saveCreate}
              </button>
              <button type="button" className="btn-secondary min-h-11" onClick={closeForm}>
                {UI.cancel}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--app-text)]">{UI.listTitle}</h2>

        {courses.length === 0 ? (
          <div className="course-admin__empty">
            <p>{UI.listEmpty}</p>
            <button type="button" className="btn-primary mt-4 inline-flex items-center gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              {UI.newCourse}
            </button>
          </div>
        ) : (
          <div className="course-admin__table-wrap">
            <table className="course-admin__table">
              <thead>
                <tr>
                  <th>{UI.colCourse}</th>
                  <th>{UI.colStatus}</th>
                  <th>{UI.colAccess}</th>
                  <th className="text-right">{UI.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => {
                  const fixed = course.contentKey === "fl";
                  return (
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
                            {course.summary ? (
                              <p className="mt-1 line-clamp-2 text-xs text-[var(--app-text-muted)]">{course.summary}</p>
                            ) : null}
                          </div>
                        </div>
                        {enrollOpenId === course.id ? (
                          <div className="course-admin__enroll-row">
                            <input
                              className="input min-w-[12rem] flex-1 text-sm"
                              type="email"
                              placeholder={UI.enrollPlaceholder}
                              value={grantEmail[course.id] ?? ""}
                              onChange={(e) => setGrantEmail((p) => ({ ...p, [course.id]: e.target.value }))}
                            />
                            <button type="button" className="btn-primary text-sm" onClick={() => void grantAccess(course.id)}>
                              {UI.enrollSubmit}
                            </button>
                            <button type="button" className="btn-ghost text-sm" onClick={() => setEnrollOpenId(null)}>
                              {UI.cancel}
                            </button>
                          </div>
                        ) : null}
                      </td>
                      <td>
                        <div className="flex flex-col items-start gap-1.5">
                          <StatusBadge status={course.status} />
                          {fixed ? (
                            <span className="course-admin__badge course-admin__badge--fixed">{UI.fixedTrail}</span>
                          ) : null}
                        </div>
                      </td>
                      <td>
                        <p className="text-sm text-[var(--app-text-muted)]">
                          {course.visibility === "PUBLIC_SALE" ? UI.visibilitySale : UI.visibilityInternal}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--app-text-subtle)]">{UI.enrollments(course.enrollments)}</p>
                      </td>
                      <td>
                        <div className="course-admin__actions">
                          {!fixed ? (
                            <Link
                              to={`${ACADEMY_ADMIN_COURSES_BASE}/${course.id}/conteudo`}
                              className="btn-primary inline-flex items-center gap-1 text-xs"
                            >
                              <LayoutList className="h-3.5 w-3.5" aria-hidden />
                              {UI.actionContent}
                            </Link>
                          ) : null}
                          <Link
                            to={`${ACADEMY_APP_BASE}/cursos/${course.slug}`}
                            className="btn-secondary inline-flex items-center gap-1 text-xs"
                          >
                            <BookOpen className="h-3.5 w-3.5" aria-hidden />
                            {UI.actionPreview}
                          </Link>
                          <button type="button" className="btn-secondary text-xs" onClick={() => openEdit(course)}>
                            {UI.actionEdit}
                          </button>
                          {!fixed ? (
                            <button
                              type="button"
                              className="btn-ghost text-xs"
                              onClick={() => setEnrollOpenId(enrollOpenId === course.id ? null : course.id)}
                            >
                              {UI.actionEnroll}
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
