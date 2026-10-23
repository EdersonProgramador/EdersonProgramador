import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, LogOut, Menu } from "lucide-react";
import { PortalNav } from "../components/portal/PortalNav";
import { BrandLogo } from "../components/brand/BrandLogo";
import { COURSES_UI } from "@ederson-agencia/shared";
import { apiAssetUrl, apiGet, apiPut } from "../api";
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
  course: { slug: string; title: string; summary: string | null };
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

  const progressPct = items.length ? Math.round((completed.size / items.length) * 100) : 0;

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-red-300">{error}</p>
        <Link to="/app/cursos" className="btn-primary mt-6 inline-block">
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
      <header className="border-b border-white/10 bg-brand-surface/95 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <button type="button" className="btn-secondary p-2 lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <Link to="/">
              <BrandLogo size="sm" />
            </Link>
          </div>
          {user ? <PortalNav user={user} /> : null}
          <button
            type="button"
            className="btn-secondary p-2"
            onClick={() => {
              clearSession();
              navigate("/");
            }}
          >
            <LogOut className="h-4 w-4" />
          </button>
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
              {COURSES_UI.study.progressLabel}: {completed.size} / {items.length} ({progressPct}%)
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-brand-primary transition-all" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
          <nav className="course-study__toc">
            {search ? (
              <ul className="space-y-1">
                {filteredItems.map((item) => (
                  <li key={item.slug}>
                    <button
                      type="button"
                      className={`course-study__toc-link w-full text-left ${lessonSlug === item.slug ? "is-active" : ""}`}
                      onClick={() => goLesson(item.slug)}
                    >
                      <span className="font-mono text-xs text-brand-primary">{item.id}</span> {item.title}
                    </button>
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
                onSelect={goLesson}
                onSelectBonus={(slug) => goLesson(`bonus/${slug}`)}
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
            <div className="course-study__welcome panel p-8">
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
            <nav className="mt-6 flex flex-wrap justify-between gap-3 border-t border-white/10 pt-4">
              {activeItem.prev ? (
                <button type="button" className="btn-secondary inline-flex items-center gap-1" onClick={() => goLesson(activeItem.prev!)}>
                  <ChevronLeft className="h-4 w-4" /> Anterior
                </button>
              ) : (
                <span />
              )}
              {activeItem.next ? (
                <button type="button" className="btn-primary inline-flex items-center gap-1" onClick={() => goLesson(activeItem.next!)}>
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

function TocTree({
  items,
  bonus,
  activeSlug,
  completed,
  hasVideo,
  onSelect,
  onSelectBonus
}: {
  items: CurriculumItem[];
  bonus: { slug: string; title: string }[];
  activeSlug: string;
  completed: Set<string>;
  hasVideo: (id: string) => boolean;
  onSelect: (slug: string) => void;
  onSelectBonus: (slug: string) => void;
}) {
  let currentModule: number | null = null;
  const groups: { module: number; title: string; sections: Map<number, CurriculumItem[]> }[] = [];

  for (const item of items) {
    if (item.type === "document") continue;
    const mod = item.module ?? 0;
    if (mod !== currentModule) {
      groups.push({ module: mod, title: item.moduleTitle ?? `Módulo ${mod}`, sections: new Map() });
      currentModule = mod;
    }
    const g = groups[groups.length - 1];
    const sec = item.section ?? 0;
    if (!g.sections.has(sec)) g.sections.set(sec, []);
    g.sections.get(sec)!.push(item);
  }

  const doc = items.find((i) => i.type === "document");

  return (
    <div className="space-y-2">
      {doc ? (
        <button
          type="button"
          className={`course-study__toc-link w-full text-left ${activeSlug === doc.slug ? "is-active" : ""}`}
          onClick={() => onSelect(doc.slug)}
        >
          {doc.id} — {doc.title}
        </button>
      ) : null}
      {groups.map((g) => (
        <details key={g.module} className="course-study__module" open={g.module <= 3}>
          <summary className="cursor-pointer text-sm font-medium">
            Módulo {g.module} — {g.title}
          </summary>
          {[...g.sections.entries()].map(([sec, lessons]) => (
            <details key={sec} className="ml-2 mt-1">
              <summary className="course-text-muted cursor-pointer text-xs">
                {lessons[0]?.sectionTitle ?? `Seção ${sec}`}
              </summary>
              <ul className="ml-2 mt-1 space-y-0.5">
                {lessons.map((item) => (
                  <li key={item.slug}>
                    <button
                      type="button"
                      className={`course-study__toc-link w-full text-left text-xs ${activeSlug === item.slug ? "is-active" : ""} ${completed.has(item.slug) ? "is-done" : ""}`}
                      onClick={() => onSelect(item.slug)}
                    >
                      <span className="font-mono text-brand-primary">{item.id}</span>
                      {hasVideo(item.id) ? " ▶" : " 📱"}
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </details>
      ))}
      {bonus.length ? (
        <details className="course-study__module">
          <summary className="cursor-pointer text-sm font-medium">Módulo 12 — {COURSES_UI.study.bonusModule}</summary>
          <ul className="ml-2 mt-1 space-y-0.5">
            {bonus.map((b) => (
              <li key={b.slug}>
                <button
                  type="button"
                  className="course-study__toc-link w-full text-left text-xs"
                  onClick={() => onSelectBonus(b.slug)}
                >
                  {b.title}
                </button>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
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
      <div className="mt-3 flex flex-wrap gap-2">
        <a className="btn-primary" href={url} target="_blank" rel="noopener noreferrer">
          {COURSES_UI.study.telegramOpen}
        </a>
        {sumario ? (
          <a className="btn-secondary" href={sumario} target="_blank" rel="noopener noreferrer">
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
  const useTelegramPrimary = !videoSrc && telegram.enabled;

  return (
    <article className="panel p-6 md:p-8">
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
          {videoSrc ? (
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

      <label className="course-text-muted mt-6 flex cursor-pointer items-center gap-2 text-sm">
        <input type="checkbox" checked={done} onChange={(e) => onToggleDone(e.target.checked)} />
        {COURSES_UI.study.markDone}
      </label>
    </article>
  );
}
