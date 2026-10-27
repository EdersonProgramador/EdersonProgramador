import { COURSES_UI } from "@ederson-agencia/shared";
import { BookOpen, ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { apiAssetUrl, apiGet } from "../../api";
import { PdfReader } from "./PdfReader";
import "../../styles/course-library.css";

export type LibraryBook = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  author: string | null;
  summary: string | null;
  coverUrl: string | null;
  pageCount: number | null;
  lastPage?: number;
  pdfStreamPath?: string;
};

type CourseLibraryViewProps = {
  courseSlug: string;
  bookSlug?: string;
  onOpenBook: (slug: string) => void;
  onBackToCourse: () => void;
  onBackToLibrary: () => void;
};

export function CourseLibraryView({
  courseSlug,
  bookSlug,
  onOpenBook,
  onBackToCourse,
  onBackToLibrary
}: CourseLibraryViewProps) {
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [bookDetail, setBookDetail] = useState<LibraryBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    void apiGet<{ books: LibraryBook[] }>(`/courses/${courseSlug}/library`)
      .then((res) => setBooks(res.books))
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar biblioteca."))
      .finally(() => setLoading(false));
  }, [courseSlug]);

  useEffect(() => {
    if (!bookSlug) {
      setBookDetail(null);
      return;
    }
    void apiGet<{ book: LibraryBook }>(`/courses/${courseSlug}/library/${bookSlug}`)
      .then((res) => setBookDetail(res.book))
      .catch((err) => setError(err instanceof Error ? err.message : "Livro não encontrado."));
  }, [courseSlug, bookSlug]);

  if (bookSlug && bookDetail) {
    const pdfUrl = apiAssetUrl(bookDetail.pdfStreamPath ?? `/courses/${courseSlug}/library/${bookSlug}/pdf`);
    return (
      <div className="course-library">
        <button type="button" className="btn-secondary mb-4 inline-flex items-center gap-2 text-sm" onClick={onBackToLibrary}>
          <ChevronLeft className="h-4 w-4" />
          {COURSES_UI.study.libraryBack}
        </button>
        <PdfReader
          courseSlug={courseSlug}
          bookSlug={bookSlug}
          fileUrl={pdfUrl}
          initialPage={bookDetail.lastPage ?? 1}
          title={bookDetail.title}
        />
      </div>
    );
  }

  return (
    <div className="course-library">
      <button type="button" className="btn-secondary mb-4 inline-flex items-center gap-2 text-sm" onClick={onBackToCourse}>
        <ChevronLeft className="h-4 w-4" />
        {COURSES_UI.study.libraryBackCourse}
      </button>
      <header className="course-library__head">
        <h2 className="text-xl font-bold text-[var(--course-fg)]">{COURSES_UI.study.libraryTitle}</h2>
        <p className="course-text-subtle mt-1 text-sm">{COURSES_UI.study.librarySubtitle}</p>
      </header>

      {loading ? <p className="course-text-muted mt-6 text-sm">{COURSES_UI.catalog.loading}</p> : null}
      {error ? <p className="mt-6 text-sm text-red-300">{error}</p> : null}
      {!loading && !error && books.length === 0 ? (
        <p className="course-text-muted mt-6 text-sm">{COURSES_UI.study.libraryEmpty}</p>
      ) : null}

      <ul className="course-library__grid">
        {books.map((book) => (
          <li key={book.id}>
            <button type="button" className="course-library__card" onClick={() => onOpenBook(book.slug)}>
              <span className="course-library__cover" aria-hidden>
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <BookOpen className="h-8 w-8 text-brand-primary" strokeWidth={1.5} />
                )}
              </span>
              <span className="course-library__card-body">
                <span className="course-library__card-title line-clamp-2">{book.title}</span>
                {book.author ? (
                  <span className="course-library__card-meta">
                    {COURSES_UI.study.libraryAuthor}: {book.author}
                  </span>
                ) : null}
                {book.summary ? <span className="course-library__card-summary line-clamp-2">{book.summary}</span> : null}
                <span className="course-library__card-cta">
                  {book.lastPage && book.lastPage > 1 ? COURSES_UI.study.libraryContinue : COURSES_UI.study.libraryStart}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
