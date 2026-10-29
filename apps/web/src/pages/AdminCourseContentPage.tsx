import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ACADEMY_APP_BASE, AGENCY_APP_BASE } from "@ederson-agencia/shared";
import { AdminCourseLibraryPanel } from "../components/admin/AdminCourseLibraryPanel";
import { apiDelete, apiGet, apiPatch, apiPost } from "../api";
import "../styles/course-study.css";

type LessonType = "article" | "video" | "document";
type LessonStatus = "DRAFT" | "PUBLISHED";

type ContentLesson = {
  id: string;
  slug: string;
  title: string;
  lessonKey: string | null;
  sortOrder: number;
  lessonType: LessonType;
  status: LessonStatus;
  bodyHtml: string | null;
  videoUrl: string | null;
  documentUrl: string | null;
  telegramRef: string | null;
};

type ContentModule = {
  id: string;
  title: string;
  sortOrder: number;
  lessons: ContentLesson[];
};

type ContentResponse = {
  course: { id: string; slug: string; title: string; contentKey: string | null; status: string };
  stats: { modules: number; lessons: number; published: number };
  modules: ContentModule[];
};

const emptyLessonForm = {
  slug: "",
  title: "",
  lessonType: "article" as LessonType,
  status: "DRAFT" as LessonStatus,
  bodyHtml: "",
  videoUrl: "",
  documentUrl: ""
};

export function AdminCourseContentPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [data, setData] = useState<ContentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [moduleTitle, setModuleTitle] = useState("");
  const [addingLessonModuleId, setAddingLessonModuleId] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState({ ...emptyLessonForm });
  const [editLessonId, setEditLessonId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!courseId) return;
    const res = await apiGet<ContentResponse>(`/admin/courses/${courseId}/content`);
    setData(res);
  }, [courseId]);

  useEffect(() => {
    if (!courseId) return;
    void refresh().catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar."));
  }, [courseId, refresh]);

  async function runAction(fn: () => Promise<void>, okMsg: string) {
    setError(null);
    setMessage(null);
    try {
      await fn();
      setMessage(okMsg);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha na operação.");
    }
  }

  async function createModule(event: React.FormEvent) {
    event.preventDefault();
    if (!courseId || !moduleTitle.trim()) return;
    await runAction(async () => {
      await apiPost(`/admin/courses/${courseId}/modules`, { title: moduleTitle.trim() });
      setModuleTitle("");
    }, "Módulo criado.");
  }

  async function deleteModule(moduleId: string) {
    if (!courseId || !confirm("Excluir módulo e todas as aulas?")) return;
    await runAction(async () => {
      await apiDelete(`/admin/courses/${courseId}/modules/${moduleId}`);
    }, "Módulo removido.");
  }

  async function createLesson(moduleId: string, event: React.FormEvent) {
    event.preventDefault();
    if (!courseId) return;
    await runAction(async () => {
      await apiPost(`/admin/courses/${courseId}/modules/${moduleId}/lessons`, {
        slug: lessonForm.slug.trim(),
        title: lessonForm.title.trim(),
        lessonType: lessonForm.lessonType,
        status: lessonForm.status,
        bodyHtml: lessonForm.bodyHtml.trim() || null,
        videoUrl: lessonForm.videoUrl.trim() || null,
        documentUrl: lessonForm.documentUrl.trim() || null
      });
      setLessonForm({ ...emptyLessonForm });
      setAddingLessonModuleId(null);
    }, "Aula criada.");
  }

  function startEditLesson(lesson: ContentLesson) {
    setEditLessonId(lesson.id);
    setLessonForm({
      slug: lesson.slug,
      title: lesson.title,
      lessonType: lesson.lessonType,
      status: lesson.status,
      bodyHtml: lesson.bodyHtml ?? "",
      videoUrl: lesson.videoUrl ?? "",
      documentUrl: lesson.documentUrl ?? ""
    });
    setAddingLessonModuleId(null);
  }

  async function saveLesson(event: React.FormEvent) {
    event.preventDefault();
    if (!courseId || !editLessonId) return;
    await runAction(async () => {
      await apiPatch(`/admin/courses/${courseId}/lessons/${editLessonId}`, {
        title: lessonForm.title.trim(),
        lessonType: lessonForm.lessonType,
        status: lessonForm.status,
        bodyHtml: lessonForm.bodyHtml.trim() || null,
        videoUrl: lessonForm.videoUrl.trim() || null,
        documentUrl: lessonForm.documentUrl.trim() || null
      });
      setEditLessonId(null);
      setLessonForm({ ...emptyLessonForm });
    }, "Aula atualizada.");
  }

  async function deleteLesson(lessonId: string) {
    if (!courseId || !confirm("Excluir esta aula?")) return;
    await runAction(async () => {
      await apiDelete(`/admin/courses/${courseId}/lessons/${lessonId}`);
      if (editLessonId === lessonId) {
        setEditLessonId(null);
        setLessonForm({ ...emptyLessonForm });
      }
    }, "Aula removida.");
  }

  if (!courseId) {
    return <p className="text-red-300">Curso inválido.</p>;
  }

  const course = data?.course;

  return (
    <div className="courses-academy space-y-8">
      <div>
        <Link to={`${AGENCY_APP_BASE}/admin/cursos`} className="text-sm text-brand-primary hover:underline">
          ← Gestão da academia
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-white">Conteúdo do curso</h1>
        {course ? (
          <p className="course-text-muted text-sm leading-relaxed">
            {course.title}{" "}
            <span className="font-mono text-brand-primary">({course.slug})</span>
            {" · "}
            contentKey: {course.contentKey ?? "—"}
          </p>
        ) : null}
      </div>

      {message ? <p className="text-sm text-green-300">{message}</p> : null}
      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      {data ? (
        <div className="flex flex-wrap gap-2">
          <p className="course-text-faint w-full text-xs">
            {data.stats.modules} módulos · {data.stats.lessons} aulas · {data.stats.published} publicadas
          </p>
          <button
            type="button"
            className="btn-secondary text-sm"
            onClick={() =>
              void runAction(async () => {
                await apiPost(`/admin/courses/${courseId}/content/publish-all`, {});
              }, "Rascunhos publicados.")
            }
          >
            Publicar todas as aulas
          </button>
          {data.stats.modules === 0 ? (
            <button
              type="button"
              className="btn-secondary text-sm"
              onClick={() =>
                void runAction(async () => {
                  await apiPost(`/admin/courses/${courseId}/content/starter`, {});
                }, "Conteúdo inicial criado.")
              }
            >
              Criar módulo de boas-vindas
            </button>
          ) : null}
          {course ? (
            <Link to={`${ACADEMY_APP_BASE}/cursos/${course.slug}`} className="btn-secondary text-sm">
              Ver trilha
            </Link>
          ) : null}
        </div>
      ) : null}

      <form className="panel flex flex-wrap items-end gap-3 p-4" onSubmit={(e) => void createModule(e)}>
        <div className="min-w-[200px] flex-1">
          <label className="course-text-muted mb-1 block text-xs">Novo módulo</label>
          <input
            className="input w-full"
            placeholder="Título do módulo"
            value={moduleTitle}
            onChange={(e) => setModuleTitle(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary">
          Adicionar módulo
        </button>
      </form>

      {editLessonId ? (
        <LessonEditor
          title="Editar aula"
          slugDisabled
          form={lessonForm}
          setForm={setLessonForm}
          onSubmit={(e) => void saveLesson(e)}
          onCancel={() => {
            setEditLessonId(null);
            setLessonForm({ ...emptyLessonForm });
          }}
        />
      ) : null}

      <div className="space-y-6">
        {data?.modules.map((mod) => (
          <section key={mod.id} className="panel space-y-4 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">{mod.title}</h2>
              <button type="button" className="text-sm text-red-300 hover:underline" onClick={() => void deleteModule(mod.id)}>
                Excluir módulo
              </button>
            </div>

            <ul className="space-y-2">
              {mod.lessons.map((lesson) => (
                <li
                  key={lesson.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2"
                >
                  <div>
                    <p className="font-medium">{lesson.title}</p>
                    <p className="course-text-faint font-mono text-xs">
                      {lesson.slug} · {lesson.lessonType} · {lesson.status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="btn-secondary text-xs" onClick={() => startEditLesson(lesson)}>
                      Editar
                    </button>
                    <button type="button" className="text-xs text-red-300 hover:underline" onClick={() => void deleteLesson(lesson.id)}>
                      Excluir
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {addingLessonModuleId === mod.id ? (
              <LessonEditor
                title="Nova aula"
                form={lessonForm}
                setForm={setLessonForm}
                onSubmit={(e) => void createLesson(mod.id, e)}
                onCancel={() => {
                  setAddingLessonModuleId(null);
                  setLessonForm({ ...emptyLessonForm });
                }}
              />
            ) : (
              <button
                type="button"
                className="btn-secondary text-sm"
                onClick={() => {
                  setEditLessonId(null);
                  setLessonForm({ ...emptyLessonForm });
                  setAddingLessonModuleId(mod.id);
                }}
              >
                + Aula
              </button>
            )}
          </section>
        ))}
      </div>

      <AdminCourseLibraryPanel courseId={courseId} />
    </div>
  );
}

type LessonFormState = typeof emptyLessonForm;

function LessonEditor(props: {
  title: string;
  slugDisabled?: boolean;
  form: LessonFormState;
  setForm: React.Dispatch<React.SetStateAction<LessonFormState>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  const { title, slugDisabled, form, setForm, onSubmit, onCancel } = props;
  return (
    <form className="panel space-y-4 p-4" onSubmit={onSubmit}>
      <h3 className="font-semibold">{title}</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <input
          className="input"
          placeholder="slug-da-aula"
          value={form.slug}
          disabled={slugDisabled}
          required={!slugDisabled}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
        />
        <input
          className="input"
          placeholder="Título"
          value={form.title}
          required
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
        <select
          className="input"
          value={form.lessonType}
          onChange={(e) => setForm((f) => ({ ...f, lessonType: e.target.value as LessonType }))}
        >
          <option value="article">Artigo (HTML)</option>
          <option value="video">Vídeo (URL)</option>
          <option value="document">Documento (URL)</option>
        </select>
        <select
          className="input"
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as LessonStatus }))}
        >
          <option value="DRAFT">Rascunho</option>
          <option value="PUBLISHED">Publicado</option>
        </select>
        {form.lessonType === "video" ? (
          <input
            className="input md:col-span-2"
            placeholder="URL do vídeo (https://...)"
            value={form.videoUrl}
            onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
          />
        ) : null}
        {form.lessonType === "document" ? (
          <input
            className="input md:col-span-2"
            placeholder="URL do PDF ou documento"
            value={form.documentUrl}
            onChange={(e) => setForm((f) => ({ ...f, documentUrl: e.target.value }))}
          />
        ) : null}
      </div>
      {form.lessonType === "article" ? (
        <textarea
          className="input font-mono text-sm"
          rows={12}
          placeholder="HTML da aula"
          value={form.bodyHtml}
          onChange={(e) => setForm((f) => ({ ...f, bodyHtml: e.target.value }))}
        />
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button type="submit" className="btn-primary">
          Salvar
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
