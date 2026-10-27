import { COURSES_UI } from "@ederson-agencia/shared";
import { apiPut } from "../../api";
import { NotionEditor } from "./NotionEditor";

export function LessonFichamentoBlock({
  courseSlug,
  lessonSlug,
  initialJson,
  initialHtml
}: {
  courseSlug: string;
  lessonSlug: string;
  initialJson?: string | null;
  initialHtml?: string | null;
}) {
  return (
    <section className="fichamento-lesson-block">
      <h3 className="text-sm font-semibold text-[var(--course-fg)]">{COURSES_UI.study.fichamentoLessonTitle}</h3>
      <p className="course-text-faint mt-1 text-xs">{COURSES_UI.study.fichamentoLessonHint}</p>
      <div className="mt-4">
        <NotionEditor
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
