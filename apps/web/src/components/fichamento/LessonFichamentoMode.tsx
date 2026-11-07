import { COURSES_UI } from "@ederson-agencia/shared";
import { ChevronLeft, ChevronRight, LayoutPanelLeft, Maximize2, Minimize2, X } from "lucide-react";
import type { TelegramConfig } from "../../courses/telegram";
import { LessonConsumo, lessonHasConsumableMaterial, type LessonConsumoItem } from "./LessonConsumo";
import { LessonFichamentoBlock } from "./LessonFichamentoBlock";

type LessonFichamentoModeProps = {
  courseSlug: string;
  item: LessonConsumoItem & { breadcrumb: string[]; prev: string | null; next: string | null };
  displayTitle: string;
  noteHtml?: string;
  videoSrc: string | null;
  pdfSrc: string | null;
  telegram: TelegramConfig;
  telegramMessageMap: Record<string, number>;
  fichamentoJson?: string | null;
  fichamentoHtml?: string | null;
  onExitLessonView: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  studyFocusMode?: boolean;
  onToggleStudyFocus?: () => void;
};

export function LessonFichamentoMode({
  courseSlug,
  item,
  displayTitle,
  noteHtml,
  videoSrc,
  pdfSrc,
  telegram,
  telegramMessageMap,
  fichamentoJson,
  fichamentoHtml,
  onExitLessonView,
  onPrev,
  onNext,
  studyFocusMode = false,
  onToggleStudyFocus
}: LessonFichamentoModeProps) {
  const hasConsumo = lessonHasConsumableMaterial(item, {
    pdfSrc,
    videoSrc,
    noteHtml,
    telegram,
    telegramMessageMap
  });

  return (
    <article className="course-study-fichamento-mode panel">
      <header className="course-study-fichamento-mode__head">
        <div className="min-w-0 flex-1">
          <p className="course-text-subtle text-xs">{item.breadcrumb.join(" › ")}</p>
          <h2 className="mt-1 truncate text-lg font-bold text-[var(--course-fg)] sm:text-xl">{displayTitle}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-brand-primary">
            <LayoutPanelLeft className="h-4 w-4 shrink-0" aria-hidden />
            {COURSES_UI.study.fichamentoModeTitle}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {onToggleStudyFocus ? (
            <button
              type="button"
              className={`btn-secondary min-h-9 text-xs${studyFocusMode ? " ring-2 ring-brand-primary/40" : ""}`}
              aria-pressed={studyFocusMode}
              onClick={onToggleStudyFocus}
            >
              {studyFocusMode ? (
                <Minimize2 className="mr-1 inline h-4 w-4" aria-hidden />
              ) : (
                <Maximize2 className="mr-1 inline h-4 w-4" aria-hidden />
              )}
              {studyFocusMode ? COURSES_UI.study.studyFocusExit : COURSES_UI.study.studyFocusMode}
            </button>
          ) : null}
          {item.prev && onPrev ? (
            <button type="button" className="btn-secondary min-h-9 text-xs" onClick={onPrev}>
              <ChevronLeft className="mr-0.5 inline h-4 w-4" />
              {COURSES_UI.study.fichamentoModePrev}
            </button>
          ) : null}
          {item.next && onNext ? (
            <button type="button" className="btn-secondary min-h-9 text-xs" onClick={onNext}>
              {COURSES_UI.study.fichamentoModeNext}
              <ChevronRight className="ml-0.5 inline h-4 w-4" />
            </button>
          ) : null}
          <button type="button" className="btn-primary min-h-9 text-xs" onClick={onExitLessonView}>
            <X className="mr-1 inline h-4 w-4" />
            {COURSES_UI.study.fichamentoModeExit}
          </button>
        </div>
      </header>

      {!hasConsumo ? (
        <p className="course-text-muted border-b border-[var(--app-border)] px-4 py-3 text-sm sm:px-6">
          {COURSES_UI.study.fichamentoModeNoMedia}
        </p>
      ) : null}

      <div className="course-study-fichamento-mode__grid has-consumo">
        <div className="course-study-fichamento-mode__consumo">
          <p className="course-study-fichamento-mode__consumo-label">{COURSES_UI.study.fichamentoModeConsumoLabel}</p>
          <LessonConsumo
            courseSlug={courseSlug}
            item={item}
            displayTitle={displayTitle}
            noteHtml={noteHtml}
            videoSrc={videoSrc}
            pdfSrc={pdfSrc}
            telegram={telegram}
            telegramMessageMap={telegramMessageMap}
            mediaClassName="course-study-fichamento-mode__media-stack space-y-4"
            pdfClassName="course-study-fichamento-mode__pdf"
            videoWrapClassName="course-study-fichamento-mode__video-wrap"
            videoNativeClassName="course-study-fichamento-mode__video-native"
            proseClassName="course-lesson-prose course-study-fichamento-mode__prose text-sm"
          />
        </div>
        <div className="course-study-fichamento-mode__editor">
          <p className="course-study-fichamento-mode__editor-label">{COURSES_UI.study.fichamentoLessonTitle}</p>
          <LessonFichamentoBlock
            courseSlug={courseSlug}
            lessonSlug={item.slug}
            lessonTitle={displayTitle}
            initialJson={fichamentoJson}
            initialHtml={fichamentoHtml}
            compact
            showExports
          />
        </div>
      </div>
    </article>
  );
}
