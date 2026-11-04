import { FormEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiPost } from "../api";
import { apiGet } from "../api";

type LaunchPublicPayload = {
  slug: string;
  title: string;
  heroHtml: string;
  captureHtml: string;
};

export function LaunchPublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<LaunchPublicPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!slug) return;
    void apiGet<LaunchPublicPayload>(`/public/launch/${encodeURIComponent(slug)}`)
      .then(setData)
      .catch(() => setError("Página não encontrada ou não publicada."));
  }, [slug]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!slug) return;
    const form = new FormData(e.currentTarget);
    setSubmitting(true);
    setError(null);
    try {
      await apiPost(`/public/launch/${encodeURIComponent(slug)}/capture`, {
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        phone: String(form.get("phone") ?? "") || undefined
      });
      setDone(true);
    } catch {
      setError("Não foi possível registrar a inscrição. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (error && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 text-center text-slate-200">
        <p>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-slate-400">
        Carregando…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      <style>{`
        .launch-hero { max-width: 40rem; margin: 0 auto; padding: 3rem 1.25rem; text-align: center; }
        .launch-hero .eyebrow { text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.75rem; opacity: 0.85; }
        .launch-hero h1 { font-size: clamp(1.75rem, 4vw, 2.5rem); line-height: 1.15; margin: 0.75rem 0; }
        .launch-hero .lead { opacity: 0.9; font-size: 1.05rem; }
        .launch-hero .cta { display: inline-block; margin-top: 1.5rem; padding: 0.85rem 1.5rem; background: #38bdf8; color: #0f172a; font-weight: 700; text-decoration: none; border-radius: 0.5rem; }
        .launch-capture { max-width: 28rem; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
        .capture-copy h2 { font-size: 1.25rem; }
        .launch-form { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem; }
        .launch-form input { padding: 0.65rem 0.75rem; border-radius: 0.375rem; border: 1px solid #334155; background: #1e293b; color: #f8fafc; }
        .launch-form button { padding: 0.75rem; border: 0; border-radius: 0.375rem; background: #38bdf8; font-weight: 700; cursor: pointer; color: #0f172a; }
      `}</style>

      <div dangerouslySetInnerHTML={{ __html: data.heroHtml }} />

      <section className="launch-capture">
        <div dangerouslySetInnerHTML={{ __html: data.captureHtml }} />
        {done ? (
          <p className="mt-4 rounded-lg bg-emerald-900/40 p-4 text-center text-sm text-emerald-100">
            Inscrição confirmada. Verifique seu e-mail.
          </p>
        ) : (
          <form className="launch-form" onSubmit={(e) => void onSubmit(e)}>
            <input name="name" required placeholder="Seu nome" autoComplete="name" />
            <input name="email" type="email" required placeholder="E-mail" autoComplete="email" />
            <input name="phone" placeholder="WhatsApp (opcional)" autoComplete="tel" />
            <button type="submit" disabled={submitting}>
              {submitting ? "Enviando…" : "Confirmar inscrição"}
            </button>
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
          </form>
        )}
      </section>
    </div>
  );
}
