import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Shield } from "lucide-react";
import {
  ACADEMY_APP_BASE,
  ACADEMY_CART,
  ACADEMY_SALES,
  ACADEMY_STORE_BASE,
  ACADEMY_STORE_PATHS,
  academyCourseCheckoutPath
} from "@ederson-agencia/shared";
import { ApiError, apiGet, apiPost } from "../api";
import {
  AcademyStoreCourseCard,
  AcademyStoreCourseCardSkeleton,
  type AcademyStoreCourseCardData
} from "../components/academy/AcademyStoreCourseCard";
import { AcademyStoreShell } from "../components/academy/AcademyStoreShell";
import { CourseCover } from "../components/courses/CourseCover";
import { useAcademyCartStore } from "../stores/academyCartStore";
import "../styles/course-study.css";
import "../styles/academy-sales.css";

type StoreCourse = AcademyStoreCourseCardData;

const copy = ACADEMY_SALES;

export function AcademyPublicSalesPage() {
  const [courses, setCourses] = useState<StoreCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState<string | null>(null);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [leadCourseSlug, setLeadCourseSlug] = useState("");
  const addItem = useAcademyCartStore((s) => s.addItem);
  const hasSlug = useAcademyCartStore((s) => s.hasSlug);

  useEffect(() => {
    void (async () => {
      try {
        const data = await apiGet<{ courses: StoreCourse[] }>("/public/academy/catalog");
        setCourses(data.courses);
        if (data.courses[0]) setSelectedSlug(data.courses[0].slug);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Não foi possível carregar os cursos.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (selectedSlug) setLeadCourseSlug(selectedSlug);
  }, [selectedSlug]);

  const selected = courses.find((c) => c.slug === selectedSlug) ?? null;

  async function onLeadSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLeadError(null);
    setLeadSuccess(null);
    setLeadSubmitting(true);
    const fd = new FormData(event.currentTarget);
    const courseSlugFromForm = String(fd.get("courseSlug") || "").trim();
    try {
      const res = await apiPost<{ message: string }>("/public/academy/lead", {
        name: fd.get("name"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        acceptMarketing: true,
        courseSlug: courseSlugFromForm || undefined
      });
      setLeadSuccess(res.message);
      event.currentTarget.reset();
      if (selectedSlug) setLeadCourseSlug(selectedSlug);
    } catch (err) {
      setLeadError(err instanceof Error ? err.message : "Não foi possível enviar. Tente novamente.");
    } finally {
      setLeadSubmitting(false);
    }
  }

  const sectionNav = (
    <nav className="flex items-center gap-1" aria-label="Seções">
      {copy.nav.map((item) => (
        <a key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-sm text-white/75 hover:text-white">
          {item.label}
        </a>
      ))}
    </nav>
  );

  return (
    <AcademyStoreShell nav={sectionNav}>
      <section className="academy-sales__hero relative overflow-hidden px-4 pb-16 pt-12 sm:pt-16">
        <div className="mesh-hero pointer-events-none absolute inset-0 opacity-80" aria-hidden />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="academy-sales__eyebrow text-xs uppercase tracking-[0.2em]">{copy.brand}</p>
          <h1 className="academy-sales__hero-title mt-4 text-balance text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            {copy.hero.headline}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            {copy.hero.subheadline}
          </p>
          <p className="academy-sales__trust-bar mt-6">
            {copy.hero.trustLine.split("·").map((part, i) => (
              <span key={part.trim()}>
                {i > 0 ? <span className="mx-1 opacity-40">·</span> : null}
                <span className="academy-sales__trust-item">{part.trim()}</span>
              </span>
            ))}
          </p>
          <a href="#cursos" className="btn-primary academy-sales__cta-primary mt-8 inline-flex min-h-12 items-center px-8 text-base">
            {copy.hero.primaryCta}
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

      <section id="cursos" className="academy-sales__catalog scroll-mt-24 border-t border-white/10 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <header className="max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">{copy.courses.title}</h2>
            <p className="mt-2 text-sm text-white/60 sm:text-base">{copy.courses.subtitle}</p>
          </header>

          {loading ? (
            <div className="academy-sales__course-track mt-8" aria-busy="true" aria-label={copy.courses.loading}>
              <ul className="academy-sales__course-row">
                {[0, 1, 2, 3].map((i) => (
                  <li key={i} className="academy-sales__course-cell">
                    <AcademyStoreCourseCardSkeleton />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {!loading && error ? (
            <div className="panel mt-10 max-w-xl border-white/10 bg-white/[0.03] p-6 text-center sm:text-left">
              <p className="text-sm leading-relaxed text-white/70">{error || copy.courses.loadError}</p>
              <a href="#proposta" className="btn-secondary mt-5 inline-flex min-h-10 items-center px-5 text-sm">
                {copy.courses.loadErrorCta}
              </a>
            </div>
          ) : null}

          {!loading && !error && courses.length === 0 ? (
            <p className="mt-8 text-white/55">{copy.courses.empty}</p>
          ) : null}

          {!loading && !error && courses.length > 0 ? (
            <div className="academy-sales__course-track mt-8">
              <ul className="academy-sales__course-row">
                {courses.map((course) => (
                  <li key={course.id} className="academy-sales__course-cell">
                    <AcademyStoreCourseCard
                      course={course}
                      selected={selectedSlug === course.slug}
                      inCart={hasSlug(course.slug)}
                      instructorLabel={copy.courses.instructor}
                      onSelect={() => setSelectedSlug(course.slug)}
                      onAddToCart={() => addItem(course)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {!loading && !error && selected ? (
            <article className="academy-sales__offer panel mt-10 border-sky-500/25 bg-white/[0.03] p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.15em] text-sky-400">{copy.courses.offerTitle}</p>
              <div className="mt-4 flex flex-col gap-6 sm:flex-row">
                <CourseCover
                  title={selected.title}
                  coverUrl={selected.coverUrl}
                  className="course-cover--card sm:max-w-[220px] shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-semibold">{selected.title}</h3>
                  {selected.summary ? (
                    <p className="mt-3 text-sm leading-relaxed text-white/70">{selected.summary}</p>
                  ) : null}
                  <p className="mt-4 text-2xl font-semibold text-sky-300">
                    {(selected.priceCents / 100).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: selected.currency || "BRL"
                    })}
                  </p>
                  <p className="mt-2 text-xs text-white/50">
                    {selected.contentReady ? copy.courses.contentReady : copy.courses.contentPending}
                  </p>
                  <p className="mt-4 text-sm text-white/60">{copy.courses.offerHint}</p>
                      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                        <button
                          type="button"
                          className="btn-secondary inline-flex min-h-11 items-center justify-center sm:px-6"
                          disabled={hasSlug(selected.slug)}
                          onClick={() => addItem(selected)}
                        >
                          {hasSlug(selected.slug) ? ACADEMY_CART.inCart : ACADEMY_CART.addToCart}
                        </button>
                        <Link
                          to={ACADEMY_STORE_PATHS.cart}
                          className="btn-primary academy-sales__cta-primary inline-flex min-h-12 items-center justify-center sm:px-8"
                        >
                          {ACADEMY_CART.goToCart}
                        </Link>
                        <Link
                          to={academyCourseCheckoutPath(selected.slug)}
                          className="text-center text-sm text-brand-primary hover:underline sm:self-center"
                        >
                          {copy.courses.acquireCta}
                        </Link>
                      </div>
                </div>
              </div>
            </article>
          ) : null}

        </div>
      </section>

      <section id="proposta" className="academy-sales__proposta scroll-mt-24 border-t border-white/10 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <aside className="academy-sales__capture panel mx-auto max-w-xl border-emerald-500/25 bg-white/[0.03] p-6 sm:p-8">
            <h2 className="text-xl font-semibold sm:text-2xl">{copy.lead.formTitle}</h2>

            {leadSuccess ? (
              <p className="mt-4 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-100">
                <strong>{copy.lead.successTitle}</strong>
                <br />
                {leadSuccess}
              </p>
            ) : null}

            <form className="mt-5 space-y-4" onSubmit={(e) => void onLeadSubmit(e)}>
              {courses.length > 0 ? (
                <label className="block text-sm text-white/70">
                  Programa de interesse
                  <select
                    className="input mt-1.5 w-full"
                    name="courseSlug"
                    value={leadCourseSlug}
                    onChange={(e) => setLeadCourseSlug(e.target.value)}
                    disabled={leadSubmitting}
                  >
                    <option value="">Todos / ainda não decidi</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <input
                className="input w-full"
                name="name"
                placeholder={copy.lead.name}
                required
                disabled={leadSubmitting}
              />
              <input
                className="input w-full"
                type="email"
                name="email"
                placeholder={copy.lead.email}
                required
                autoComplete="email"
                disabled={leadSubmitting}
              />
              <input
                className="input w-full"
                type="tel"
                name="phone"
                placeholder={copy.lead.phone}
                required
                autoComplete="tel"
                disabled={leadSubmitting}
              />
              <label className="flex items-start gap-2 text-xs text-white/65">
                <input type="checkbox" name="acceptMarketing" className="mt-0.5" required disabled={leadSubmitting} />
                {copy.lead.terms}
              </label>
              {leadError ? <p className="text-sm text-red-300">{leadError}</p> : null}
              <button type="submit" className="btn-secondary w-full min-h-11" disabled={leadSubmitting}>
                {leadSubmitting ? copy.lead.submitting : copy.lead.submit}
              </button>
            </form>
          </aside>
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

      <footer className="academy-sales__footer border-t px-4 py-8 text-center text-sm text-white/45">
        <Link to={ACADEMY_STORE_PATHS.cart} className="text-brand-primary hover:underline">
          {ACADEMY_CART.cartTitle}
        </Link>
        <span className="mx-2 text-white/25">·</span>
        <Link to="/academia/entrar" state={{ from: ACADEMY_APP_BASE }} className="text-brand-primary hover:underline">
          {copy.footer.portal}
        </Link>
        <span className="mx-2 text-white/25">·</span>
        <Link to="/" className="text-white/45 hover:text-white/70">
          {copy.footer.agency}
        </Link>
        <span className="mx-2 text-white/25">·</span>
        <Link to={ACADEMY_APP_BASE} className="text-white/45 hover:text-white/70">
          Área interna (alunos)
        </Link>
      </footer>
    </AcademyStoreShell>
  );
}
