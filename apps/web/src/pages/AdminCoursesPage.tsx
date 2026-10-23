import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet, apiPatch, apiPost } from "../api";

type AdminCourse = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  status: string;
  visibility: string;
  priceCents: number | null;
  contentKey: string | null;
  sortOrder: number;
  enrollments: number;
};

const emptyForm = {
  slug: "",
  title: "",
  summary: "",
  status: "DRAFT" as const,
  visibility: "INTERNAL" as const,
  priceCents: "",
  contentKey: "",
  sortOrder: "0"
};

export function AdminCoursesPage() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [grantEmail, setGrantEmail] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const data = await apiGet<{ courses: AdminCourse[] }>("/admin/courses");
    setCourses(data.courses);
  }

  useEffect(() => {
    void refresh().catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar."));
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    const payload = {
      slug: form.slug.trim(),
      title: form.title.trim(),
      summary: form.summary.trim() || null,
      status: form.status,
      visibility: form.visibility,
      sortOrder: Number(form.sortOrder) || 0,
      contentKey: form.contentKey.trim() || null,
      priceCents:
        form.visibility === "PUBLIC_SALE" ? Math.round(Number(form.priceCents.replace(",", ".")) * 100) : null
    };

    try {
      if (editId) {
        const { slug: _s, ...patch } = payload;
        await apiPatch(`/admin/courses/${editId}`, patch);
        setMessage("Curso atualizado.");
      } else {
        await apiPost("/admin/courses", payload);
        setMessage("Curso criado.");
      }
      setForm({ ...emptyForm });
      setEditId(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar.");
    }
  }

  function startEdit(course: AdminCourse) {
    setEditId(course.id);
    setForm({
      slug: course.slug,
      title: course.title,
      summary: course.summary ?? "",
      status: course.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
      visibility: course.visibility as "INTERNAL" | "PUBLIC_SALE",
      priceCents: course.priceCents != null ? String(course.priceCents / 100) : "",
      contentKey: course.contentKey ?? "",
      sortOrder: String(course.sortOrder)
    });
  }

  async function grantAccess(courseId: string) {
    const email = grantEmail[courseId]?.trim();
    if (!email) return;
    setError(null);
    try {
      await apiPost(`/admin/courses/${courseId}/enrollments`, { email });
      setMessage(`Acesso liberado para ${email}.`);
      setGrantEmail((prev) => ({ ...prev, [courseId]: "" }));
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao liberar acesso.");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <Link to="/app/admin" className="text-sm text-brand-primary hover:underline">
          ← Administração
        </Link>
        <h1 className="mt-2 text-3xl font-bold">Cursos online</h1>
        <p className="text-white/60">
          Cadastre trilhas internas ou marque como venda pública (checkout PIX/cartão/boleto em integração).
        </p>
      </div>

      {message ? <p className="text-sm text-green-300">{message}</p> : null}
      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <form className="panel space-y-4 p-6" onSubmit={(e) => void submit(e)}>
        <h2 className="text-lg font-semibold">{editId ? "Editar curso" : "Novo curso"}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <input
            className="input"
            placeholder="slug-do-curso"
            value={form.slug}
            disabled={Boolean(editId)}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            required
          />
          <input
            className="input"
            placeholder="Título"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
          <textarea
            className="input md:col-span-2"
            placeholder="Resumo"
            rows={2}
            value={form.summary}
            onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
          />
          <select className="input" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as typeof f.status }))}>
            <option value="DRAFT">Rascunho</option>
            <option value="PUBLISHED">Publicado</option>
            <option value="ARCHIVED">Arquivado</option>
          </select>
          <select
            className="input"
            value={form.visibility}
            onChange={(e) => setForm((f) => ({ ...f, visibility: e.target.value as typeof f.visibility }))}
          >
            <option value="INTERNAL">Interno (time logado)</option>
            <option value="PUBLIC_SALE">Venda pública</option>
          </select>
          {form.visibility === "PUBLIC_SALE" ? (
            <input
              className="input"
              placeholder="Preço (R$)"
              inputMode="decimal"
              value={form.priceCents}
              onChange={(e) => setForm((f) => ({ ...f, priceCents: e.target.value }))}
              required
            />
          ) : null}
          <input
            className="input"
            placeholder="contentKey (ex: fl)"
            value={form.contentKey}
            onChange={(e) => setForm((f) => ({ ...f, contentKey: e.target.value }))}
          />
          <input
            className="input"
            type="number"
            placeholder="Ordem"
            value={form.sortOrder}
            onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="btn-primary">
            {editId ? "Salvar" : "Criar curso"}
          </button>
          {editId ? (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setEditId(null);
                setForm({ ...emptyForm });
              }}
            >
              Cancelar
            </button>
          ) : null}
        </div>
      </form>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Catálogo</h2>
        {courses.map((course) => (
          <article key={course.id} className="panel space-y-3 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {course.title}{" "}
                  <span className="text-xs text-white/50">
                    · {course.status} · {course.visibility}
                  </span>
                </p>
                <p className="font-mono text-xs text-brand-primary">{course.slug}</p>
                {course.summary ? <p className="mt-1 text-sm text-white/60">{course.summary}</p> : null}
                <p className="mt-1 text-xs text-white/40">
                  Matrículas: {course.enrollments} · contentKey: {course.contentKey ?? "—"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to={`/app/cursos/${course.slug}`} className="btn-secondary text-sm">
                  Abrir trilha
                </Link>
                <button type="button" className="btn-secondary text-sm" onClick={() => startEdit(course)}>
                  Editar
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-white/10 pt-3">
              <input
                className="input max-w-xs text-sm"
                type="email"
                placeholder="E-mail para liberar acesso"
                value={grantEmail[course.id] ?? ""}
                onChange={(e) => setGrantEmail((p) => ({ ...p, [course.id]: e.target.value }))}
              />
              <button type="button" className="btn-secondary text-sm" onClick={() => void grantAccess(course.id)}>
                Liberar matrícula
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
