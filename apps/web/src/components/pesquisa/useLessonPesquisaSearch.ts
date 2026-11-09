import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildLessonGoogleSearchUrl,
  defaultLessonSearchQuery,
  type LessonPesquisaTab
} from "../../lib/lesson-google-pesquisa";
import { loadLessonPesquisaSession, saveLessonPesquisaSession } from "../../lib/lesson-pesquisa-session";

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

export function useLessonPesquisaSearch(lessonSlug: string, displayTitle: string, breadcrumb: string[]) {
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

  const onFormSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      submitSearch();
    },
    [submitSearch]
  );

  const selectTab = useCallback((next: LessonPesquisaTab) => {
    setTab(next);
    setIframeGeneration((n) => n + 1);
  }, []);

  const suggestions = useMemo(() => {
    const discipline = breadcrumb[0];
    return [
      anchorQuery,
      discipline ? `${displayTitle} ${discipline} resumo` : `${displayTitle} resumo`,
      discipline ? `${displayTitle} exercícios ENEM` : `${displayTitle} ENEM`,
      discipline ? `${displayTitle} video aula` : `${displayTitle} video`
    ].filter((value, index, list) => list.indexOf(value) === index);
  }, [anchorQuery, displayTitle, breadcrumb]);

  return {
    anchorQuery,
    draftQuery,
    setDraftQuery,
    activeQuery,
    tab,
    selectTab,
    iframeSrc,
    iframeKey,
    submitSearch,
    onFormSubmit,
    suggestions
  };
}

export type LessonPesquisaSearch = ReturnType<typeof useLessonPesquisaSearch>;
