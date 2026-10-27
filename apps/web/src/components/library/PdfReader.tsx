import { COURSES_UI } from "@ederson-agencia/shared";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Minus, Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { apiPut } from "../../api";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "../../styles/course-library.css";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

type PdfReaderProps = {
  courseSlug: string;
  bookSlug: string;
  fileUrl: string;
  initialPage?: number;
  title: string;
};

function authHeaders() {
  const token = localStorage.getItem("ea_token");
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export function PdfReader({ courseSlug, bookSlug, fileUrl, initialPage = 1, title }: PdfReaderProps) {
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [scale, setScale] = useState(1.05);
  const [fitWidth, setFitWidth] = useState(true);
  const [containerWidth, setContainerWidth] = useState(720);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    setPage(initialPage);
  }, [initialPage, bookSlug]);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPdfBlobUrl(null);
    setNumPages(0);

    void (async () => {
      try {
        const headers = authHeaders();
        const res = await fetch(fileUrl, headers ? { headers } : undefined);
        if (!res.ok) throw new Error("fetch failed");
        const blob = await res.blob();
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPdfBlobUrl(objectUrl);
      } catch {
        if (!cancelled) {
          setLoading(false);
          setError(COURSES_UI.study.libraryLoadError);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileUrl]);

  useEffect(() => {
    const el = shellRef.current;
    if (!el || !fitWidth) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setContainerWidth(Math.floor(w - 24));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fitWidth]);

  const persistPage = useCallback(
    (p: number) => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => {
        void apiPut(`/courses/${courseSlug}/library/${bookSlug}/progress`, { lastPage: p }).catch(() => {});
      }, 600);
    },
    [courseSlug, bookSlug]
  );

  useEffect(() => {
    if (page >= 1) persistPage(page);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [page, persistPage]);

  function go(delta: number) {
    setPage((p) => Math.min(numPages || p, Math.max(1, p + delta)));
  }

  return (
    <div className={`course-library-reader ${fullscreen ? "is-fullscreen" : ""}`} ref={shellRef}>
      <div className="course-library-reader__toolbar">
        <p className="course-library-reader__title line-clamp-1">{title}</p>
        <div className="course-library-reader__tools">
          <button type="button" className="course-library-reader__btn" aria-label={COURSES_UI.study.libraryPrev} onClick={() => go(-1)} disabled={page <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="course-library-reader__page-label">
            {numPages ? COURSES_UI.study.libraryPage(page, numPages) : "—"}
          </span>
          <button
            type="button"
            className="course-library-reader__btn"
            aria-label={COURSES_UI.study.libraryNext}
            onClick={() => go(1)}
            disabled={numPages > 0 && page >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="course-library-reader__sep" />
          <button type="button" className="course-library-reader__btn" aria-label={COURSES_UI.study.libraryZoomOut} onClick={() => { setFitWidth(false); setScale((s) => Math.max(0.6, s - 0.1)); }}>
            <Minus className="h-4 w-4" />
          </button>
          <button type="button" className="course-library-reader__btn" aria-label={COURSES_UI.study.libraryZoomIn} onClick={() => { setFitWidth(false); setScale((s) => Math.min(2.2, s + 0.1)); }}>
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={`course-library-reader__btn ${fitWidth ? "is-active" : ""}`}
            onClick={() => setFitWidth(true)}
          >
            {COURSES_UI.study.libraryFitWidth}
          </button>
          <button
            type="button"
            className="course-library-reader__btn"
            aria-label={fullscreen ? "Sair da tela cheia" : "Tela cheia"}
            onClick={() => setFullscreen((f) => !f)}
          >
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="course-library-reader__viewport">
        {loading ? <p className="course-text-muted text-sm">{COURSES_UI.study.libraryLoading}</p> : null}
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        {pdfBlobUrl ? (
          <Document
            file={pdfBlobUrl}
            loading=""
            onLoadSuccess={({ numPages: n }) => {
              setNumPages(n);
              setLoading(false);
              setPage((p) => Math.min(Math.max(1, p), n));
            }}
            onLoadError={() => {
              setLoading(false);
              setError(COURSES_UI.study.libraryLoadError);
            }}
          >
            <Page
              pageNumber={page}
              width={fitWidth ? containerWidth : undefined}
              scale={fitWidth ? undefined : scale}
              renderAnnotationLayer
              renderTextLayer
              className="course-library-reader__page"
            />
          </Document>
        ) : null}
      </div>
    </div>
  );
}
