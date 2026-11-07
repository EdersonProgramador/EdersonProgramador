import { COURSES_UI } from "@ederson-agencia/shared";
import { ChevronLeft, ChevronRight, LayoutPanelLeft, X } from "lucide-react";
import { parseYoutubeVideoId, youtubeEmbedUrl } from "../../lib/youtube";
import { LessonFichamentoBlock } from "./LessonFichamentoBlock";

type CurriculumItemLite = {
  slug: string;
  id: string;
  title: string;
  type: "document" | "video" | "article";
  breadcrumb: string[];
  prev: string | null;
  next: string | null;
};

type LessonFichamentoModeProps = {
  courseSlug: string;
  item: CurriculumItemLite;
  displayTitle: string;
  videoSrc: string | null;
  pdfSrc: string | null;
  fichamentoJson?: string | null;
  fichamentoHtml?: string | null;
  onExitLessonView: () => void;
  onPrev?: () => void;
  onNext?: () => void;
};

export function LessonFichamentoMode({
  courseSlug,
  item,
  displayTitle,
  videoSrc,
  pdfSrc,
  fichamentoJson,
  fichamentoHtml,
  onExitLessonView,
  onPrev,
  onNext
}: LessonFichamentoModeProps) {
  const youtubeId = videoSrc ? parseYoutubeVideoId(videoSrc) : null;
  const hasMedia = Boolean(pdfSrc || (item.type === "video" && videoSrc));

  return (
    <article className="course-study-fichamento-mode panel">
      <header className="course-study-fichamento-mode__head">
        <div className="min-w-0 flex-1">
          <p className="course-text-subtle text-xs">{item.breadcrumb.join(" › ")}</p>
          <h2 className="mt-1 truncate text-lg font-bold text-[var(--course-fg)] sm:text-xl">{displayTitle}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-brand-primary">
            <LayoutPanelLeft className="h-4 w-4 shrink-0" aria-hidden />
            {COURSES_UI.study.fichamentoModeTitle}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {item.prev && onPrev ? (
            <button type="button" className="btn-secondary min-h-9 text-xs" onClick={onPrev}>
              <ChevronLeft className="mr-0.5 inline h-4 w-4" />
              {COURSES_UI.study.fichamentoModePrev}
            </button>
          ) : null}
          {item.next && onNext ? (
            <button type="button" className="btn-secondary min-h-9 text-xs" onClick={onNext}>
              {COURSES_UI.study.fichamentoModeNext}
              <ChevronRight className="ml-0.5 inline h-4 w-4" />
            </button>
          ) : null}
          <button type="button" className="btn-primary min-h-9 text-xs" onClick={onExitLessonView}>
            <X className="mr-1 inline h-4 w-4" />
            {COURSES_UI.study.fichamentoModeExit}
          </button>
        </div>
      </header>

      {!hasMedia ? (
        <p className="course-text-muted border-b border-[var(--app-border)] px-4 py-3 text-sm sm:px-6">
          {COURSES_UI.study.fichamentoModeNoMedia}
        </p>
      ) : null}

      <div
        className={`course-study-fichamento-mode__grid ${hasMedia ? "has-media" : "editor-only"}`}
      >
        {hasMedia ? (
          <div className="course-study-fichamento-mode__media">
            {pdfSrc ? (
              <object data={pdfSrc} type="application/pdf" className="course-study-fichamento-mode__pdf">
                <p className="course-text-muted p-4 text-sm">{COURSES_UI.study.pdfFallback}</p>
              </object>
            ) : null}
            {item.type === "video" ? (
              <>
                {youtubeId ? (
                  <div className="course-study-fichamento-mode__video-wrap">
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
                  <video
                    controls
                    playsInline
                    preload="metadata"
                    className="course-study-fichamento-mode__video-native"
                  >
                    <source src={videoSrc} type="video/mp4" />
                  </video>
                ) : null}
              </>
            ) : null}
          </div>
        ) : null}
        <div className="course-study-fichamento-mode__editor">
          <LessonFichamentoBlock
            courseSlug={courseSlug}
            lessonSlug={item.slug}
            lessonTitle={displayTitle}
            initialJson={fichamentoJson}
            initialHtml={fichamentoHtml}
            compact
            showExports
          />
        </div>
      </div>
    </article>
  );
}
