import { COURSES_UI } from "@ederson-agencia/shared";
import { Search } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildLessonGoogleSearchUrl,
  defaultLessonSearchQuery,
  type LessonPesquisaTab
} from "../../lib/lesson-google-pesquisa";
import { loadLessonPesquisaSession, saveLessonPesquisaSession } from "../../lib/lesson-pesquisa-session";

const TABS: { id: LessonPesquisaTab; label: string }[] = [
  { id: "all", label: COURSES_UI.study.pesquisaTabAll },
  { id: "trusted", label: COURSES_UI.study.pesquisaTabTrusted },
  { id: "videos", label: COURSES_UI.study.pesquisaTabVideos },
  { id: "news", label: COURSES_UI.study.pesquisaTabNews },
  { id: "scholar", label: COURSES_UI.study.pesquisaTabScholar },
  { id: "books", label: COURSES_UI.study.pesquisaTabBooks }
];

type Props = {
  lessonSlug: string;
  displayTitle: string;
  breadcrumb: string[];
  variant?: "full" | "embed";
  searchInputId?: string;
  onOpenFullscreen?: () => void;
};

function initialPesquisaState(lessonSlug: string, anchorQuery: string) {
  const saved = loadLessonPesquisaSession(lessonSlug);
  if (saved) return saved;
  return {
    draftQuery: anchorQuery,
    activeQuery: anchorQuery,
    tab: "all" as LessonPesquisaTab,
    iframeGeneration: 0
  };
}

export function LessonPesquisaPanel({
  lessonSlug,
  displayTitle,
  breadcrumb,
  variant = "full",
  searchInputId = "lesson-pesquisa-query",
  onOpenFullscreen
}: Props) {
  const anchorQuery = useMemo(() => defaultLessonSearchQuery(displayTitle, breadcrumb), [displayTitle, breadcrumb]);

  const initialRef = useRef(initialPesquisaState(lessonSlug, anchorQuery));
  const [draftQuery, setDraftQuery] = useState(initialRef.current.draftQuery);
  const [activeQuery, setActiveQuery] = useState(initialRef.current.activeQuery);
  const [tab, setTab] = useState<LessonPesquisaTab>(initialRef.current.tab);
  const [iframeGeneration, setIframeGeneration] = useState(initialRef.current.iframeGeneration);

  useEffect(() => {
    const saved = loadLessonPesquisaSession(lessonSlug);
    if (saved) {
      setDraftQuery(saved.draftQuery);
      setActiveQuery(saved.activeQuery);
      setTab(saved.tab);
      setIframeGeneration(saved.iframeGeneration);
      return;
    }
    setDraftQuery(anchorQuery);
    setActiveQuery(anchorQuery);
    setTab("all");
    setIframeGeneration(0);
  }, [lessonSlug, anchorQuery]);

  useEffect(() => {
    saveLessonPesquisaSession(lessonSlug, { draftQuery, activeQuery, tab, iframeGeneration });
  }, [lessonSlug, draftQuery, activeQuery, tab, iframeGeneration]);

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

  const suggestions = useMemo(() => {
    const discipline = breadcrumb[0];
    return [
      anchorQuery,
      discipline ? `${displayTitle} ${discipline} resumo` : `${displayTitle} resumo`,
      discipline ? `${displayTitle} exercícios ENEM` : `${displayTitle} ENEM`,
      discipline ? `${displayTitle} video aula` : `${displayTitle} video`
    ].filter((value, index, list) => list.indexOf(value) === index);
  }, [anchorQuery, displayTitle, breadcrumb]);

  const isEmbed = variant === "embed";

  return (
    <div
      className={`course-study-pesquisa-panel${isEmbed ? " course-study-pesquisa-panel--embed" : " course-study-pesquisa-panel--full"}`}
    >
      <div className={`course-study-pesquisa-mode__toolbar${isEmbed ? " course-study-pesquisa-mode__toolbar--embed" : ""}`}>
        <form className="course-study-pesquisa-mode__search" onSubmit={onFormSubmit}>
          <label className="sr-only" htmlFor={searchInputId}>
            {COURSES_UI.study.pesquisaSearchLabel}
          </label>
          <input
            id={searchInputId}
            type="search"
            className="course-study-pesquisa-mode__search-input"
            value={draftQuery}
            onChange={(e) => setDraftQuery(e.target.value)}
            placeholder={COURSES_UI.study.pesquisaSearchPlaceholder}
            autoComplete="off"
          />
          <button type="submit" className="course-study-pesquisa-mode__search-btn btn-primary">
            <Search className="h-4 w-4" aria-hidden />
            <span className={isEmbed ? "hidden sm:inline" : undefined}>{COURSES_UI.study.pesquisaSearchSubmit}</span>
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

        {!isEmbed ? (
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
        ) : (
          <div className="course-study-pesquisa-mode__chips course-study-pesquisa-mode__chips--compact">
            {suggestions.slice(0, 2).map((chip) => (
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
        )}

        {isEmbed ? (
          <div className="course-study-pesquisa-panel__embed-actions">
            <a
              className="course-text-subtle text-xs underline-offset-2 hover:underline"
              href={iframeSrc}
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
          key={iframeKey}
          className={`course-study-pesquisa-mode__frame${isEmbed ? " course-study-pesquisa-mode__frame--embed" : ""}`}
          src={iframeSrc}
          title={displayTitle}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        />
      </div>
    </div>
  );
}
