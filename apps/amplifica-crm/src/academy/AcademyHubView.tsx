import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, GraduationCap, Store } from "lucide-react";
import { ACADEMY_STORE_BASE, AGENCY_SYSTEM_HOME } from "@ederson-agencia/shared";
import { cn } from "../lib/utils";
import { AcademyAnalysisPanel } from "./panels/AcademyAnalysisPanel";
import { AcademyCourseContentPanel } from "./panels/AcademyCourseContentPanel";
import { AcademyCoursesPanel } from "./panels/AcademyCoursesPanel";
import { AcademyTrailPreviewPanel } from "./panels/AcademyTrailPreviewPanel";

type AcademyTab = "courses" | "analysis";

function readAcademyUrlState(): { tab: AcademyTab; courseId: string | null } {
  if (typeof window === "undefined") return { tab: "courses", courseId: null };
  const p = new URLSearchParams(window.location.search);
  const courseId = p.get("academyCourseId");
  const tab = p.get("academyTab") === "analysis" ? "analysis" : "courses";
  return { tab, courseId };
}

function syncAcademyUrl(tab: AcademyTab, contentCourseId: string | null) {
  const url = new URL(window.location.href);
  url.searchParams.set("view", "academy");
  if (contentCourseId) {
    url.searchParams.set("academyCourseId", contentCourseId);
    url.searchParams.delete("academyTab");
  } else if (tab === "analysis") {
    url.searchParams.set("academyTab", "analysis");
    url.searchParams.delete("academyCourseId");
  } else {
    url.searchParams.delete("academyTab");
    url.searchParams.delete("academyCourseId");
  }
  window.history.replaceState({}, "", `${url.pathname}${url.search}`);
}

export default function AcademyHubView() {
  const [tab, setTab] = useState<AcademyTab>(() => readAcademyUrlState().tab);
  const [contentCourseId, setContentCourseId] = useState<string | null>(() => readAcademyUrlState().courseId);
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);

  const applyUrl = useCallback((nextTab: AcademyTab, courseId: string | null) => {
    setTab(nextTab);
    setContentCourseId(courseId);
    setPreviewSlug(null);
    syncAcademyUrl(nextTab, courseId);
  }, []);

  const onPreview = useCallback((slug: string) => {
    setPreviewSlug(slug);
  }, []);

  useEffect(() => {
    const onPop = () => {
      const next = readAcademyUrlState();
      setTab(next.tab);
      setContentCourseId(next.courseId);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const inner = useMemo(() => {
    if (contentCourseId) {
      return (
        <AcademyCourseContentPanel
          courseId={contentCourseId}
          onBack={() => {
            applyUrl(tab, null);
          }}
          onPreview={onPreview}
        />
      );
    }
    if (tab === "analysis") {
      return (
        <AcademyAnalysisPanel
          onOpenCourses={() => applyUrl("courses", null)}
          onOpenContent={(id) => applyUrl("courses", id)}
          onPreview={onPreview}
        />
      );
    }
    return <AcademyCoursesPanel onOpenContent={(id) => applyUrl("courses", id)} onPreview={onPreview} />;
  }, [tab, contentCourseId, applyUrl, onPreview]);

  return (
    <div className="academy-crm-root flex h-full min-h-0 flex-1 flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3 dark:border-gray-800">
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={AGENCY_SYSTEM_HOME}
            className="inline-flex items-center gap-1.5 rounded-xl px-2 py-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-indigo-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            CRM
          </a>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Academia">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "courses" && !contentCourseId}
              onClick={() => applyUrl("courses", null)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition",
                tab === "courses" && !contentCourseId
                  ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                  : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
              )}
            >
              <GraduationCap className="h-4 w-4" aria-hidden />
              Cursos
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "analysis" && !contentCourseId}
              onClick={() => applyUrl("analysis", null)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition",
                tab === "analysis" && !contentCourseId
                  ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                  : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
              )}
            >
              <BookOpen className="h-4 w-4" aria-hidden />
              Análise
            </button>
          </div>
        </div>
        <a
          href={ACADEMY_STORE_BASE}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold uppercase tracking-widest text-gray-600 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-gray-700 dark:text-gray-300"
        >
          <Store className="h-3.5 w-3.5" aria-hidden />
          Loja
        </a>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto pb-6">
        {previewSlug ? (
          <AcademyTrailPreviewPanel courseSlug={previewSlug} onClose={() => setPreviewSlug(null)} />
        ) : (
          inner
        )}
      </div>
    </div>
  );
}