import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, FileText, PlayCircle } from "lucide-react";
import { ACADEMY_STORE_BASE, COURSES_UI } from "@ederson-agencia/shared";
import { CourseCover } from "../CourseCover";
import { apiGet } from "../../services/agencyAcademyApi";
import { isYoutubeUrl, parseYoutubeVideoId, youtubeEmbedUrl } from "../../lib/youtube";
import { cn } from "../../lib/utils";

type TrailItem = {
  order: number;
  type: "document" | "video" | "article";
  id: string;
  slug: string;
  title: string;
  module?: number | null;
  moduleTitle?: string;
  section?: number;
  sectionTitle?: string;
  breadcrumb: string[];
  prev: string | null;
  next: string | null;
  lessonStatus?: "DRAFT" | "PUBLISHED";
};

type TrailPreviewPayload = {
  preview: true;
  includesDrafts?: boolean;
  course: {
    slug: string;
    title: string;
    summary: string | null;
    coverUrl: string | null;
  };
  curriculum: {
    items: TrailItem[];
    modules: { module: number; title: string }[];
    documentBase: string;
  };
  lessonNotes: Record<string, { html?: string; displayTitle?: string }>;
  videoManifest: { files: Record<string, string> };
};

export type AcademyTrailPreviewPanelProps = {
  courseSlug: string;
  onClose: () => void;
};

function resolveVideoSrc(item: TrailItem, files: Record<string, string>): string | null {
  const fromManifest = files[item.id];
  if (fromManifest?.trim()) return fromManifest.trim();
  return null;
}

function resolvePdfSrc(
  item: TrailItem,
  documentBase: string,
  files: Record<string, string>
): string | null {
  if (item.type !== "document") return null;
  const fromManifest = files[item.id];
  if (fromManifest?.trim()) return fromManifest.trim();
  return `${documentBase}/${item.id}.pdf`;
}

function groupByModule(items: TrailItem[]) {
  const map = new Map<number, { title: string; items: TrailItem[] }>();
  for (const item of items) {
    const mod = item.module ?? 1;
    if (!map.has(mod)) {
      map.set(mod, { title: item.moduleTitle ?? `Módulo ${mod}`, items: [] });
    }
    map.get(mod)!.items.push(item);
  }
  return [...map.entries()].sort(([a], [b]) => a - b);
}

function LessonMedia({
  item,
  videoSrc,
  pdfSrc,
  noteHtml
}: {
  item: TrailItem;
  videoSrc: string | null;
  pdfSrc: string | null;
  noteHtml?: string;
}) {
  const yt = videoSrc && isYoutubeUrl(videoSrc) ? parseYoutubeVideoId(videoSrc) : null;

  return (
    <div className="space-y-4">
      {yt ? (
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
          <iframe
            title={item.title}
            src={youtubeEmbedUrl(yt)}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : videoSrc && item.type === "video" ? (
        <video className="aspect-video w-full rounded-xl bg-black" src={videoSrc} controls playsInline />
      ) : null}
      {pdfSrc ? (
        <a
          href={pdfSrc}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-indigo-600 dark:border-gray-700"
        >
          <FileText className="h-4 w-4" aria-hidden />
          Abrir documento
        </a>
      ) : null}
      {noteHtml?.trim() ? (
        <div
          className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 prose-p:text-gray-700 dark:prose-headings:text-gray-100 dark:prose-p:text-gray-300"
          dangerouslySetInnerHTML={{ __html: noteHtml }}
        />
      ) : !videoSrc && !pdfSrc ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Sem conteúdo publicado nesta aula.</p>
      ) : null}
    </div>
  );
}

export function AcademyTrailPreviewPanel({ courseSlug, onClose }: AcademyTrailPreviewPanelProps) {
  const [payload, setPayload] = useState<TrailPreviewPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<TrailPreviewPayload>(
        `/admin/courses/by-slug/${encodeURIComponent(courseSlug)}/trail-preview`
      );
      setPayload(data);
      setActiveSlug(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar trilha.");
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, [courseSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  const items = payload?.curriculum.items ?? [];
  const bySlug = useMemo(() => new Map(items.map((i) => [i.slug, i])), [items]);
  const active = activeSlug ? bySlug.get(activeSlug) : undefined;
  const groups = useMemo(() => groupByModule(items), [items]);
  const copy = COURSES_UI.study;

  return (
    <div className="flex h-full min-h-[32rem] flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 dark:border-gray-800">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          Pré-visualização · <span className="font-mono text-indigo-600 dark:text-indigo-400">{courseSlug}</span>
          {payload?.includesDrafts ? (
            <span className="ml-2 rounded-md bg-amber-100 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
              inclui rascunhos
            </span>
          ) : null}
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href={`${ACADEMY_STORE_BASE}/${encodeURIComponent(courseSlug)}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-600 hover:border-indigo-200 dark:border-gray-700 dark:text-gray-300"
          >
            Página pública
          </a>
          <button
            type="button"
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700"
            onClick={onClose}
          >
            Fechar prévia
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-sm text-gray-500">{copy.loading}</p>
      ) : null}
      {error ? <p className="text-center text-sm text-red-500">{error}</p> : null}

      {payload && !loading && !error ? (
        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[min(18rem,34%)_1fr]">
          <aside className="max-h-[70vh] overflow-y-auto rounded-2xl border border-gray-100 bg-gray-50/80 p-3 dark:border-gray-800 dark:bg-gray-900/40 lg:max-h-none">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">Sumário</p>
            {groups.map(([moduleNum, group]) => (
              <details key={moduleNum} className="mb-2" open={moduleNum <= 2}>
                <summary className="cursor-pointer list-none text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {group.title}
                </summary>
                <ul className="mt-1 space-y-0.5 pl-1">
                  {group.items.map((lesson) => (
                    <li key={lesson.slug}>
                      <button
                        type="button"
                        className={cn(
                          "flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition",
                          activeSlug === lesson.slug
                            ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-200"
                            : "text-gray-600 hover:bg-white dark:text-gray-400 dark:hover:bg-gray-800"
                        )}
                        onClick={() => setActiveSlug(lesson.slug)}
                      >
                        {lesson.type === "video" ? (
                          <PlayCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                        ) : (
                          <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="line-clamp-2 font-medium">{lesson.title}</span>
                          {lesson.lessonStatus === "DRAFT" ? (
                            <span className="text-[0.65rem] uppercase text-amber-600 dark:text-amber-400">Rascunho</span>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </aside>

          <main className="min-h-0 overflow-y-auto rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-950/50 sm:p-6">
            {!active ? (
              <div className="space-y-4">
                <CourseCover
                  title={payload.course.title}
                  coverUrl={payload.course.coverUrl}
                  className="course-cover--card max-w-md"
                />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{payload.course.title}</h2>
                {payload.course.summary ? (
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{payload.course.summary}</p>
                ) : null}
                <p className="text-sm text-gray-500 dark:text-gray-500">{copy.welcomeHint}</p>
                {items[0] ? (
                  <button
                    type="button"
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700"
                    onClick={() => setActiveSlug(items[0].slug)}
                  >
                    {copy.startButton}
                  </button>
                ) : (
                  <p className="text-sm text-gray-500">Nenhuma aula cadastrada.</p>
                )}
              </div>
            ) : (
              <article className="space-y-4">
                <p className="text-xs text-gray-500">{active.breadcrumb.join(" › ")}</p>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {payload.lessonNotes[active.slug]?.displayTitle ?? active.title}
                </h2>
                <LessonMedia
                  item={active}
                  videoSrc={resolveVideoSrc(active, payload.videoManifest.files)}
                  pdfSrc={resolvePdfSrc(active, payload.curriculum.documentBase, payload.videoManifest.files)}
                  noteHtml={payload.lessonNotes[active.slug]?.html}
                />
                <nav className="flex flex-wrap justify-between gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
                  {active.prev ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold dark:border-gray-700"
                      onClick={() => setActiveSlug(active.prev)}
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden />
                      Anterior
                    </button>
                  ) : (
                    <span />
                  )}
                  {active.next ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white"
                      onClick={() => setActiveSlug(active.next)}
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </button>
                  ) : null}
                </nav>
              </article>
            )}
          </main>
        </div>
      ) : null}
    </div>
  );
}