import { COURSES_UI } from "@ederson-agencia/shared";
import { ChevronLeft, ChevronRight, LayoutPanelLeft, Maximize2, Minimize2, Search, X } from "lucide-react";
import { useState } from "react";
import type { TelegramConfig } from "../../courses/telegram";
import { consumePesquisaHandoffToFichamento } from "../../lib/lesson-pesquisa-session";
import { LessonPesquisaPanel } from "../pesquisa/LessonPesquisaPanel";
import { LessonConsumo, lessonHasConsumableMaterial, type LessonConsumoItem } from "./LessonConsumo";
import { LessonFichamentoBlock } from "./LessonFichamentoBlock";

type FichamentoConsumoView = "material" | "pesquisa";

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
  onOpenPesquisaFullscreen?: () => void;
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
  onOpenPesquisaFullscreen,
  onPrev,
  onNext,
  studyFocusMode = false,
  onToggleStudyFocus
}: LessonFichamentoModeProps) {
  const [consumoView, setConsumoView] = useState<FichamentoConsumoView>(() =>
    consumePesquisaHandoffToFichamento(item.slug) ? "pesquisa" : "material"
  );

  const hasConsumo = lessonHasConsumableMaterial(item, {
    pdfSrc,
    videoSrc,
    noteHtml,
    telegram,
    telegramMessageMap
  });

  const breadcrumbTrail =
    item.breadcrumb.length > 2 ? item.breadcrumb.slice(-2).join(" › ") : item.breadcrumb.join(" › ");

  return (
    <article className="course-study-fichamento-mode panel">
      <header className="course-study-fichamento-mode__head">
        <div className="course-study-fichamento-mode__head-titles min-w-0">
          <p className="course-study-fichamento-mode__breadcrumb course-text-subtle text-xs" title={item.breadcrumb.join(" › ")}>
            {breadcrumbTrail}
          </p>
          <h2 className="course-study-fichamento-mode__title mt-1 text-lg font-bold text-[var(--course-fg)] sm:text-xl">
            {displayTitle}
          </h2>
          <p className="course-study-fichamento-mode__mode-label mt-1 flex items-center gap-1.5 text-xs font-medium text-brand-primary">
            <LayoutPanelLeft className="h-4 w-4 shrink-0" aria-hidden />
            <span>{COURSES_UI.study.fichamentoModeTitle}</span>
          </p>
        </div>
        <div className="course-study-fichamento-mode__head-actions">
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
          <button
            type="button"
            className={`btn-secondary min-h-9 text-xs${consumoView === "pesquisa" ? " ring-2 ring-brand-primary/40" : ""}`}
            aria-pressed={consumoView === "pesquisa"}
            onClick={() => setConsumoView((view) => (view === "pesquisa" ? "material" : "pesquisa"))}
          >
            <Search className="mr-1 inline h-4 w-4" aria-hidden />
            {COURSES_UI.study.pesquisaModeOpen}
          </button>
          <button type="button" className="btn-primary min-h-9 text-xs" onClick={onExitLessonView}>
            <X className="mr-1 inline h-4 w-4" />
            {COURSES_UI.study.fichamentoModeExit}
          </button>
        </div>
      </header>

      <div className="course-study-fichamento-mode__grid has-consumo">
        <div className="course-study-fichamento-mode__consumo">
          <div
            className="course-study-fichamento-mode__consumo-tabs"
            role="tablist"
            aria-label={COURSES_UI.study.fichamentoConsumoTabsLabel}
          >
            <button
              type="button"
              role="tab"
              aria-selected={consumoView === "material"}
              className={`course-study-fichamento-mode__consumo-tab${consumoView === "material" ? " is-active" : ""}`}
              onClick={() => setConsumoView("material")}
            >
              {COURSES_UI.study.fichamentoModeConsumoLabel}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={consumoView === "pesquisa"}
              className={`course-study-fichamento-mode__consumo-tab${consumoView === "pesquisa" ? " is-active" : ""}`}
              onClick={() => setConsumoView("pesquisa")}
            >
              <Search className="mr-1 inline h-3.5 w-3.5" aria-hidden />
              {COURSES_UI.study.pesquisaModeOpen}
            </button>
          </div>
          {consumoView === "material" ? (
            hasConsumo ? (
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
            ) : (
              <p className="course-text-muted course-study-fichamento-mode__consumo-empty text-sm leading-relaxed">
                {COURSES_UI.study.fichamentoModeNoMedia}
              </p>
            )
          ) : (
            <LessonPesquisaPanel
              key={item.slug}
              lessonSlug={item.slug}
              displayTitle={displayTitle}
              breadcrumb={item.breadcrumb}
              variant="embed"
              searchInputId={`fichamento-pesquisa-${item.slug}`}
              onOpenFullscreen={onOpenPesquisaFullscreen}
            />
          )}
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
