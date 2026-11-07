import { COURSES_UI } from "@ederson-agencia/shared";
import { Download } from "lucide-react";
import { useRef, useState } from "react";
import { apiPut } from "../../api";
import {
  downloadHtmlDocument,
  downloadPdfDocument,
  downloadWordDocument
} from "../../fichamento/downloadDocument";
import { NotionEditor, type NotionEditorHandle } from "./NotionEditor";

type LessonFichamentoBlockProps = {
  courseSlug: string;
  lessonSlug: string;
  lessonTitle: string;
  initialJson?: string | null;
  initialHtml?: string | null;
  /** Exibe barra de download (PDF, Word, HTML). */
  showExports?: boolean;
  /** Cabeçalho compacto — ideal no modo fichamento. */
  compact?: boolean;
};

export function LessonFichamentoBlock({
  courseSlug,
  lessonSlug,
  lessonTitle,
  initialJson,
  initialHtml,
  showExports = true,
  compact = false
}: LessonFichamentoBlockProps) {
  const editorRef = useRef<NotionEditorHandle>(null);
  const [exportBusy, setExportBusy] = useState(false);

  const exportBaseName = `${courseSlug}-${lessonSlug}-fichamento`;
  const exportTitle = `${lessonTitle} — ${COURSES_UI.study.fichamentoLessonTitle}`;

  async function runExport(kind: "pdf" | "word" | "html") {
    const snap = editorRef.current?.getSnapshot();
    if (!snap?.docHtml?.trim()) return;
    setExportBusy(true);
    try {
      if (kind === "html") downloadHtmlDocument(exportBaseName, snap.docHtml, exportTitle);
      else if (kind === "word") downloadWordDocument(exportBaseName, snap.docHtml, exportTitle);
      else await downloadPdfDocument(exportBaseName, snap.docHtml, exportTitle);
    } finally {
      setExportBusy(false);
    }
  }

  return (
    <section className={`fichamento-lesson-block ${compact ? "fichamento-lesson-block--compact" : ""}`}>
      <div className="fichamento-lesson-block__head">
        <div>
          <h3 className="text-sm font-semibold text-[var(--course-fg)]">{COURSES_UI.study.fichamentoLessonTitle}</h3>
          <p className="course-text-faint mt-1 text-xs">{COURSES_UI.study.fichamentoLessonHint}</p>
        </div>
        {showExports ? (
          <div className="fichamento-lesson-block__exports fichamento-no-print">
            <button
              type="button"
              className="btn-secondary text-xs"
              disabled={exportBusy}
              onClick={() => void runExport("pdf")}
            >
              <Download className="mr-1 inline h-3.5 w-3.5" aria-hidden />
              {COURSES_UI.study.fichamentoDownloadPdf}
            </button>
            <button
              type="button"
              className="btn-secondary text-xs"
              disabled={exportBusy}
              onClick={() => void runExport("word")}
            >
              <Download className="mr-1 inline h-3.5 w-3.5" aria-hidden />
              {COURSES_UI.study.fichamentoDownloadWord}
            </button>
            <button
              type="button"
              className="btn-secondary text-xs"
              disabled={exportBusy}
              onClick={() => void runExport("html")}
            >
              <Download className="mr-1 inline h-3.5 w-3.5" aria-hidden />
              {COURSES_UI.study.fichamentoDownloadHtml}
            </button>
          </div>
        ) : null}
      </div>
      <div className="fichamento-lesson-block__editor mt-3 min-h-0 flex-1">
        <NotionEditor
          ref={editorRef}
          editorKey={`lesson-${courseSlug}-${lessonSlug}`}
          contentJson={initialJson}
          contentHtml={initialHtml}
          placeholder="Resumo, citações, fichamento desta aula…"
          onSave={async (snap) => {
            await apiPut(`/courses/${courseSlug}/fichamento/lessons/${lessonSlug}`, snap);
          }}
        />
      </div>
    </section>
  );
}
