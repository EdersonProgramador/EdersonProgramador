import { COURSES_UI } from "@ederson-agencia/shared";
import { ChevronLeft, ChevronRight, ExternalLink, LayoutPanelLeft, Search, X } from "lucide-react";
import { useMemo } from "react";
import { buildLessonGoogleSearchUrl, defaultLessonSearchQuery } from "../../lib/lesson-google-pesquisa";
import { LessonPesquisaPanel } from "./LessonPesquisaPanel";

type LessonPesquisaItem = {
  slug: string;
  id: string;
  title: string;
  breadcrumb: string[];
  prev: string | null;
  next: string | null;
};

type Props = {
  item: LessonPesquisaItem;
  displayTitle: string;
  onExitLessonView: () => void;
  onOpenFichamentoMode?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
};

export function LessonPesquisaMode({
  item,
  displayTitle,
  onExitLessonView,
  onOpenFichamentoMode,
  onPrev,
  onNext
}: Props) {
  const breadcrumbTrail =
    item.breadcrumb.length > 2 ? item.breadcrumb.slice(-2).join(" › ") : item.breadcrumb.join(" › ");

  const iframeSrc = useMemo(
    () => buildLessonGoogleSearchUrl(defaultLessonSearchQuery(displayTitle, item.breadcrumb), "all"),
    [displayTitle, item.breadcrumb]
  );

  return (
    <article className="course-study-pesquisa-mode panel">
      <header className="course-study-pesquisa-mode__head">
        <div className="course-study-pesquisa-mode__head-titles min-w-0">
          <p
            className="course-study-pesquisa-mode__breadcrumb course-text-subtle text-xs"
            title={item.breadcrumb.join(" › ")}
          >
            {breadcrumbTrail}
          </p>
          <h2 className="course-study-pesquisa-mode__title mt-1 text-lg font-bold text-[var(--course-fg)] sm:text-xl">
            {displayTitle}
          </h2>
          <p className="course-study-pesquisa-mode__mode-label mt-1 flex items-center gap-1.5 text-xs font-medium text-brand-primary">
            <Search className="h-4 w-4 shrink-0" aria-hidden />
            <span>{COURSES_UI.study.pesquisaModeTitle}</span>
          </p>
        </div>
        <div className="course-study-pesquisa-mode__head-actions">
          {item.prev && onPrev ? (
            <button type="button" className="btn-secondary min-h-9 text-xs" onClick={onPrev}>
              <ChevronLeft className="mr-0.5 inline h-4 w-4" />
              {COURSES_UI.study.pesquisaModePrev}
            </button>
          ) : null}
          {item.next && onNext ? (
            <button type="button" className="btn-secondary min-h-9 text-xs" onClick={onNext}>
              {COURSES_UI.study.pesquisaModeNext}
              <ChevronRight className="ml-0.5 inline h-4 w-4" />
            </button>
          ) : null}
          <a
            className="btn-secondary min-h-9 text-xs"
            href={iframeSrc}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="mr-1 inline h-4 w-4" aria-hidden />
            {COURSES_UI.study.pesquisaOpenExternal}
          </a>
          {onOpenFichamentoMode ? (
            <button type="button" className="btn-secondary min-h-9 text-xs" onClick={onOpenFichamentoMode}>
              <LayoutPanelLeft className="mr-1 inline h-4 w-4" aria-hidden />
              {COURSES_UI.study.fichamentoModeOpen}
            </button>
          ) : null}
          <button type="button" className="btn-primary min-h-9 text-xs" onClick={onExitLessonView}>
            <X className="mr-1 inline h-4 w-4" />
            {COURSES_UI.study.pesquisaModeExit}
          </button>
        </div>
      </header>

      <LessonPesquisaPanel
        displayTitle={displayTitle}
        breadcrumb={item.breadcrumb}
        variant="full"
        searchInputId="lesson-pesquisa-query-full"
      />
    </article>
  );
}
