import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ACADEMY_ADMIN_COURSES_BASE,
  ACADEMY_APP_BASE,
  COURSE_COVER,
  COURSES_UI
} from "@ederson-agencia/shared";
import { AdminCourseLibraryPanel } from "../components/admin/AdminCourseLibraryPanel";
import { CourseCover } from "../components/courses/CourseCover";
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
  sectionTitle: string | null;
  sectionSortOrder: number;
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
  course: {
    id: string;
    slug: string;
    title: string;
    summary: string | null;
    coverUrl: string | null;
    contentKey: string | null;
    status: string;
    visibility: string;
  };
  stats: { modules: number; lessons: number; published: number };
  modules: ContentModule[];
};

type LessonFormState = {
  slug: string;
  title: string;
  lessonKey: string;
  sectionTitle: string;
  sectionSortOrder: string;
  lessonType: LessonType;
  status: LessonStatus;
  bodyHtml: string;
  videoUrl: string;
  documentUrl: string;
};

const emptyLessonForm = (): LessonFormState => ({
  slug: "",
  title: "",
  lessonKey: "",
  sectionTitle: "",
  sectionSortOrder: "1",
  lessonType: "video",
  status: "DRAFT",
  bodyHtml: "",
  videoUrl: "",
  documentUrl: ""
});

type SectionGroup = {
  key: string;
  sectionSortOrder: number;
  sectionTitle: string;
  lessons: ContentLesson[];
};

function groupLessonsBySection(lessons: ContentLesson[]): SectionGroup[] {
  const keys: string[] = [];
  const map = new Map<string, ContentLesson[]>();
  const sorted = [...lessons].sort(
    (a, b) => a.sectionSortOrder - b.sectionSortOrder || a.sortOrder - b.sortOrder
  );
  for (const lesson of sorted) {
    const title = lesson.sectionTitle?.trim() ?? "";
    const key = `${lesson.sectionSortOrder}::${title}`;
    if (!map.has(key)) {
      map.set(key, []);
      keys.push(key);
    }
    map.get(key)!.push(lesson);
  }
  return keys.map((key) => {
    const [ord, ...rest] = key.split("::");
    return {
      key,
      sectionSortOrder: Number(ord) || 1,
      sectionTitle: rest.join("::") || "Conteúdo",
      lessons: map.get(key)!
    };
  });
}

function nextSectionSortOrder(lessons: ContentLesson[]) {
  if (lessons.length === 0) return 1;
  return Math.max(...lessons.map((l) => l.sectionSortOrder)) + 1;
}

export function AdminCourseContentPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [data, setData] = useState<ContentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [moduleTitle, setModuleTitle] = useState("");
  const [editModuleId, setEditModuleId] = useState<string | null>(null);
  const [editModuleTitle, setEditModuleTitle] = useState("");
  const [lessonContext, setLessonContext] = useState<{
    moduleId: string;
    sectionTitle: string;
    sectionSortOrder: number;
  } | null>(null);
  const [lessonForm, setLessonForm] = useState<LessonFormState>(emptyLessonForm());
  const [editLessonId, setEditLessonId] = useState<string | null>(null);
  const [courseSummary, setCourseSummary] = useState("");
  const [courseCoverUrl, setCourseCoverUrl] = useState("");

  const refresh = useCallback(async () => {
    if (!courseId) return;
    const res = await apiGet<ContentResponse>(`/admin/courses/${courseId}/content`);
    setData(res);
    setCourseSummary(res.course.summary ?? "");
    setCourseCoverUrl(res.course.coverUrl ?? "");
  }, [courseId]);

  useEffect(() => {
    if (!courseId) return;
    void refresh().catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar."));
  }, [courseId, refresh]);

  const isFlLocked = data?.course.contentKey === "fl";

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

  async function saveCourseMeta(event: React.FormEvent) {
    event.preventDefault();
    if (!courseId) return;
    await runAction(async () => {
      await apiPatch(`/admin/courses/${courseId}`, {
        summary: courseSummary.trim() || null,
        coverUrl: courseCoverUrl.trim() || null
      });
    }, "Apresentação do curso salva.");
  }

  async function createModule(event: React.FormEvent) {
    event.preventDefault();
    if (!courseId || !moduleTitle.trim()) return;
    await runAction(async () => {
      await apiPost(`/admin/courses/${courseId}/modules`, { title: moduleTitle.trim() });
      setModuleTitle("");
    }, "Módulo criado.");
  }

  async function saveModuleTitle(moduleId: string) {
    if (!courseId || !editModuleTitle.trim()) return;
    await runAction(async () => {
      await apiPatch(`/admin/courses/${courseId}/modules/${moduleId}`, { title: editModuleTitle.trim() });
      setEditModuleId(null);
    }, "Módulo renomeado.");
  }

  async function moveModule(moduleId: string, direction: -1 | 1) {
    if (!courseId || !data) return;
    const sorted = [...data.modules].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((m) => m.id === moduleId);
    const swap = sorted[idx + direction];
    if (!swap || idx < 0) return;
    await runAction(async () => {
      await apiPatch(`/admin/courses/${courseId}/modules/${moduleId}`, { sortOrder: swap.sortOrder });
      await apiPatch(`/admin/courses/${courseId}/modules/${swap.id}`, { sortOrder: sorted[idx].sortOrder });
    }, "Ordem dos módulos atualizada.");
  }

  async function deleteModule(moduleId: string) {
    if (!courseId || !confirm("Excluir módulo e todas as aulas?")) return;
    await runAction(async () => {
      await apiDelete(`/admin/courses/${courseId}/modules/${moduleId}`);
    }, "Módulo removido.");
  }

  function openNewLesson(module: ContentModule, section?: SectionGroup) {
    setEditLessonId(null);
    setLessonContext({
      moduleId: module.id,
      sectionTitle: section?.sectionTitle ?? "",
      sectionSortOrder: section?.sectionSortOrder ?? nextSectionSortOrder(module.lessons)
    });
    setLessonForm({
      ...emptyLessonForm(),
      sectionTitle: section?.sectionTitle ?? "",
      sectionSortOrder: String(section?.sectionSortOrder ?? nextSectionSortOrder(module.lessons))
    });
  }

  function openNewSection(module: ContentModule) {
    const title = window.prompt("Nome do submódulo (aparece no sumário, como na trilha FL):");
    if (!title?.trim()) return;
    openNewLesson(module, {
      key: "",
      sectionTitle: title.trim(),
      sectionSortOrder: nextSectionSortOrder(module.lessons),
      lessons: []
    });
  }

  async function createLesson(event: React.FormEvent) {
    event.preventDefault();
    if (!courseId || !lessonContext) return;
    await runAction(async () => {
      await apiPost(`/admin/courses/${courseId}/modules/${lessonContext.moduleId}/lessons`, {
        slug: lessonForm.slug.trim(),
        title: lessonForm.title.trim(),
        lessonKey: lessonForm.lessonKey.trim() || null,
        sectionTitle: lessonForm.sectionTitle.trim() || lessonContext.sectionTitle || null,
        sectionSortOrder: Number(lessonForm.sectionSortOrder) || lessonContext.sectionSortOrder,
        lessonType: lessonForm.lessonType,
        status: lessonForm.status,
        bodyHtml: lessonForm.bodyHtml.trim() || null,
        videoUrl: lessonForm.videoUrl.trim() || null,
        documentUrl: lessonForm.documentUrl.trim() || null
      });
      setLessonForm(emptyLessonForm());
      setLessonContext(null);
    }, "Aula criada.");
  }

  function startEditLesson(lesson: ContentLesson, moduleId: string) {
    setEditLessonId(lesson.id);
    setLessonContext({ moduleId, sectionTitle: lesson.sectionTitle ?? "", sectionSortOrder: lesson.sectionSortOrder });
    setLessonForm({
      slug: lesson.slug,
      title: lesson.title,
      lessonKey: lesson.lessonKey ?? "",
      sectionTitle: lesson.sectionTitle ?? "",
      sectionSortOrder: String(lesson.sectionSortOrder),
      lessonType: lesson.lessonType,
      status: lesson.status,
      bodyHtml: lesson.bodyHtml ?? "",
      videoUrl: lesson.videoUrl ?? "",
      documentUrl: lesson.documentUrl ?? ""
    });
  }

  async function saveLesson(event: React.FormEvent) {
    event.preventDefault();
    if (!courseId || !editLessonId) return;
    await runAction(async () => {
      await apiPatch(`/admin/courses/${courseId}/lessons/${editLessonId}`, {
        title: lessonForm.title.trim(),
        lessonKey: lessonForm.lessonKey.trim() || null,
        sectionTitle: lessonForm.sectionTitle.trim() || null,
        sectionSortOrder: Number(lessonForm.sectionSortOrder) || 1,
        lessonType: lessonForm.lessonType,
        status: lessonForm.status,
        bodyHtml: lessonForm.bodyHtml.trim() || null,
        videoUrl: lessonForm.videoUrl.trim() || null,
        documentUrl: lessonForm.documentUrl.trim() || null
      });
      setEditLessonId(null);
      setLessonContext(null);
      setLessonForm(emptyLessonForm());
    }, "Aula atualizada.");
  }

  async function deleteLesson(lessonId: string) {
    if (!courseId || !confirm("Excluir esta aula?")) return;
    await runAction(async () => {
      await apiDelete(`/admin/courses/${courseId}/lessons/${lessonId}`);
      if (editLessonId === lessonId) {
        setEditLessonId(null);
        setLessonContext(null);
        setLessonForm(emptyLessonForm());
      }
    }, "Aula removida.");
  }

  const sortedModules = useMemo(
    () => (data ? [...data.modules].sort((a, b) => a.sortOrder - b.sortOrder) : []),
    [data]
  );

  if (!courseId) {
    return <p className="text-red-300">Curso inválido.</p>;
  }

  const course = data?.course;
  const ui = COURSES_UI.adminContent;

  return (
    <div className="courses-academy space-y-8">
      <div>
        <Link to={ACADEMY_ADMIN_COURSES_BASE} className="text-sm text-brand-primary hover:underline">
          ← Gestão da academia
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-white">Sumário e conteúdo</h1>
        {course ? (
          <p className="course-text-muted text-sm leading-relaxed">
            {course.title}{" "}
            <span className="font-mono text-brand-primary">({course.slug})</span>
            {" · "}
            {course.status}
            {course.contentKey ? ` · ${course.contentKey}` : ""}
          </p>
        ) : null}
      </div>

      {isFlLocked ? (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {ui.flLockedHint}
        </p>
      ) : null}

      {message ? <p className="text-sm text-green-300">{message}</p> : null}
      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      {course && !isFlLocked ? (
        <form className="panel space-y-4 p-5" onSubmit={(e) => void saveCourseMeta(e)}>
          <h2 className="text-lg font-semibold">{ui.courseMetaTitle}</h2>
          <p className="course-text-muted text-xs leading-relaxed">{ui.courseMetaHint}</p>
          <div className="flex flex-wrap gap-6">
            <CourseCover title={course.title} coverUrl={courseCoverUrl || null} className="course-cover--card w-full max-w-xs" />
            <div className="min-w-[240px] flex-1 space-y-3">
              <label className="block">
                <span className="course-text-muted mb-1 block text-xs">{ui.coverLabel}</span>
                <input
                  className="input w-full"
                  placeholder={COURSE_COVER.adminHint}
                  value={courseCoverUrl}
                  onChange={(e) => setCourseCoverUrl(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="course-text-muted mb-1 block text-xs">{ui.summaryLabel}</span>
                <textarea
                  className="input w-full text-sm"
                  rows={4}
                  value={courseSummary}
                  onChange={(e) => setCourseSummary(e.target.value)}
                />
              </label>
              <button type="submit" className="btn-secondary text-sm">
                Salvar capa e descrição
              </button>
            </div>
          </div>
        </form>
      ) : null}

      {data && !isFlLocked ? (
        <div className="flex flex-wrap gap-2">
          <p className="course-text-faint w-full text-xs">
            {data.stats.modules} módulos · {data.stats.lessons} aulas · {data.stats.published} publicadas · catálogo:{" "}
            {course?.status}
          </p>
          <button
            type="button"
            className="btn-primary text-sm"
            onClick={() =>
              void runAction(async () => {
                await apiPost(`/admin/courses/${courseId}/content/publish-course`, {});
              }, "Curso publicado no catálogo.")
            }
          >
            {ui.publishCourse}
          </button>
          <button
            type="button"
            className="btn-secondary text-sm"
            onClick={() =>
              void runAction(async () => {
                await apiPost(`/admin/courses/${courseId}/content/publish-all`, {});
              }, "Rascunhos publicados.")
            }
          >
            {ui.publishAllLessons}
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

      {!isFlLocked ? (
        <form className="panel flex flex-wrap items-end gap-3 p-4" onSubmit={(e) => void createModule(e)}>
          <div className="min-w-[200px] flex-1">
            <label className="course-text-muted mb-1 block text-xs">{ui.moduleLabel}</label>
            <input
              className="input w-full"
              placeholder="Ex.: Alicerce, Lançamento clássico…"
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary">
            Adicionar módulo
          </button>
        </form>
      ) : null}

      {editLessonId || lessonContext ? (
        <LessonEditor
          title={editLessonId ? "Editar aula" : "Nova aula"}
          slugDisabled={Boolean(editLessonId)}
          form={lessonForm}
          setForm={setLessonForm}
          onSubmit={(e) => void (editLessonId ? saveLesson(e) : createLesson(e))}
          onCancel={() => {
            setEditLessonId(null);
            setLessonContext(null);
            setLessonForm(emptyLessonForm());
          }}
        />
      ) : null}

      <div className="space-y-6">
        {sortedModules.map((mod, modIndex) => {
          const sections = groupLessonsBySection(mod.lessons);
          return (
            <section key={mod.id} className="panel space-y-4 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                {editModuleId === mod.id ? (
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                    <input
                      className="input min-w-[200px] flex-1"
                      value={editModuleTitle}
                      onChange={(e) => setEditModuleTitle(e.target.value)}
                    />
                    <button type="button" className="btn-primary text-sm" onClick={() => void saveModuleTitle(mod.id)}>
                      Salvar
                    </button>
                    <button type="button" className="btn-secondary text-sm" onClick={() => setEditModuleId(null)}>
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <h2 className="text-lg font-semibold">
                    {ui.moduleLabel} {modIndex + 1}: {mod.title}
                  </h2>
                )}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-secondary text-xs"
                    disabled={modIndex === 0}
                    onClick={() => void moveModule(mod.id, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="btn-secondary text-xs"
                    disabled={modIndex === sortedModules.length - 1}
                    onClick={() => void moveModule(mod.id, 1)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="btn-secondary text-xs"
                    onClick={() => {
                      setEditModuleId(mod.id);
                      setEditModuleTitle(mod.title);
                    }}
                  >
                    Renomear
                  </button>
                  <button type="button" className="text-xs text-red-300 hover:underline" onClick={() => void deleteModule(mod.id)}>
                    Excluir módulo
                  </button>
                </div>
              </div>

              {sections.map((section) => (
                <div key={section.key} className="space-y-2 rounded-lg border border-white/10 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-brand-primary">
                      {ui.submoduleLabel}: {section.sectionTitle}
                    </p>
                    <button type="button" className="btn-secondary text-xs" onClick={() => openNewLesson(mod, section)}>
                      {ui.lessonAdd}
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {section.lessons.map((lesson) => (
                      <li
                        key={lesson.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-black/20 px-3 py-2"
                      >
                        <div>
                          <p className="font-medium">{lesson.title}</p>
                          <p className="course-text-faint font-mono text-xs">
                            {lesson.lessonKey ? `${lesson.lessonKey} · ` : ""}
                            {lesson.slug} · {lesson.lessonType} · {lesson.status}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" className="btn-secondary text-xs" onClick={() => startEditLesson(lesson, mod.id)}>
                            Editar
                          </button>
                          <button type="button" className="text-xs text-red-300 hover:underline" onClick={() => void deleteLesson(lesson.id)}>
                            Excluir
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <button type="button" className="btn-secondary text-sm" onClick={() => openNewSection(mod)}>
                + {ui.submoduleAdd}
              </button>
            </section>
          );
        })}
      </div>

      {!isFlLocked ? <AdminCourseLibraryPanel courseId={courseId} /> : null}
    </div>
  );
}

function LessonEditor(props: {
  title: string;
  slugDisabled?: boolean;
  form: LessonFormState;
  setForm: React.Dispatch<React.SetStateAction<LessonFormState>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  const { title, slugDisabled, form, setForm, onSubmit, onCancel } = props;
  const ui = COURSES_UI.adminContent;

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
          placeholder="Título da aula"
          value={form.title}
          required
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
        <input
          className="input"
          placeholder={ui.lessonKeyLabel}
          value={form.lessonKey}
          onChange={(e) => setForm((f) => ({ ...f, lessonKey: e.target.value }))}
        />
        <select
          className="input"
          value={form.lessonType}
          onChange={(e) => setForm((f) => ({ ...f, lessonType: e.target.value as LessonType }))}
        >
          <option value="video">Vídeo</option>
          <option value="article">Texto / HTML</option>
          <option value="document">Documento (PDF/link)</option>
        </select>
        <input
          className="input"
          placeholder={ui.sectionTitleLabel}
          value={form.sectionTitle}
          onChange={(e) => setForm((f) => ({ ...f, sectionTitle: e.target.value }))}
        />
        <input
          className="input"
          type="number"
          min={1}
          placeholder={ui.sectionOrderLabel}
          value={form.sectionSortOrder}
          onChange={(e) => setForm((f) => ({ ...f, sectionSortOrder: e.target.value }))}
        />
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
            placeholder={ui.videoUrlHint}
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
      {(form.lessonType === "article" || form.lessonType === "video" || form.bodyHtml) && (
        <div>
          <p className="course-text-muted mb-1 text-xs">{ui.bodyHint}</p>
          <textarea
            className="input font-mono text-sm"
            rows={10}
            value={form.bodyHtml}
            onChange={(e) => setForm((f) => ({ ...f, bodyHtml: e.target.value }))}
          />
        </div>
      )}
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
