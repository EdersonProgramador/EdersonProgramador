import { COURSES_UI } from "@ederson-agencia/shared";
import { ChevronLeft, ChevronRight, ExternalLink, LayoutPanelLeft, X } from "lucide-react";
import { LessonPesquisaPanel } from "./LessonPesquisaPanel";
import { LessonPesquisaSearchForm } from "./LessonPesquisaSearchForm";
import { useLessonPesquisaSearch } from "./useLessonPesquisaSearch";

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
  const search = useLessonPesquisaSearch(item.slug, displayTitle, item.breadcrumb);

  const breadcrumbTrail =
    item.breadcrumb.length > 2 ? item.breadcrumb.slice(-2).join(" › ") : item.breadcrumb.join(" › ");

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
          <form className="course-study-pesquisa-mode__head-search mt-2 max-w-3xl" onSubmit={search.onFormSubmit}>
            <LessonPesquisaSearchForm
              search={search}
              inputId="lesson-pesquisa-query-full"
              variant="header"
            />
          </form>
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
            href={search.iframeSrc}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="mr-1 inline h-4 w-4" aria-hidden />
            {COURSES_UI.study.pesquisaOpenExternal}
          </a>
          {onOpenFichamentoMode ? (
            <button
              type="button"
              className="btn-secondary min-h-9 text-xs"
              title={COURSES_UI.study.pesquisaHandoffFichamentoHint}
              onClick={onOpenFichamentoMode}
            >
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
        key={item.slug}
        lessonSlug={item.slug}
        displayTitle={displayTitle}
        breadcrumb={item.breadcrumb}
        variant="full"
        searchInputId="lesson-pesquisa-query-full"
        search={search}
        searchFormPlacement="none"
      />
    </article>
  );
}
