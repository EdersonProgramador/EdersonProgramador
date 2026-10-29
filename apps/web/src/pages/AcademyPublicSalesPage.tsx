import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Shield } from "lucide-react";
import {
  ACADEMY_APP_BASE,
  ACADEMY_SALES,
  ACADEMY_STORE_BASE,
  loginPathForContext
} from "@ederson-agencia/shared";
import { apiGet, apiPost } from "../api";
import { BrandLogo } from "../components/brand/BrandLogo";
import { CourseCover } from "../components/courses/CourseCover";
import { ThemeToggle } from "../components/theme/ThemeToggle";
import "../styles/academy-sales.css";

type StoreCourse = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  priceCents: number;
  currency: string;
  coverUrl?: string | null;
  contentReady?: boolean;
};

const copy = ACADEMY_SALES;

export function AcademyPublicSalesPage() {
  const [courses, setCourses] = useState<StoreCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const data = await apiGet<{ courses: StoreCourse[] }>("/public/academy/catalog");
        setCourses(data.courses);
        if (data.courses[0]) setSelectedSlug(data.courses[0].slug);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível carregar os cursos.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selected = courses.find((c) => c.slug === selectedSlug) ?? null;

  async function onPurchase(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setFormError(null);
    setSuccess(null);
    setSubmitting(true);
    const fd = new FormData(event.currentTarget);
    try {
      const res = await apiPost<{ message: string; emailSent?: boolean }>("/public/academy/purchase", {
        courseSlug: selected.slug,
        name: fd.get("name"),
        email: fd.get("email"),
        phone: fd.get("phone") || undefined,
        paymentMethod: fd.get("paymentMethod"),
        acceptTerms: true
      });
      setSuccess(res.message);
      event.currentTarget.reset();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Não foi possível concluir a compra.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="academy-sales min-h-screen bg-black text-white">
      <header className="academy-sales__nav sticky top-0 z-50 border-b border-white/10 bg-black/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to={ACADEMY_STORE_BASE} className="shrink-0">
            <BrandLogo size="sm" />
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Seções">
            {copy.nav.map((item) => (
              <a key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-sm text-white/75 hover:text-white">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            <Link to={loginPathForContext("academy")} className="btn-secondary hidden text-sm sm:inline-flex">
              {copy.courses.loginCta}
            </Link>
          </div>
        </div>
      </header>

      <section className="academy-sales__hero relative overflow-hidden px-4 pb-16 pt-12 sm:pt-16">
        <div className="mesh-hero pointer-events-none absolute inset-0 opacity-80" aria-hidden />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-sky-400">{copy.brand}</p>
          <h1 className="mt-4 text-balance text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            {copy.hero.headline}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            {copy.hero.subheadline}
          </p>
          <a href="#cursos" className="btn-primary mt-8 inline-flex min-h-11 items-center px-6">
            Ver cursos e preços
          </a>
        </div>
      </section>

      <section id="caminho" className="scroll-mt-24 border-t border-white/10 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold sm:text-3xl">{copy.path.title}</h2>
          <p className="mt-3 max-w-2xl text-white/65">{copy.path.subtitle}</p>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {copy.path.steps.map((step, i) => (
              <li key={step.title} className="academy-sales__step panel border-white/10 bg-white/[0.03] p-5">
                <span className="font-mono text-sm text-brand-primary">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="cursos" className="scroll-mt-24 border-t border-white/10 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold sm:text-3xl">{copy.courses.title}</h2>
          <p className="mt-3 max-w-2xl text-white/65">{copy.courses.subtitle}</p>

          {loading ? <p className="mt-8 text-white/50">{copy.courses.submitting}</p> : null}
          {error ? <p className="mt-8 text-red-300">{error}</p> : null}

          {!loading && !error && courses.length === 0 ? (
            <p className="mt-8 text-white/55">{copy.courses.empty}</p>
          ) : null}

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <ul className="grid gap-5 sm:grid-cols-2">
              {courses.map((course) => (
                <li key={course.id}>
                  <button
                    type="button"
                    className={`academy-sales__course w-full text-left ${selectedSlug === course.slug ? "is-selected" : ""}`}
                    onClick={() => setSelectedSlug(course.slug)}
                  >
                    <CourseCover title={course.title} coverUrl={course.coverUrl} className="course-cover--card" />
                    <div className="p-4">
                      <h3 className="font-semibold">{course.title}</h3>
                      {course.summary ? <p className="mt-2 line-clamp-3 text-sm text-white/60">{course.summary}</p> : null}
                      <p className="mt-3 text-lg font-medium text-sky-300">
                        {(course.priceCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>

            <div className="panel sticky top-24 h-fit border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-lg font-semibold">{copy.courses.formTitle}</h3>
              {selected ? (
                <p className="mt-2 text-sm text-white/60">
                  {copy.courses.selectLabel}: <strong className="text-white">{selected.title}</strong>
                </p>
              ) : null}

              {success ? (
                <p className="mt-4 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-100">
                  <strong>{copy.courses.successTitle}</strong>
                  <br />
                  {success}
                </p>
              ) : null}

              <form className="mt-5 space-y-4" onSubmit={(e) => void onPurchase(e)}>
                <input className="input w-full" name="name" placeholder={copy.courses.name} required disabled={!selected || submitting} />
                <input
                  className="input w-full"
                  type="email"
                  name="email"
                  placeholder={copy.courses.email}
                  required
                  autoComplete="email"
                  disabled={!selected || submitting}
                />
                <input className="input w-full" name="phone" placeholder={copy.courses.phone} disabled={!selected || submitting} />
                <fieldset className="space-y-2" disabled={!selected || submitting}>
                  <legend className="text-sm text-white/70">{copy.courses.payment}</legend>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input type="radio" name="paymentMethod" value="PIX" defaultChecked required />
                    {copy.courses.pix}
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input type="radio" name="paymentMethod" value="CARD" required />
                    {copy.courses.card}
                  </label>
                </fieldset>
                <label className="flex items-start gap-2 text-xs text-white/65">
                  <input type="checkbox" name="acceptTerms" className="mt-0.5" required disabled={!selected || submitting} />
                  {copy.courses.terms}
                </label>
                {formError ? <p className="text-sm text-red-300">{formError}</p> : null}
                <button type="submit" className="btn-primary w-full" disabled={!selected || submitting}>
                  {submitting ? copy.courses.submitting : copy.courses.submit}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section id="bonus" className="scroll-mt-24 border-t border-white/10 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold">{copy.bonus.title}</h2>
          <p className="mt-3 max-w-2xl text-white/65">{copy.bonus.subtitle}</p>
          <ul className="mt-8 grid gap-5 md:grid-cols-3">
            {copy.bonus.items.map((item) => (
              <li key={item.title} className="panel border-white/10 bg-white/[0.03] p-5">
                <Check className="h-5 w-5 text-brand-primary" aria-hidden />
                <h3 className="mt-3 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="garantia" className="scroll-mt-24 border-t border-white/10 px-4 py-16 pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <Shield className="mx-auto h-10 w-10 text-brand-primary" aria-hidden />
          <h2 className="mt-4 text-2xl font-bold">{copy.guarantee.title}</h2>
          <p className="mt-2 text-white/65">{copy.guarantee.subtitle}</p>
          <p className="mt-6 text-left text-sm leading-relaxed text-white/70 sm:text-center">{copy.guarantee.body}</p>
          <p className="mt-4 text-sm text-white/50">
            Suporte:{" "}
            <a href={`mailto:${copy.guarantee.supportEmail}`} className="text-brand-primary hover:underline">
              {copy.guarantee.supportEmail}
            </a>
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-8 text-center text-sm text-white/45">
        <Link to={loginPathForContext("academy")} className="text-brand-primary hover:underline">
          {copy.footer.portal}
        </Link>
        <span className="mx-2">·</span>
        <Link to="/" className="hover:text-white/70">
          {copy.footer.agency}
        </Link>
        <span className="mx-2">·</span>
        <Link to={ACADEMY_APP_BASE} className="hover:text-white/70">
          Área interna (alunos)
        </Link>
      </footer>
    </div>
  );
}
