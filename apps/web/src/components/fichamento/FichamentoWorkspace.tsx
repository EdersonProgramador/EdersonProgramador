import { COURSES_UI } from "@ederson-agencia/shared";
import { useCallback, useEffect, useState } from "react";
import { apiPost, apiPut } from "../../api";
import { downloadHtmlDocument } from "../../fichamento/downloadDocument";
import { NotionEditor } from "./NotionEditor";

type FichamentoWorkspaceProps = {
  courseSlug: string;
  courseTitle: string;
  mode: "module" | "course";
  moduleNumber?: number;
  moduleTitle?: string;
  initialHtml?: string | null;
  initialJson?: string | null;
  onBack: () => void;
  onCompiled?: (html: string, json?: string | null) => void;
};

export function FichamentoWorkspace({
  courseSlug,
  courseTitle,
  mode,
  moduleNumber,
  moduleTitle,
  initialHtml,
  initialJson,
  onBack,
  onCompiled
}: FichamentoWorkspaceProps) {
  const [contentHtml, setContentHtml] = useState(initialHtml ?? "");
  const [contentJson, setContentJson] = useState(initialJson ?? null);
  const [editorKey, setEditorKey] = useState(0);

  useEffect(() => {
    setContentHtml(initialHtml ?? "");
    setContentJson(initialJson ?? null);
    setEditorKey((k) => k + 1);
  }, [initialHtml, initialJson, mode, moduleNumber]);

  const title =
    mode === "module"
      ? `${COURSES_UI.study.fichamentoModuleTitle}${moduleTitle ? `: ${moduleTitle}` : ""}`
      : COURSES_UI.study.fichamentoCourseTitle;

  const save = useCallback(
    async (snap: { docJson: string; docHtml: string }) => {
      setContentHtml(snap.docHtml);
      setContentJson(snap.docJson);
      if (mode === "module" && moduleNumber != null) {
        await apiPut(`/courses/${courseSlug}/fichamento/modules/${moduleNumber}`, snap);
      } else {
        await apiPut(`/courses/${courseSlug}/fichamento/course`, snap);
      }
    },
    [courseSlug, mode, moduleNumber]
  );

  async function compileFromSources() {
    if (mode === "module" && moduleNumber != null) {
      const res = await apiPost<{
        docHtml: string | null;
        docJson: string | null;
      }>(`/courses/${courseSlug}/fichamento/modules/${moduleNumber}/compile`, {});
      setContentHtml(res.docHtml ?? "");
      setContentJson(res.docJson);
      setEditorKey((k) => k + 1);
      onCompiled?.(res.docHtml ?? "", res.docJson);
      return;
    }
    const res = await apiPost<{ docHtml: string | null; docJson: string | null }>(
      `/courses/${courseSlug}/fichamento/course/compile`,
      {}
    );
    setContentHtml(res.docHtml ?? "");
    setContentJson(res.docJson);
    setEditorKey((k) => k + 1);
    onCompiled?.(res.docHtml ?? "", res.docJson);
  }

  function download() {
    const name =
      mode === "module"
        ? `${courseSlug}-modulo-${String(moduleNumber ?? 0).padStart(2, "0")}`
        : `${courseSlug}-fichamento-completo`;
    downloadHtmlDocument(name, contentHtml, title);
  }

  return (
    <article className="panel fichamento-workspace p-4 sm:p-6 md:p-8">
      <div className="fichamento-workspace__head fichamento-no-print">
        <div>
          <p className="course-text-subtle text-xs">{courseTitle}</p>
          <h2 className="mt-1 text-xl font-bold text-white">{title}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary text-sm" onClick={() => void compileFromSources()}>
            {mode === "module" ? COURSES_UI.study.fichamentoCompileModule : COURSES_UI.study.fichamentoCompileCourse}
          </button>
          <button type="button" className="btn-secondary text-sm" onClick={download}>
            {COURSES_UI.study.fichamentoDownload}
          </button>
          <button type="button" className="btn-primary text-sm" onClick={onBack}>
            {COURSES_UI.study.fichamentoBackLesson}
          </button>
        </div>
      </div>
      <div className="mt-6">
        <NotionEditor
          editorKey={`${mode}-${moduleNumber ?? "course"}-${editorKey}`}
          contentHtml={contentHtml}
          contentJson={contentJson}
          placeholder="Organize ideias, citações e resumos como no Notion…"
          onSave={save}
        />
      </div>
    </article>
  );
}
