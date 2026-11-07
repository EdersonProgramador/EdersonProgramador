import { ACADEMY_APP_BASE, COURSES_UI } from "@ederson-agencia/shared";
import {
  telegramLessonUrl,
  telegramMessageId,
  telegramSumarioUrl,
  type TelegramConfig
} from "../../courses/telegram";
import { enhanceLessonProseHtml } from "../../lib/scripture-prose";
import { parseYoutubeVideoId, youtubeEmbedUrl } from "../../lib/youtube";

export type LessonConsumoItem = {
  order: number;
  slug: string;
  id: string;
  title: string;
  type: "document" | "video" | "article";
};

type Props = {
  courseSlug: string;
  item: LessonConsumoItem;
  displayTitle: string;
  noteHtml?: string;
  videoSrc: string | null;
  pdfSrc: string | null;
  telegram: TelegramConfig;
  telegramMessageMap: Record<string, number>;
  /** Classes no container de mídia (vídeo/PDF). */
  mediaClassName?: string;
  pdfClassName?: string;
  videoWrapClassName?: string;
  videoNativeClassName?: string;
  proseClassName?: string;
};

function rewriteCourseLibraryLinks(html: string, courseSlug: string): string {
  return html.replace(
    /href="(biblioteca\/[^"]+)"/g,
    (_, path: string) => `href="${ACADEMY_APP_BASE}/cursos/${courseSlug}/${path}"`
  );
}

function LessonTelegramPanel({
  item,
  telegram,
  messageMap,
  primary
}: {
  item: LessonConsumoItem;
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

export function lessonHasConsumableMaterial(
  item: LessonConsumoItem,
  opts: {
    pdfSrc: string | null;
    videoSrc: string | null;
    noteHtml?: string;
    telegram: TelegramConfig;
    telegramMessageMap: Record<string, number>;
  }
): boolean {
  const showMediaBlock = Boolean(opts.pdfSrc || item.type === "video");
  if (showMediaBlock || opts.noteHtml?.trim()) return true;
  if (item.type === "article" && telegramLessonUrl(item, opts.telegram, opts.telegramMessageMap)) return true;
  return false;
}

/** Vídeo, PDF, Telegram e texto publicado na aula (mesma lógica da visualização completa). */
export function LessonConsumo({
  courseSlug,
  item,
  displayTitle,
  noteHtml,
  videoSrc,
  pdfSrc,
  telegram,
  telegramMessageMap,
  mediaClassName = "space-y-4",
  pdfClassName = "h-[50vh] w-full rounded-lg bg-white/5",
  videoWrapClassName = "aspect-video w-full overflow-hidden rounded-lg bg-black",
  videoNativeClassName = "w-full rounded-lg bg-black",
  proseClassName = "course-lesson-prose border-t border-[var(--app-border)] pt-4 text-sm"
}: Props) {
  const youtubeId = videoSrc ? parseYoutubeVideoId(videoSrc) : null;
  const useTelegramPrimary = item.type === "document" || (!videoSrc && telegram.enabled);
  const showMediaBlock = Boolean(pdfSrc || item.type === "video");
  const prose = noteHtml?.trim();

  return (
    <div className="course-study-fichamento-mode__consumo-inner">
      {showMediaBlock ? (
        <div className={mediaClassName}>
          {pdfSrc ? (
            <object data={pdfSrc} type="application/pdf" className={pdfClassName}>
              <p className="course-text-muted text-sm">{COURSES_UI.study.pdfFallback}</p>
            </object>
          ) : null}
          {item.type === "video" ? (
            <>
              {youtubeId ? (
                <div className={videoWrapClassName}>
                  <iframe
                    title={displayTitle}
                    className="h-full w-full border-0"
                    src={youtubeEmbedUrl(youtubeId)}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              ) : videoSrc ? (
                <video controls playsInline preload="metadata" className={videoNativeClassName}>
                  <source src={videoSrc} type="video/mp4" />
                </video>
              ) : null}
            </>
          ) : null}
          {useTelegramPrimary && item.type !== "article" ? (
            <LessonTelegramPanel item={item} telegram={telegram} messageMap={telegramMessageMap} primary />
          ) : item.type === "video" && videoSrc ? (
            <LessonTelegramPanel item={item} telegram={telegram} messageMap={telegramMessageMap} />
          ) : null}
        </div>
      ) : null}

      {prose ? (
        <div
          className={proseClassName}
          dangerouslySetInnerHTML={{
            __html: enhanceLessonProseHtml(rewriteCourseLibraryLinks(prose, courseSlug))
          }}
        />
      ) : null}

      {!showMediaBlock && !prose && item.type === "article" ? (
        <LessonTelegramPanel item={item} telegram={telegram} messageMap={telegramMessageMap} primary />
      ) : null}
    </div>
  );
}
