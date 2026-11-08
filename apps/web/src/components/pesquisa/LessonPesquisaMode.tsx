import { COURSES_UI } from "@ederson-agencia/shared";
import { ChevronLeft, ChevronRight, ExternalLink, Search, X } from "lucide-react";
import { FormEvent, useCallback, useMemo, useState } from "react";
import {
  buildLessonGoogleSearchUrl,
  defaultLessonSearchQuery,
  type LessonPesquisaTab
} from "../../lib/lesson-google-pesquisa";

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
  onPrev?: () => void;
  onNext?: () => void;
};

const TABS: { id: LessonPesquisaTab; label: string }[] = [
  { id: "all", label: COURSES_UI.study.pesquisaTabAll },
  { id: "trusted", label: COURSES_UI.study.pesquisaTabTrusted },
  { id: "videos", label: COURSES_UI.study.pesquisaTabVideos },
  { id: "news", label: COURSES_UI.study.pesquisaTabNews },
  { id: "scholar", label: COURSES_UI.study.pesquisaTabScholar },
  { id: "books", label: COURSES_UI.study.pesquisaTabBooks }
];

export function LessonPesquisaMode({
  item,
  displayTitle,
  onExitLessonView,
  onPrev,
  onNext
}: Props) {
  const anchorQuery = useMemo(
    () => defaultLessonSearchQuery(displayTitle, item.breadcrumb),
    [displayTitle, item.breadcrumb]
  );

  const [draftQuery, setDraftQuery] = useState(anchorQuery);
  const [activeQuery, setActiveQuery] = useState(anchorQuery);
  const [tab, setTab] = useState<LessonPesquisaTab>("all");
  const [iframeGeneration, setIframeGeneration] = useState(0);

  const iframeSrc = useMemo(() => buildLessonGoogleSearchUrl(activeQuery, tab), [activeQuery, tab]);
  const iframeKey = `${tab}-${iframeGeneration}-${activeQuery}`;

  const submitSearch = useCallback(
    (nextQuery?: string) => {
      const q = (nextQuery ?? draftQuery).trim() || anchorQuery;
      setDraftQuery(q);
      setActiveQuery(q);
      setIframeGeneration((n) => n + 1);
    },
    [anchorQuery, draftQuery]
  );

  const onFormSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitSearch();
  };

  const breadcrumbTrail =
    item.breadcrumb.length > 2 ? item.breadcrumb.slice(-2).join(" › ") : item.breadcrumb.join(" › ");

  const suggestions = useMemo(() => {
    const discipline = item.breadcrumb[0];
    return [
      anchorQuery,
      discipline ? `${displayTitle} ${discipline} resumo` : `${displayTitle} resumo`,
      discipline ? `${displayTitle} exercícios ENEM` : `${displayTitle} ENEM`,
      discipline ? `${displayTitle} video aula` : `${displayTitle} video`
    ].filter((value, index, list) => list.indexOf(value) === index);
  }, [anchorQuery, displayTitle, item.breadcrumb]);

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
          <button type="button" className="btn-primary min-h-9 text-xs" onClick={onExitLessonView}>
            <X className="mr-1 inline h-4 w-4" />
            {COURSES_UI.study.pesquisaModeExit}
          </button>
        </div>
      </header>

      <div className="course-study-pesquisa-mode__toolbar">
        <form className="course-study-pesquisa-mode__search" onSubmit={onFormSubmit}>
          <label className="sr-only" htmlFor="lesson-pesquisa-query">
            {COURSES_UI.study.pesquisaSearchLabel}
          </label>
          <input
            id="lesson-pesquisa-query"
            type="search"
            className="course-study-pesquisa-mode__search-input"
            value={draftQuery}
            onChange={(e) => setDraftQuery(e.target.value)}
            placeholder={COURSES_UI.study.pesquisaSearchPlaceholder}
            autoComplete="off"
          />
          <button type="submit" className="course-study-pesquisa-mode__search-btn btn-primary">
            <Search className="h-4 w-4" aria-hidden />
            <span>{COURSES_UI.study.pesquisaSearchSubmit}</span>
          </button>
        </form>

        <div className="course-study-pesquisa-mode__tabs" role="tablist" aria-label={COURSES_UI.study.pesquisaTabsLabel}>
          {TABS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              role="tab"
              aria-selected={tab === entry.id}
              className={`course-study-pesquisa-mode__tab${tab === entry.id ? " is-active" : ""}`}
              onClick={() => {
                setTab(entry.id);
                setIframeGeneration((n) => n + 1);
              }}
            >
              {entry.label}
            </button>
          ))}
        </div>

        <div className="course-study-pesquisa-mode__chips">
          {suggestions.map((chip) => (
            <button
              key={chip}
              type="button"
              className="course-study-pesquisa-mode__chip"
              onClick={() => submitSearch(chip)}
            >
              {chip}
            </button>
          ))}
        </div>

        <p className="course-study-pesquisa-mode__hint course-text-subtle text-xs leading-relaxed">
          {COURSES_UI.study.pesquisaIframeHint}
        </p>
      </div>

      <div className="course-study-pesquisa-mode__frame-wrap">
        <iframe
          key={iframeKey}
          className="course-study-pesquisa-mode__frame"
          src={iframeSrc}
          title={displayTitle}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        />
      </div>
    </article>
  );
}
