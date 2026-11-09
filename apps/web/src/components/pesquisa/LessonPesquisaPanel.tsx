import { COURSES_UI } from "@ederson-agencia/shared";
import { TABS as PESQUISA_TABS } from "./lesson-pesquisa-tabs";
import { LessonPesquisaSearchForm } from "./LessonPesquisaSearchForm";
import type { LessonPesquisaSearch } from "./useLessonPesquisaSearch";
import { useLessonPesquisaSearch } from "./useLessonPesquisaSearch";

const TABS = PESQUISA_TABS;

type Props = {
  lessonSlug: string;
  displayTitle: string;
  breadcrumb: string[];
  variant?: "full" | "embed";
  searchInputId?: string;
  onOpenFullscreen?: () => void;
  search: LessonPesquisaSearch;
  /** Onde mostrar o campo de busca (embed: nenhum) */
  searchFormPlacement?: "toolbar" | "none";
};

export function LessonPesquisaPanel({
  lessonSlug,
  displayTitle,
  breadcrumb,
  variant = "full",
  searchInputId = "lesson-pesquisa-query",
  onOpenFullscreen,
  search,
  searchFormPlacement
}: Props) {
  const isEmbed = variant === "embed";
  const showSearchForm =
    searchFormPlacement !== "none" &&
    !isEmbed &&
    (searchFormPlacement === "toolbar" || searchFormPlacement === undefined);

  return (
    <div
      className={`course-study-pesquisa-panel${isEmbed ? " course-study-pesquisa-panel--embed" : " course-study-pesquisa-panel--full"}`}
    >
      <div className={`course-study-pesquisa-mode__toolbar${isEmbed ? " course-study-pesquisa-mode__toolbar--embed" : ""}`}>
        {showSearchForm ? (
          <form className="course-study-pesquisa-mode__search-form" onSubmit={search.onFormSubmit}>
            <LessonPesquisaSearchForm search={search} inputId={searchInputId} />
          </form>
        ) : null}

        <div className="course-study-pesquisa-mode__tabs" role="tablist" aria-label={COURSES_UI.study.pesquisaTabsLabel}>
          {TABS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              role="tab"
              aria-selected={search.tab === entry.id}
              className={`course-study-pesquisa-mode__tab${search.tab === entry.id ? " is-active" : ""}`}
              onClick={() => search.selectTab(entry.id)}
            >
              {entry.label}
            </button>
          ))}
        </div>

        {!isEmbed ? (
          <div className="course-study-pesquisa-mode__chips">
            {search.suggestions.map((chip) => (
              <button
                key={chip}
                type="button"
                className="course-study-pesquisa-mode__chip"
                onClick={() => search.submitSearch(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
        ) : null}

        {isEmbed ? (
          <div className="course-study-pesquisa-panel__embed-actions">
            <a
              className="course-text-subtle text-xs underline-offset-2 hover:underline"
              href={search.iframeSrc}
              target="_blank"
              rel="noopener noreferrer"
            >
              {COURSES_UI.study.pesquisaOpenExternal}
            </a>
            {onOpenFullscreen ? (
              <button type="button" className="course-text-subtle text-xs underline-offset-2 hover:underline" onClick={onOpenFullscreen}>
                {COURSES_UI.study.pesquisaOpenFullscreen}
              </button>
            ) : null}
          </div>
        ) : (
          <p className="course-study-pesquisa-mode__hint course-text-subtle text-xs leading-relaxed">
            {COURSES_UI.study.pesquisaIframeHint}
          </p>
        )}
      </div>

      <div className={`course-study-pesquisa-mode__frame-wrap${isEmbed ? " course-study-pesquisa-mode__frame-wrap--embed" : ""}`}>
        <iframe
          key={search.iframeKey}
          className={`course-study-pesquisa-mode__frame${isEmbed ? " course-study-pesquisa-mode__frame--embed" : ""}`}
          src={search.iframeSrc}
          title={displayTitle}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        />
      </div>
    </div>
  );
}

export function LessonPesquisaPanelWithState(
  props: Omit<Props, "search" | "searchFormPlacement"> & { searchFormPlacement?: Props["searchFormPlacement"] }
) {
  const search = useLessonPesquisaSearch(props.lessonSlug, props.displayTitle, props.breadcrumb);
  return <LessonPesquisaPanel {...props} search={search} />;
}
