import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  FileText,
  LogOut,
  Menu,
  PlayCircle
} from "lucide-react";
import { CourseCover } from "../components/courses/CourseCover";
import { PortalNav } from "../components/portal/PortalNav";
import { BrandLogo } from "../components/brand/BrandLogo";
import { COURSES_UI, FL_COURSE } from "@ederson-agencia/shared";
import { ApiError, apiAssetUrl, apiGet, apiPut } from "../api";
import { isYoutubeUrl, parseYoutubeVideoId, youtubeEmbedUrl } from "../lib/youtube";
import {
  telegramLessonUrl,
  telegramMessageId,
  telegramSumarioUrl,
  type TelegramConfig
} from "../courses/telegram";
import { useAuthStore } from "../stores/authStore";
import "../styles/course-study.css";

type CurriculumItem = {
  order: number;
  type: "document" | "video";
  id: string;
  slug: string;
  title: string;
  module?: number | null;
  moduleTitle?: string;
  section?: number;
  sectionTitle?: string;
  indexInSection?: number;
  countInSection?: number;
  breadcrumb: string[];
  prev: string | null;
  next: string | null;
};

type CoursePayload = {
  course: { slug: string; title: string; summary: string | null; coverUrl?: string | null };
  curriculum: {
    items: CurriculumItem[];
    modules: { module: number; title: string }[];
    mediaBase: string;
    documentBase: string;
    videoExtensions: string[];
  };
  lessonNotes: Record<string, { html?: string; displayTitle?: string }>;
  bonusContent: { slug: string; title: string; html?: string }[];
  videoManifest: { total: number; present: number; files: Record<string, string> };
  telegram: TelegramConfig;
  telegramMessageMap: Record<string, number>;
  completedSlugs: string[];
};

export function CourseStudyPage() {
  const { courseSlug, "*": rest } = useParams<{ courseSlug: string; "*": string }>();
  const lessonSlug = rest?.replace(/^\//, "").split("/")[0] || "";
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);

  const [payload, setPayload] = useState<CoursePayload | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseSlug) return;
    void (async () => {
      try {
        const data = await apiGet<CoursePayload>(`/courses/${courseSlug}`);
        setPayload(data);
        setCompleted(new Set(data.completedSlugs));
      } catch (err) {
        if (err instanceof ApiError && err.status === 501) {
          setError("content-not-configured");
          return;
        }
        setError(err instanceof Error ? err.message : "Erro ao carregar curso.");
      }
    })();
  }, [courseSlug]);

  const items = payload?.curriculum.items ?? [];
  const bySlug = useMemo(() => new Map(items.map((i) => [i.slug, i])), [items]);
  const activeItem = lessonSlug ? bySlug.get(lessonSlug) : undefined;
  const activeBonus = lessonSlug.startsWith("bonus/")
    ? payload?.bonusContent.find((b) => b.slug === lessonSlug.replace(/^bonus\//, ""))
    : undefined;

  const goLesson = useCallback(
    (slug: string) => {
      if (!courseSlug) return;
      navigate(`/app/cursos/${courseSlug}/${slug}`);
      setSidebarOpen(false);
    },
    [courseSlug, navigate]
  );

  const toggleDone = async (slug: string, done: boolean) => {
    if (!courseSlug) return;
    const next = new Set(completed);
    if (done) next.add(slug);
    else next.delete(slug);
    setCompleted(next);
    await apiPut(`/courses/${courseSlug}/progress`, { lessonSlug: slug, completed: done });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!activeItem || e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowLeft" && activeItem.prev) goLesson(activeItem.prev);
      if (e.key === "ArrowRight" && activeItem.next) goLesson(activeItem.next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeItem, goLesson]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) => i.slug.includes(q) || i.id.toLowerCase().includes(q) || i.title.toLowerCase().includes(q)
    );
  }, [items, search]);

  const trackableSlugs = useMemo(() => items.map((i) => i.slug), [items]);
  const completedTrackable = useMemo(
    () => trackableSlugs.filter((slug) => completed.has(slug)).length,
    [trackableSlugs, completed]
  );
  const progressPct = trackableSlugs.length
    ? Math.round((completedTrackable / trackableSlugs.length) * 100)
    : 0;

  if (error) {
    const notConfigured = error === "content-not-configured";
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-red-300">
          {notConfigured ? COURSES_UI.catalog.contentNotReady : error}
        </p>
        {notConfigured && courseSlug !== FL_COURSE.slug ? (
          <Link to={`/app/cursos/${FL_COURSE.slug}`} className="btn-primary mt-4 inline-flex min-h-11 items-center">
            {COURSES_UI.catalog.openFlTrail}
          </Link>
        ) : null}
        <Link to="/app/cursos" className="btn-secondary mt-4 inline-flex min-h-11 items-center">
          Voltar à academia
        </Link>
      </div>
    );
  }

  if (!payload) {
    return <div className="course-text-muted p-8">{COURSES_UI.study.loading}</div>;
  }

  const videoFile = (id: string) => payload.videoManifest.files[id];

  return (
    <div className="course-study min-h-screen bg-black">
      <header className="course-study__header app-shell-header">
        <div className="flex items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-4 sm:py-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <button
              type="button"
              className="btn-secondary inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center p-2 lg:hidden"
              aria-label="Abrir sumário do curso"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link to="/app/cursos" className="min-w-0 shrink">
              <BrandLogo size="sm" />
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {user ? <PortalNav user={user} /> : null}
            <button
              type="button"
              className="btn-secondary inline-flex min-h-11 min-w-11 items-center justify-center p-2"
              aria-label="Sair"
              onClick={() => {
                clearSession();
                navigate("/");
              }}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="course-study__layout">
        <aside className={`course-study__sidebar ${sidebarOpen ? "is-open" : ""}`}>
          <div className="course-study__sidebar-head">
            <p className="text-xs uppercase tracking-wider text-brand-primary">{COURSES_UI.study.sidebarEyebrow}</p>
            <h1 className="text-lg font-bold">{payload.course.title}</h1>
            <p className="course-text-subtle text-xs">{COURSES_UI.study.sidebarSubtitle}</p>
            <input
              className="input mt-3 text-sm"
              type="search"
              placeholder={COURSES_UI.study.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="course-text-muted mt-3 text-xs">
              {COURSES_UI.study.progressLabel}: {completedTrackable} / {trackableSlugs.length} ({progressPct}
              %)
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-brand-primary transition-all" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
          <nav className="course-study__toc" aria-label={COURSES_UI.study.curriculumHeading}>
            <p className="course-study__toc-heading">{COURSES_UI.study.curriculumHeading}</p>
            {search ? (
              <ul className="space-y-1">
                {filteredItems.map((item) => (
                  <li key={item.slug}>
                    <TocLessonLink
                      item={item}
                      lessonNumber={item.indexInSection ?? item.order + 1}
                      isActive={lessonSlug === item.slug}
                      isDone={completed.has(item.slug)}
                      hasVideo={Boolean(videoFile(item.id))}
                      isYoutube={isYoutubeUrl(videoFile(item.id))}
                      onOpen={() => goLesson(item.slug)}
                      onToggleDone={(done) => void toggleDone(item.slug, done)}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <TocTree
                items={items}
                bonus={payload.bonusContent}
                activeSlug={lessonSlug}
                completed={completed}
                hasVideo={(id) => Boolean(videoFile(id))}
                isYoutube={(id) => isYoutubeUrl(videoFile(id))}
                onSelect={goLesson}
                onSelectBonus={(slug) => goLesson(`bonus/${slug}`)}
                onToggleDone={(slug, done) => void toggleDone(slug, done)}
              />
            )}
          </nav>
        </aside>

        {sidebarOpen ? (
          <button
            type="button"
            className="course-study__backdrop lg:hidden"
            aria-label="Fechar menu"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        <main className="course-study__main">
          {!activeItem && !activeBonus ? (
            <div className="course-study__welcome panel p-5 sm:p-8">
              <CourseCover
                title={payload.course.title}
                coverUrl={payload.course.coverUrl}
                className="course-cover--welcome"
              />
              <h2 className="text-2xl font-bold">{payload.course.title}</h2>
              {payload.course.summary ? <p className="course-text-muted mt-3 text-sm leading-relaxed">{payload.course.summary}</p> : null}
              <p className="course-text-subtle mt-4 text-sm leading-relaxed">{COURSES_UI.study.welcomeHint}</p>
              {items[0] ? (
                <button type="button" className="btn-primary mt-6" onClick={() => goLesson(items[0].slug)}>
                  {COURSES_UI.study.startButton}
                </button>
              ) : null}
            </div>
          ) : activeBonus ? (
            <article className="panel p-6 md:p-8">
              <h2 className="text-xl font-bold">{activeBonus.title}</h2>
              {activeBonus.html ? (
                <div className="course-lesson-prose mt-4 text-sm" dangerouslySetInnerHTML={{ __html: activeBonus.html }} />
              ) : null}
            </article>
          ) : activeItem ? (
            <LessonPanel
              item={activeItem}
              note={payload.lessonNotes[activeItem.slug]}
              documentBase={payload.curriculum.documentBase}
              videoSrc={videoFile(activeItem.id) ? apiAssetUrl(videoFile(activeItem.id)!) : null}
              telegram={payload.telegram}
              telegramMessageMap={payload.telegramMessageMap}
              done={completed.has(activeItem.slug)}
              onToggleDone={(d) => void toggleDone(activeItem.slug, d)}
            />
          ) : null}

          {activeItem ? (
            <nav className="mt-6 flex flex-col-reverse gap-3 border-t border-white/10 pt-4 sm:flex-row sm:flex-wrap sm:justify-between">
              {activeItem.prev ? (
                <button
                  type="button"
                  className="btn-secondary inline-flex w-full min-h-11 items-center justify-center gap-1 sm:w-auto"
                  onClick={() => goLesson(activeItem.prev!)}
                >
                  <ChevronLeft className="h-4 w-4" /> Anterior
                </button>
              ) : (
                <span className="hidden sm:block" />
              )}
              {activeItem.next ? (
                <button
                  type="button"
                  className="btn-primary inline-flex w-full min-h-11 items-center justify-center gap-1 sm:w-auto"
                  onClick={() => goLesson(activeItem.next!)}
                >
                  Próxima <ChevronRight className="h-4 w-4" />
                </button>
              ) : null}
            </nav>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function lessonStatusClass(isActive: boolean, isDone: boolean) {
  if (isActive) return "is-active";
  if (isDone) return "is-done";
  return "is-pending";
}

function lessonKindLabel(
  item: Pick<CurriculumItem, "type">,
  hasVideo: boolean | undefined,
  isYoutube: boolean | undefined
) {
  if (item.type === "document") return COURSES_UI.study.lessonDocument;
  if (isYoutube) return COURSES_UI.study.lessonYoutube;
  if (hasVideo) return COURSES_UI.study.lessonVideo;
  return COURSES_UI.study.lessonTelegram;
}

function TocLessonLink({
  item,
  lessonNumber,
  isActive,
  isDone,
  hasVideo,
  isYoutube,
  onOpen,
  onToggleDone
}: {
  item: Pick<CurriculumItem, "slug" | "id" | "title" | "type">;
  lessonNumber?: number;
  isActive: boolean;
  isDone: boolean;
  hasVideo?: boolean;
  isYoutube?: boolean;
  onOpen: () => void;
  onToggleDone: (done: boolean) => void;
}) {
  const status = lessonStatusClass(isActive, isDone);
  const kind = lessonKindLabel(item, hasVideo, isYoutube);
  const showCode = /^F\d/i.test(item.id);
  const TypeIcon = item.type === "document" ? FileText : PlayCircle;

  return (
    <button type="button" className={`course-study__toc-link w-full ${status}`} onClick={onOpen}>
      <span className="course-study__toc-row">
        <span
          role="checkbox"
          aria-checked={isDone}
          aria-label={isDone ? COURSES_UI.study.lessonCompleted : COURSES_UI.study.lessonPending}
          tabIndex={0}
          className="course-study__toc-status"
          onClick={(e) => {
            e.stopPropagation();
            onToggleDone(!isDone);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onToggleDone(!isDone);
            }
          }}
        >
          {isDone ? <Check className="h-3 w-3 stroke-[3]" aria-hidden /> : null}
          {!isDone && !isActive ? <Circle className="h-2 w-2 fill-white/15 stroke-none" aria-hidden /> : null}
        </span>
        <span className="course-study__lesson-type" aria-hidden>
          <TypeIcon className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <span className="course-study__toc-body">
          <span className="course-study__toc-title line-clamp-2">{item.title}</span>
          <span className="course-study__toc-meta">
            {lessonNumber != null ? (
              <span className="course-study__lesson-index">{String(lessonNumber).padStart(2, "0")}</span>
            ) : null}
            <span className="course-study__lesson-kind">{kind}</span>
            {showCode ? <span className="course-study__lesson-code">{item.id}</span> : null}
            {isActive ? <span className="course-study__toc-badge course-study__toc-badge--active">{COURSES_UI.study.statusActive}</span> : null}
          </span>
        </span>
      </span>
    </button>
  );
}

function countDone(lessons: CurriculumItem[], completed: Set<string>) {
  return lessons.filter((l) => completed.has(l.slug)).length;
}

type ModuleGroup = {
  module: number;
  title: string;
  sections: Map<number, CurriculumItem[]>;
};

function buildModuleGroups(items: CurriculumItem[]) {
  let currentModule: number | null = null;
  const groups: ModuleGroup[] = [];

  for (const item of items) {
    if (item.type === "document") continue;
    const mod = item.module ?? 0;
    if (mod !== currentModule) {
      groups.push({ module: mod, title: item.moduleTitle ?? COURSES_UI.study.moduleLabel(mod), sections: new Map() });
      currentModule = mod;
    }
    const g = groups[groups.length - 1];
    const sec = item.section ?? 0;
    if (!g.sections.has(sec)) g.sections.set(sec, []);
    g.sections.get(sec)!.push(item);
  }

  return groups;
}

function moduleLessonsFlat(group: ModuleGroup) {
  return [...group.sections.values()].flat();
}

function sectionLabelDiffers(group: ModuleGroup, sectionTitle: string | undefined) {
  const t = sectionTitle?.trim();
  if (!t) return false;
  const mt = group.title.trim();
  return t !== mt && !mt.endsWith(t) && !t.startsWith("Aula ");
}

function TocTree({
  items,
  bonus,
  activeSlug,
  completed,
  hasVideo,
  isYoutube,
  onSelect,
  onSelectBonus,
  onToggleDone
}: {
  items: CurriculumItem[];
  bonus: { slug: string; title: string }[];
  activeSlug: string;
  completed: Set<string>;
  hasVideo: (id: string) => boolean;
  isYoutube: (id: string) => boolean;
  onSelect: (slug: string) => void;
  onSelectBonus: (slug: string) => void;
  onToggleDone: (slug: string, done: boolean) => void;
}) {
  const groups = buildModuleGroups(items);
  const docs = items.filter((i) => i.type === "document");

  function renderLessonList(lessons: CurriculumItem[]) {
    return (
      <ul className="course-study__lesson-list">
        {lessons.map((item, i) => (
            <li key={item.slug}>
              <TocLessonLink
                item={item}
                lessonNumber={i + 1}
                isActive={activeSlug === item.slug}
                isDone={completed.has(item.slug)}
                hasVideo={hasVideo(item.id)}
                isYoutube={isYoutube(item.id)}
                onOpen={() => onSelect(item.slug)}
                onToggleDone={(done) => onToggleDone(item.slug, done)}
              />
            </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="course-study__module-stack">
      {docs.length ? (
        <details className="course-study__module-block" open={docs.some((d) => d.slug === activeSlug)}>
          <ModuleSummary
            showIndex={false}
            title={COURSES_UI.study.lessonDocument}
            done={countDone(docs, completed)}
            total={docs.length}
          />
          <div className="course-study__module-body">
            <ul className="course-study__lesson-list">
              {docs.map((item, i) => (
                <li key={item.slug}>
                  <TocLessonLink
                    item={item}
                    lessonNumber={i + 1}
                    isActive={activeSlug === item.slug}
                    isDone={completed.has(item.slug)}
                    onOpen={() => onSelect(item.slug)}
                    onToggleDone={(done) => onToggleDone(item.slug, done)}
                  />
                </li>
              ))}
            </ul>
          </div>
        </details>
      ) : null}

      {groups.map((g, gi) => {
        const lessons = moduleLessonsFlat(g);
        const moduleDone = countDone(lessons, completed);
        const moduleTotal = lessons.length;
        const moduleComplete = moduleTotal > 0 && moduleDone === moduleTotal;
        const containsActive = lessons.some((l) => l.slug === activeSlug);
        const sectionEntries = [...g.sections.entries()];
        const singleSection =
          sectionEntries.length === 1 ||
          sectionEntries.every(([, ls]) => !sectionLabelDiffers(g, ls[0]?.sectionTitle));

        return (
          <details
            key={g.module}
            className={`course-study__module-block ${moduleComplete ? "is-module-complete" : ""}`}
            open={containsActive || gi < 2}
          >
            <ModuleSummary
              moduleIndex={g.module}
              title={g.title}
              done={moduleDone}
              total={moduleTotal}
            />
            <div className="course-study__module-body">
              {singleSection ? (
                renderLessonList(lessons)
              ) : (
                sectionEntries.map(([sec, sectionLessons]) => {
                  const label = sectionLessons[0]?.sectionTitle ?? `Seção ${sec}`;
                  const showLabel = sectionLabelDiffers(g, label);
                  return (
                    <div key={sec} className="course-study__section">
                      {showLabel ? <p className="course-study__section-label">{label}</p> : null}
                      {renderLessonList(sectionLessons)}
                    </div>
                  );
                })
              )}
            </div>
          </details>
        );
      })}

      {bonus.length ? (
        <details
          className="course-study__module-block"
          open={bonus.some((b) => activeSlug === `bonus/${b.slug}`)}
        >
          <ModuleSummary
            moduleIndex={groups.length + 1}
            title={COURSES_UI.study.bonusModule}
            done={0}
            total={bonus.length}
          />
          <div className="course-study__module-body">
            <ul className="course-study__lesson-list">
              {bonus.map((b, i) => (
                <li key={b.slug}>
                  <button
                    type="button"
                    className={`course-study__toc-link w-full text-left ${activeSlug === `bonus/${b.slug}` ? "is-active" : ""}`}
                    onClick={() => onSelectBonus(b.slug)}
                  >
                    <span className="course-study__toc-row">
                      <span className="course-study__lesson-type" aria-hidden>
                        <FileText className="h-4 w-4" strokeWidth={1.75} />
                      </span>
                      <span className="course-study__toc-body">
                        <span className="course-study__toc-title line-clamp-2">{b.title}</span>
                        <span className="course-study__toc-meta">
                          <span className="course-study__lesson-index">{String(i + 1).padStart(2, "0")}</span>
                          <span className="course-study__lesson-kind">{COURSES_UI.study.bonusModule}</span>
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </details>
      ) : null}
    </div>
  );
}

function ModuleSummary({
  moduleIndex = 1,
  showIndex = true,
  title,
  done,
  total
}: {
  moduleIndex?: number;
  showIndex?: boolean;
  title: string;
  done: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const complete = total > 0 && done === total;

  return (
    <summary className="course-study__module-summary">
      <span className="course-study__module-summary-main">
        <ChevronDown className="course-study__module-chevron h-4 w-4 shrink-0" aria-hidden />
        {showIndex ? (
          <span className="course-study__module-index">{String(moduleIndex).padStart(2, "0")}</span>
        ) : null}
        <span className="course-study__module-title line-clamp-2">{title}</span>
      </span>
      <span className="course-study__module-stats">
        <span className={`course-study__module-count ${complete ? "is-complete" : ""}`}>
          {COURSES_UI.study.moduleProgress(done, total)} {COURSES_UI.study.moduleLessonsWord(total)}
        </span>
        <span className="course-study__module-progress" aria-hidden>
          <span className="course-study__module-progress-fill" style={{ width: `${pct}%` }} />
        </span>
      </span>
    </summary>
  );
}

function TelegramPanel({
  item,
  telegram,
  messageMap,
  primary
}: {
  item: CurriculumItem;
  telegram: TelegramConfig;
  messageMap: Record<string, number>;
  primary?: boolean;
}) {
  const url = telegramLessonUrl(item, telegram, messageMap);
  const sumario = telegramSumarioUrl(telegram);
  if (!url) return null;
  const msgId = telegramMessageId(item, telegram, messageMap);

  return (
    <section
      className={`course-study__telegram ${primary ? "course-study__telegram--primary" : ""}`}
      aria-label="Aula no Telegram"
    >
      <p className="text-sm">{primary ? COURSES_UI.study.telegramPrimary : COURSES_UI.study.telegramBackup}</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <a
          className="btn-primary inline-flex min-h-11 w-full items-center justify-center sm:w-auto"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {COURSES_UI.study.telegramOpen}
        </a>
        {sumario ? (
          <a
            className="btn-secondary inline-flex min-h-11 w-full items-center justify-center sm:w-auto"
            href={sumario}
            target="_blank"
            rel="noopener noreferrer"
          >
            {COURSES_UI.study.telegramIndex}
          </a>
        ) : null}
      </div>
      <p className="course-text-faint mt-2 text-xs">
        {COURSES_UI.study.telegramRef}: <code className="text-brand-primary">{msgId}</code> · {item.id}
      </p>
    </section>
  );
}

function LessonPanel({
  item,
  note,
  documentBase,
  videoSrc,
  telegram,
  telegramMessageMap,
  done,
  onToggleDone
}: {
  item: CurriculumItem;
  note?: { html?: string; displayTitle?: string };
  documentBase: string;
  videoSrc: string | null;
  telegram: TelegramConfig;
  telegramMessageMap: Record<string, number>;
  done: boolean;
  onToggleDone: (done: boolean) => void;
}) {
  const title = note?.displayTitle ?? item.title;
  const pdfUrl = `${documentBase}/${item.id}.pdf`;
  const youtubeId = videoSrc ? parseYoutubeVideoId(videoSrc) : null;
  const useTelegramPrimary = !videoSrc && telegram.enabled;

  return (
    <article className="panel p-4 sm:p-6 md:p-8">
      <p className="course-text-subtle text-xs">{item.breadcrumb.join(" › ")}</p>
      <h2 className="mt-2 text-xl font-bold text-white">{title}</h2>
      <p className="mt-1 font-mono text-sm text-brand-primary">{item.id}</p>

      {item.type === "document" ? (
        <div className="mt-6 space-y-4">
          <object data={pdfUrl} type="application/pdf" className="h-[50vh] w-full rounded-lg bg-white/5">
            <p className="course-text-muted text-sm">{COURSES_UI.study.pdfFallback}</p>
          </object>
          <TelegramPanel item={item} telegram={telegram} messageMap={telegramMessageMap} primary />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {youtubeId ? (
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
              <iframe
                title={title}
                className="h-full w-full border-0"
                src={youtubeEmbedUrl(youtubeId)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          ) : videoSrc ? (
            <video controls playsInline preload="metadata" className="w-full rounded-lg bg-black">
              <source src={videoSrc} type="video/mp4" />
            </video>
          ) : null}
          {useTelegramPrimary ? (
            <TelegramPanel item={item} telegram={telegram} messageMap={telegramMessageMap} primary />
          ) : videoSrc ? (
            <TelegramPanel item={item} telegram={telegram} messageMap={telegramMessageMap} />
          ) : null}
        </div>
      )}

      {note?.html ? (
        <div className="course-lesson-prose mt-6 border-t border-white/10 pt-6 text-sm" dangerouslySetInnerHTML={{ __html: note.html }} />
      ) : null}

      <div className={`course-study__lesson-complete ${done ? "is-done" : ""}`}>
        <div className="course-study__lesson-complete-head">
          <div>
            <p className="text-sm font-semibold text-white">
              {done ? COURSES_UI.study.lessonCompleted : COURSES_UI.study.lessonPending}
            </p>
            <p className="course-text-subtle mt-1 text-xs leading-relaxed">
              {done
                ? "Progresso salvo na sua conta. Você pode desmarcar se quiser rever a aula depois."
                : "Ao terminar de assistir, marque a aula para atualizar a trilha na barra lateral."}
            </p>
          </div>
          <button
            type="button"
            className={done ? "btn-secondary min-h-11 text-sm" : "btn-primary min-h-11 text-sm"}
            onClick={() => onToggleDone(!done)}
          >
            {done ? COURSES_UI.study.markUndone : COURSES_UI.study.markDone}
          </button>
        </div>
      </div>
    </article>
  );
}
