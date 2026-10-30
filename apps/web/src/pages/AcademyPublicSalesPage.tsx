import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ACADEMY_APP_BASE,
  ACADEMY_CART,
  ACADEMY_SALES,
  ACADEMY_STORE_BASE,
  ACADEMY_STORE_PATHS,
  academyCourseProgramPath
} from "@ederson-agencia/shared";
import { ApiError, apiGet, apiPost } from "../api";
import {
  AcademyStoreCourseCard,
  AcademyStoreCourseCardSkeleton,
  type AcademyStoreCourseCardData
} from "../components/academy/AcademyStoreCourseCard";
import { AcademyStoreShell } from "../components/academy/AcademyStoreShell";
import { useAcademyCartStore } from "../stores/academyCartStore";
import "../styles/course-study.css";
import "../styles/academy-sales.css";

type StoreCourse = AcademyStoreCourseCardData;

const copy = ACADEMY_SALES;

export function AcademyPublicSalesPage() {
  const [courses, setCourses] = useState<StoreCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        if (data.courses[0]) setLeadCourseSlug(data.courses[0].slug);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Não foi possível carregar os cursos.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
      if (courses[0]) setLeadCourseSlug(courses[0].slug);
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
      <section className="academy-sales__hero academy-inst-hero relative overflow-hidden px-4 pb-16 pt-12 sm:pt-20">
        <div className="mesh-hero pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="academy-sales__eyebrow text-xs uppercase tracking-[0.25em]">{copy.brand}</p>
          <h1 className="academy-sales__hero-title mt-4 text-balance text-3xl font-bold leading-tight sm:text-4xl md:text-[2.75rem]">
            {copy.hero.headline}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--as-muted)] sm:text-lg">{copy.hero.subheadline}</p>
          <p className="academy-sales__trust-bar mt-6">{copy.hero.trustLine}</p>
          <a href="#programas" className="btn-primary academy-sales__cta-primary mt-8 inline-flex min-h-12 items-center px-8 text-base">
            {copy.hero.primaryCta}
          </a>
        </div>
      </section>

      <section id="instituicao" className="academy-inst-section scroll-mt-24 border-t border-white/10 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">{copy.institute.title}</h2>
            <p className="mt-4 text-base leading-relaxed text-[var(--as-muted)]">{copy.institute.body}</p>
          </div>
          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {copy.institute.pillars.map((pillar) => (
              <li key={pillar.title} className="panel border-white/10 bg-white/[0.04] p-6 text-center md:text-left">
                <h3 className="text-lg font-semibold">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--as-muted)]">{pillar.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="programas" className="academy-sales__catalog academy-inst-section scroll-mt-24 border-t border-white/10 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <header className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">{copy.courses.title}</h2>
            <p className="mt-3 text-sm text-[var(--as-muted)] sm:text-base">{copy.courses.subtitle}</p>
          </header>

          {loading ? (
            <div className="academy-sales__course-track mt-10" aria-busy="true">
              <ul className="academy-inst-program-grid">
                {[0, 1, 2].map((i) => (
                  <li key={i}>
                    <AcademyStoreCourseCardSkeleton />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {!loading && error ? (
            <div className="panel mx-auto mt-10 max-w-xl border-white/10 bg-white/[0.03] p-6 text-center">
              <p className="text-sm text-white/70">{error || copy.courses.loadError}</p>
              <a href="#proposta" className="btn-secondary mt-5 inline-flex min-h-10 items-center px-5 text-sm">
                {copy.courses.loadErrorCta}
              </a>
            </div>
          ) : null}

          {!loading && !error && courses.length === 0 ? (
            <p className="mt-10 text-center text-white/55">{copy.courses.empty}</p>
          ) : null}

          {!loading && !error && courses.length > 0 ? (
            <ul className="academy-inst-program-grid mt-10">
              {courses.map((course) => (
                <li key={course.id}>
                  <AcademyStoreCourseCard
                    course={course}
                    inCart={hasSlug(course.slug)}
                    instructorLabel={copy.courses.instructor}
                    detailHref={academyCourseProgramPath(course.slug)}
                    onAddToCart={() => addItem(course)}
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      <section id="proposta" className="academy-sales__proposta scroll-mt-24 border-t border-white/10 px-4 py-16 pb-24">
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
              <input className="input w-full" name="name" placeholder={copy.lead.name} required disabled={leadSubmitting} />
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
      </footer>
    </AcademyStoreShell>
  );
}
