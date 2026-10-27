import { COURSES_UI } from "@ederson-agencia/shared";
import { useCallback, useEffect, useState } from "react";
import { apiDelete, apiGet, apiPatch, apiPost } from "../../api";

type AdminBook = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  author: string | null;
  summary: string | null;
  coverUrl: string | null;
  pdfUrl: string;
  pageCount: number | null;
  sortOrder: number;
  status: string;
};

const emptyForm = {
  slug: "",
  title: "",
  author: "",
  summary: "",
  pdfUrl: "",
  coverUrl: "",
  pageCount: "",
  status: "DRAFT" as "DRAFT" | "PUBLISHED"
};

export function AdminCourseLibraryPanel({ courseId }: { courseId: string }) {
  const [books, setBooks] = useState<AdminBook[]>([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await apiGet<{ books: AdminBook[] }>(`/admin/courses/${courseId}/library`);
    setBooks(res.books);
  }, [courseId]);

  useEffect(() => {
    void refresh().catch((err) => setError(err instanceof Error ? err.message : "Erro."));
  }, [refresh]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    const payload = {
      slug: form.slug.trim(),
      title: form.title.trim(),
      author: form.author.trim() || null,
      summary: form.summary.trim() || null,
      coverUrl: form.coverUrl.trim() || null,
      pdfUrl: form.pdfUrl.trim(),
      pageCount: form.pageCount ? Number(form.pageCount) : null,
      status: form.status
    };
    try {
      if (editId) {
        await apiPatch(`/admin/courses/${courseId}/library/${editId}`, payload);
        setMessage("Livro atualizado.");
      } else {
        await apiPost(`/admin/courses/${courseId}/library`, payload);
        setMessage("Livro adicionado.");
      }
      setForm({ ...emptyForm });
      setEditId(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar.");
    }
  }

  function startEdit(book: AdminBook) {
    setEditId(book.id);
    setForm({
      slug: book.slug,
      title: book.title,
      author: book.author ?? "",
      summary: book.summary ?? "",
      pdfUrl: book.pdfUrl,
      coverUrl: book.coverUrl ?? "",
      pageCount: book.pageCount ? String(book.pageCount) : "",
      status: book.status as "DRAFT" | "PUBLISHED"
    });
  }

  async function remove(bookId: string) {
    if (!confirm("Excluir este livro da biblioteca?")) return;
    await apiDelete(`/admin/courses/${courseId}/library/${bookId}`);
    await refresh();
  }

  return (
    <section className="panel mt-10 p-6">
      <h2 className="text-lg font-bold">{COURSES_UI.adminLibrary.heading}</h2>
      <p className="course-text-muted mt-1 text-sm">{COURSES_UI.adminLibrary.hint}</p>
      {message ? <p className="mt-3 text-sm text-green-300">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}

      <form className="mt-6 grid gap-3 md:grid-cols-2" onSubmit={submit}>
        <input
          className="input"
          placeholder={COURSES_UI.adminLibrary.slug}
          value={form.slug}
          disabled={Boolean(editId)}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          required
        />
        <input
          className="input"
          placeholder={COURSES_UI.adminLibrary.title}
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
        />
        <input
          className="input"
          placeholder={COURSES_UI.adminLibrary.author}
          value={form.author}
          onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
        />
        <input
          className="input md:col-span-2"
          placeholder={COURSES_UI.adminLibrary.pdfUrl}
          value={form.pdfUrl}
          onChange={(e) => setForm((f) => ({ ...f, pdfUrl: e.target.value }))}
          required
          type="url"
        />
        <textarea
          className="input md:col-span-2"
          rows={3}
          placeholder="Resumo"
          value={form.summary}
          onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
        />
        <select className="input" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "DRAFT" | "PUBLISHED" }))}>
          <option value="DRAFT">{COURSES_UI.adminLibrary.draft}</option>
          <option value="PUBLISHED">{COURSES_UI.adminLibrary.publish}</option>
        </select>
        <div className="flex flex-wrap gap-2 md:col-span-2">
          <button type="submit" className="btn-primary">
            {editId ? "Salvar livro" : COURSES_UI.adminLibrary.addBook}
          </button>
          {editId ? (
            <button type="button" className="btn-secondary" onClick={() => { setEditId(null); setForm({ ...emptyForm }); }}>
              Cancelar
            </button>
          ) : null}
        </div>
      </form>

      <ul className="mt-8 space-y-2">
        {books.map((book) => (
          <li key={book.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--app-border)] px-3 py-2">
            <div>
              <p className="font-medium">{book.title}</p>
              <p className="text-xs text-[var(--app-text-muted)]">
                {book.slug} · {book.status === "PUBLISHED" ? COURSES_UI.adminLibrary.publish : COURSES_UI.adminLibrary.draft}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn-secondary text-xs" onClick={() => startEdit(book)}>
                Editar
              </button>
              <button type="button" className="btn-secondary text-xs" onClick={() => void remove(book.id)}>
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
