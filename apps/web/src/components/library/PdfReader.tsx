import { COURSES_UI } from "@ederson-agencia/shared";
import { ChevronLeft, ChevronRight, ListTree, Maximize2, Minimize2, Minus, Plus, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type WheelEvent as ReactWheelEvent
} from "react";
import { Document, Page, pdfjs } from "react-pdf";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { activePdfTocKey, buildPdfToc, type PdfTocItem } from "./pdf-outline";
import { clampZoom, stepZoom, ZOOM_DEFAULT, ZOOM_MAX, ZOOM_MIN } from "./pdf-reader-zoom";
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

type ReaderTheme = "light" | "sepia" | "dark";

const THEME_STORAGE_KEY = (bookSlug: string) => `ea_reader_theme_${bookSlug}`;
const THEME_PICKED_KEY = (bookSlug: string) => `ea_reader_theme_picked_${bookSlug}`;
const ZOOM_STORAGE_KEY = (bookSlug: string) => `ea_reader_zoom_${bookSlug}`;

function loadZoomPercent(bookSlug: string): number {
  try {
    const raw = localStorage.getItem(ZOOM_STORAGE_KEY(bookSlug));
    if (raw) {
      const n = Number.parseInt(raw, 10);
      if (Number.isFinite(n)) return clampZoom(n);
    }
  } catch {
    /* ignore */
  }
  return ZOOM_DEFAULT;
}

function authHeaders() {
  const token = localStorage.getItem("ea_token");
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

function appThemeHint(): ReaderTheme {
  if (typeof document === "undefined") return "sepia";
  return document.documentElement.getAttribute("data-theme") === "day" ? "sepia" : "dark";
}

function userPickedTheme(bookSlug: string) {
  try {
    return localStorage.getItem(THEME_PICKED_KEY(bookSlug)) === "1";
  } catch {
    return false;
  }
}

function loadTheme(bookSlug: string): ReaderTheme {
  try {
    if (userPickedTheme(bookSlug)) {
      const v = localStorage.getItem(THEME_STORAGE_KEY(bookSlug));
      if (v === "light" || v === "sepia" || v === "dark") return v;
    }
  } catch {
    /* ignore */
  }
  return appThemeHint();
}

function persistThemeChoice(bookSlug: string, value: ReaderTheme) {
  try {
    localStorage.setItem(THEME_PICKED_KEY(bookSlug), "1");
    localStorage.setItem(THEME_STORAGE_KEY(bookSlug), value);
  } catch {
    /* ignore */
  }
}

export function PdfReader({ courseSlug, bookSlug, fileUrl, initialPage = 1, title }: PdfReaderProps) {
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [pageInput, setPageInput] = useState(String(initialPage));
  const [zoomPercent, setZoomPercent] = useState(() => loadZoomPercent(bookSlug));
  const [fitWidth, setFitWidth] = useState(true);
  const [containerWidth, setContainerWidth] = useState(720);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [theme, setTheme] = useState<ReaderTheme>(() => loadTheme(bookSlug));
  const [focusMode, setFocusMode] = useState(false);
  const [tocItems, setTocItems] = useState<PdfTocItem[]>([]);
  const [tocOpen, setTocOpen] = useState(false);
  const [tocLoading, setTocLoading] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const tocListRef = useRef<HTMLUListElement>(null);
  const saveTimer = useRef<number | null>(null);
  const showTocUi = tocLoading || tocItems.length > 0;
  const activeTocKey = useMemo(() => activePdfTocKey(tocItems, page), [tocItems, page]);

  useEffect(() => {
    setPage(initialPage);
    setPageInput(String(initialPage));
  }, [initialPage, bookSlug]);

  useEffect(() => {
    setTheme(loadTheme(bookSlug));
    setZoomPercent(loadZoomPercent(bookSlug));
  }, [bookSlug]);

  useEffect(() => {
    try {
      localStorage.setItem(ZOOM_STORAGE_KEY(bookSlug), String(zoomPercent));
    } catch {
      /* ignore */
    }
  }, [bookSlug, zoomPercent]);

  useEffect(() => {
    const prevBodyBg = document.body.style.background;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlBg = document.documentElement.style.background;

    if (fullscreen && shellRef.current) {
      const surface = getComputedStyle(shellRef.current).getPropertyValue("--reader-bg").trim();
      if (surface) {
        document.body.style.background = surface;
        document.documentElement.style.background = surface;
      }
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.background = prevBodyBg;
      document.documentElement.style.background = prevHtmlBg;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [fullscreen, theme]);

  useEffect(() => {
    const root = document.documentElement;
    const syncWithAppTheme = () => {
      if (userPickedTheme(bookSlug)) return;
      setTheme(appThemeHint());
    };
    syncWithAppTheme();
    const observer = new MutationObserver(syncWithAppTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, [bookSlug]);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPdfBlobUrl(null);
    setNumPages(0);
    setTocItems([]);
    setTocOpen(false);
    setTocLoading(false);

    void (async () => {
      try {
        const isLocalPublicPdf =
          fileUrl.startsWith("/course-materials/") || fileUrl.startsWith("/course-covers/");
        const headers = isLocalPublicPdf ? undefined : authHeaders();
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
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setContainerWidth(Math.floor(Math.max(160, w - 32)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const nudgeZoom = useCallback((direction: -1 | 1, fine = false) => {
    setZoomPercent((z) => stepZoom(z, direction, fine));
  }, []);

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
    setPageInput(String(page));
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [page, persistPage]);

  const go = useCallback(
    (delta: number) => {
      setPage((p) => {
        const next = Math.min(numPages || p, Math.max(1, p + delta));
        return next;
      });
    },
    [numPages]
  );

  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;
      if ((e.ctrlKey || e.metaKey) && (e.key === "=" || e.key === "+" || e.key === "-")) {
        e.preventDefault();
        nudgeZoom(e.key === "-" ? -1 : 1, e.shiftKey);
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        go(1);
      } else if (e.key === "Escape") {
        if (tocOpen) {
          e.preventDefault();
          setTocOpen(false);
        } else if (fullscreen) {
          setFullscreen(false);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, fullscreen, tocOpen, nudgeZoom]);

  useEffect(() => {
    if (!tocOpen || !activeTocKey || !tocListRef.current) return;
    const el = tocListRef.current.querySelector<HTMLElement>(`[data-toc-key="${activeTocKey}"]`);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeTocKey, tocOpen, page]);

  function jumpToTocPage(targetPage: number | null) {
    if (targetPage === null || targetPage < 1) return;
    setPage(Math.min(numPages || targetPage, Math.max(1, targetPage)));
    if (window.matchMedia("(max-width: 768px)").matches) setTocOpen(false);
  }

  async function loadPdfOutline(pdf: PDFDocumentProxy) {
    setTocLoading(true);
    try {
      const items = await buildPdfToc(pdf);
      setTocItems(items);
    } catch {
      setTocItems([]);
    } finally {
      setTocLoading(false);
    }
  }

  function commitPageInput() {
    const n = Number.parseInt(pageInput, 10);
    if (!Number.isFinite(n) || n < 1) {
      setPageInput(String(page));
      return;
    }
    setPage(Math.min(numPages || n, Math.max(1, n)));
  }

  function onViewportKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" && e.target === e.currentTarget) go(1);
  }

  function onViewportWheel(e: ReactWheelEvent<HTMLDivElement>) {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    nudgeZoom(e.deltaY < 0 ? 1 : -1, e.shiftKey);
  }

  const progressPct = numPages > 0 ? (page / numPages) * 100 : 0;
  const zoomFactor = zoomPercent / 100;
  const pageWidth = fitWidth ? Math.floor(containerWidth * zoomFactor) : undefined;
  const pageScale = fitWidth ? undefined : zoomFactor;
  const atMinZoom = zoomPercent <= ZOOM_MIN;
  const atMaxZoom = zoomPercent >= ZOOM_MAX;

  return (
    <div
      className={`course-library-reader is-theme-${theme} ${fullscreen ? "is-fullscreen" : ""} ${focusMode ? "is-focus" : ""} ${tocOpen ? "is-toc-open" : ""}`}
      ref={shellRef}
    >
      <div className="course-library-reader__progress-track" aria-hidden>
        <div className="course-library-reader__progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      <div className={`course-library-reader__chrome ${focusMode ? "is-hidden" : ""}`}>
        <div className="course-library-reader__toolbar">
          <div className="course-library-reader__toolbar-start">
            {showTocUi ? (
              <button
                type="button"
                className={`course-library-reader__btn course-library-reader__btn--toc ${tocOpen ? "is-active" : ""}`}
                aria-label={tocOpen ? COURSES_UI.study.libraryTocClose : COURSES_UI.study.libraryTocOpen}
                aria-expanded={tocOpen}
                onClick={() => setTocOpen((o) => !o)}
              >
                <ListTree className="h-4 w-4" />
                <span className="sr-only">{COURSES_UI.study.libraryToc}</span>
              </button>
            ) : null}
            <div className="course-library-reader__toolbar-meta">
              <p className="course-library-reader__title line-clamp-1">{title}</p>
              {numPages > 0 ? (
                <span className="course-library-reader__progress-label">
                  {COURSES_UI.study.libraryProgress(page, numPages)}
                </span>
              ) : null}
            </div>
          </div>
          <div className="course-library-reader__tools">
            <div className="course-library-reader__themes" role="group" aria-label="Tema de leitura">
              {(
                [
                  ["light", COURSES_UI.study.libraryThemeLight],
                  ["sepia", COURSES_UI.study.libraryThemeSepia],
                  ["dark", COURSES_UI.study.libraryThemeDark]
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={`course-library-reader__theme-btn course-library-reader__theme-btn--${id} ${theme === id ? "is-active" : ""}`}
                  aria-pressed={theme === id}
                  onClick={() => {
                    persistThemeChoice(bookSlug, id);
                    setTheme(id);
                  }}
                >
                  <span className="course-library-reader__theme-swatch" aria-hidden />
                  {label}
                </button>
              ))}
            </div>
            <span className="course-library-reader__sep" />
            <button
              type="button"
              className="course-library-reader__btn"
              aria-label={COURSES_UI.study.libraryPrev}
              onClick={() => go(-1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <label className="course-library-reader__page-jump">
              <span className="sr-only">{COURSES_UI.study.libraryGoToPage}</span>
              <input
                type="number"
                min={1}
                max={numPages || undefined}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onBlur={commitPageInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitPageInput();
                  }
                }}
                className="course-library-reader__page-input"
              />
              <span className="course-library-reader__page-of">/ {numPages || "—"}</span>
            </label>
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
            <div className="course-library-reader__zoom" role="group" aria-label={COURSES_UI.study.libraryZoomSlider}>
              <button
                type="button"
                className="course-library-reader__btn"
                aria-label={COURSES_UI.study.libraryZoomOut}
                disabled={atMinZoom}
                onClick={(e) => nudgeZoom(-1, e.shiftKey)}
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="range"
                className="course-library-reader__zoom-range"
                min={ZOOM_MIN}
                max={ZOOM_MAX}
                step={5}
                value={zoomPercent}
                aria-label={COURSES_UI.study.libraryZoomSlider}
                onChange={(e) => setZoomPercent(clampZoom(Number(e.target.value)))}
              />
              <button
                type="button"
                className="course-library-reader__zoom-value"
                title={COURSES_UI.study.libraryZoomReset}
                onClick={() => setZoomPercent(ZOOM_DEFAULT)}
              >
                {COURSES_UI.study.libraryZoomLevel(zoomPercent)}
              </button>
              <button
                type="button"
                className="course-library-reader__btn"
                aria-label={COURSES_UI.study.libraryZoomIn}
                disabled={atMaxZoom}
                onClick={(e) => nudgeZoom(1, e.shiftKey)}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              className={`course-library-reader__btn ${fitWidth ? "is-active" : ""}`}
              onClick={() => {
                setFitWidth(true);
                setZoomPercent(ZOOM_DEFAULT);
              }}
            >
              {COURSES_UI.study.libraryFitWidth}
            </button>
            <button
              type="button"
              className={`course-library-reader__btn ${focusMode ? "is-active" : ""}`}
              onClick={() => setFocusMode((f) => !f)}
              title={focusMode ? COURSES_UI.study.libraryShowToolbar : COURSES_UI.study.libraryFocusMode}
            >
              {focusMode ? COURSES_UI.study.libraryShowToolbar : COURSES_UI.study.libraryFocusMode}
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
      </div>

      <div className="course-library-reader__main">
        {tocOpen ? (
          <>
            <button
              type="button"
              className="course-library-reader__toc-backdrop"
              aria-label={COURSES_UI.study.libraryTocClose}
              onClick={() => setTocOpen(false)}
            />
            <nav className="course-library-reader__toc" aria-label={COURSES_UI.study.libraryToc}>
              <div className="course-library-reader__toc-head">
                <span>{COURSES_UI.study.libraryToc}</span>
                <button
                  type="button"
                  className="course-library-reader__btn"
                  aria-label={COURSES_UI.study.libraryTocClose}
                  onClick={() => setTocOpen(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {tocLoading ? (
                <p className="course-library-reader__toc-empty">{COURSES_UI.study.libraryTocLoading}</p>
              ) : tocItems.length === 0 ? (
                <p className="course-library-reader__toc-empty">{COURSES_UI.study.libraryTocEmpty}</p>
              ) : (
                <ul className="course-library-reader__toc-list" ref={tocListRef}>
                  {tocItems.map((item) => (
                    <li key={item.key} className="course-library-reader__toc-item">
                      <button
                        type="button"
                        data-toc-key={item.key}
                        className={`course-library-reader__toc-link ${activeTocKey === item.key ? "is-active" : ""}`}
                        style={{ paddingLeft: `calc(0.5rem + ${item.depth} * 0.65rem)` }}
                        disabled={item.page === null}
                        onClick={() => jumpToTocPage(item.page)}
                      >
                        <span className="course-library-reader__toc-title">{item.title}</span>
                        {item.page !== null ? (
                          <span className="course-library-reader__toc-page">{item.page}</span>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </nav>
          </>
        ) : null}

        <div
          className="course-library-reader__viewport"
          ref={viewportRef}
          tabIndex={0}
          role="document"
          aria-label={`${title}, ${COURSES_UI.study.libraryPage(page, numPages || page)}`}
          onKeyDown={onViewportKeyDown}
          onWheel={onViewportWheel}
        >
        {focusMode ? (
          <button
            type="button"
            className="course-library-reader__focus-toggle"
            onClick={() => setFocusMode(false)}
          >
            {COURSES_UI.study.libraryShowToolbar}
          </button>
        ) : null}
        {loading ? <p className="course-library-reader__status">{COURSES_UI.study.libraryLoading}</p> : null}
        {error ? <p className="course-library-reader__status course-library-reader__status--error">{error}</p> : null}
        {pdfBlobUrl ? (
          <>
            <button
              type="button"
              className="course-library-reader__nav-zone course-library-reader__nav-zone--prev"
              aria-label={COURSES_UI.study.libraryPrev}
              onClick={() => go(-1)}
              disabled={page <= 1}
            />
            <button
              type="button"
              className="course-library-reader__nav-zone course-library-reader__nav-zone--next"
              aria-label={COURSES_UI.study.libraryNext}
              onClick={() => go(1)}
              disabled={numPages > 0 && page >= numPages}
            />
            <Document
              file={pdfBlobUrl}
              loading=""
              onLoadSuccess={(pdf) => {
                setNumPages(pdf.numPages);
                setLoading(false);
                setPage((p) => Math.min(Math.max(1, p), pdf.numPages));
                void loadPdfOutline(pdf);
              }}
              onLoadError={() => {
                setLoading(false);
                setError(COURSES_UI.study.libraryLoadError);
              }}
            >
              <Page
                pageNumber={page}
                width={pageWidth}
                scale={pageScale}
                renderAnnotationLayer
                renderTextLayer
                className="course-library-reader__page"
                loading={
                  <div className="course-library-reader__page-skeleton" aria-hidden />
                }
              />
            </Document>
          </>
        ) : null}
        </div>
      </div>

      {!focusMode && numPages > 0 ? (
        <footer className="course-library-reader__footer">
          <span>{COURSES_UI.study.libraryPage(page, numPages)}</span>
          <span className="course-library-reader__footer-hint">← → ou Espaço para virar página</span>
        </footer>
      ) : null}
    </div>
  );
}
