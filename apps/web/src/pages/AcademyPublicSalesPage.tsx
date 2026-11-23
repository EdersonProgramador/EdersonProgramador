import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ACADEMY_APP_BASE,
  ACADEMY_CART,
  ACADEMY_SALES,
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

/** Vitrine institucional + catálogo público alinhado à API `/public/academy/catalog`. */
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
        const firstBuyable = data.courses.find((c) => c.purchasable !== false && c.priceCents > 0);
        if (firstBuyable) setLeadCourseSlug(firstBuyable.slug);
        else if (data.courses[0]) setLeadCourseSlug(data.courses[0].slug);
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
    <nav className="academy-sales__section-nav" aria-label="Seções">
      {copy.nav.map((item) => (
        <a key={item.href} href={item.href}>
          {item.label}
        </a>
      ))}
    </nav>
  );

  return (
    <AcademyStoreShell nav={sectionNav}>
      <section className="academy-sales__hero academy-inst-hero relative overflow-hidden px-6 pb-24 pt-28 sm:pt-36">
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="academy-sales__eyebrow">{copy.brand}</p>
          <h1 className="academy-sales__hero-title mt-6 text-balance text-4xl font-black tracking-tight sm:text-6xl md:text-7xl">
            {copy.hero.headline}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-relaxed text-slate-500 sm:text-lg">
            {copy.hero.subheadline}
          </p>
          <p className="academy-sales__trust-bar mt-8">{copy.hero.trustLine}</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a href="#programas" className="academy-sales__cta-primary">
              {copy.hero.primaryCta}
            </a>
            <a href="#proposta" className="academy-sales__cta-ghost">
              Receber proposta
            </a>
          </div>
        </div>
      </section>

      <section id="instituicao" className="academy-inst-section scroll-mt-28 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <span className="academy-sales__section-kicker">Instituição</span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">{copy.institute.title}</h2>
            <p className="mt-5 text-base font-medium leading-relaxed text-slate-500 sm:text-lg">{copy.institute.body}</p>
          </div>
          <ul className="mt-16 grid gap-6 md:grid-cols-3">
            {copy.institute.pillars.map((pillar) => (
              <li key={pillar.title} className="academy-sales__pillar">
                <h3 className="text-lg font-bold text-slate-900">{pillar.title}</h3>
                <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500">{pillar.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="caminho" className="academy-inst-section academy-inst-section--muted scroll-mt-28 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <span className="academy-sales__section-kicker">Jornada</span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">{copy.path.title}</h2>
            <p className="mt-5 text-base font-medium leading-relaxed text-slate-500 sm:text-lg">{copy.path.subtitle}</p>
          </div>
          <ol className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {copy.path.steps.map((step, index) => (
              <li key={step.title} className="academy-sales__step-card">
                <span className="academy-sales__step-index">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="programas" className="academy-sales__catalog academy-inst-section scroll-mt-28 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <header className="mx-auto max-w-2xl text-center">
            <span className="academy-sales__section-kicker">Catálogo</span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">{copy.courses.title}</h2>
            <p className="mt-5 text-base font-medium text-slate-500 sm:text-lg">{copy.courses.subtitle}</p>
          </header>

          {loading ? (
            <ul className="academy-inst-program-grid mt-14" aria-busy="true">
              {[0, 1, 2].map((i) => (
                <li key={i}>
                  <AcademyStoreCourseCardSkeleton />
                </li>
              ))}
            </ul>
          ) : null}

          {!loading && error ? (
            <div className="academy-sales__empty mx-auto mt-14 max-w-xl text-center">
              <p className="text-sm font-medium text-slate-500">{error || copy.courses.loadError}</p>
              <a href="#proposta" className="academy-sales__cta-ghost mt-5 inline-flex">
                {copy.courses.loadErrorCta}
              </a>
            </div>
          ) : null}

          {!loading && !error && courses.length === 0 ? (
            <p className="mt-14 text-center text-sm font-medium text-slate-400">{copy.courses.empty}</p>
          ) : null}

          {!loading && !error && courses.length > 0 ? (
            <ul className="academy-inst-program-grid mt-14">
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

      <section id="proposta" className="academy-sales__proposta academy-inst-section--muted scroll-mt-28 px-6 py-24 pb-28">
        <div className="mx-auto max-w-xl">
          <aside className="academy-sales__capture">
            <span className="academy-sales__section-kicker">Contato</span>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{copy.lead.formTitle}</h2>

            {leadSuccess ? (
              <p className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
                <strong>{copy.lead.successTitle}</strong>
                <br />
                {leadSuccess}
              </p>
            ) : null}

            <form className="mt-6 space-y-4" onSubmit={(e) => void onLeadSubmit(e)}>
              {courses.length > 0 ? (
                <label className="block text-sm font-bold text-slate-700">
                  Programa de interesse
                  <select
                    className="academy-sales__input mt-1.5 w-full"
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
                className="academy-sales__input w-full"
                name="name"
                placeholder={copy.lead.name}
                required
                disabled={leadSubmitting}
              />
              <input
                className="academy-sales__input w-full"
                type="email"
                name="email"
                placeholder={copy.lead.email}
                required
                autoComplete="email"
                disabled={leadSubmitting}
              />
              <input
                className="academy-sales__input w-full"
                type="tel"
                name="phone"
                placeholder={copy.lead.phone}
                required
                autoComplete="tel"
                disabled={leadSubmitting}
              />
              <label className="flex items-start gap-2 text-xs font-medium text-slate-500">
                <input type="checkbox" name="acceptMarketing" className="mt-0.5" required disabled={leadSubmitting} />
                {copy.lead.terms}
              </label>
              {leadError ? <p className="text-sm font-bold text-rose-600">{leadError}</p> : null}
              <button type="submit" className="academy-sales__cta-primary w-full" disabled={leadSubmitting}>
                {leadSubmitting ? copy.lead.submitting : copy.lead.submit}
              </button>
            </form>
          </aside>
        </div>
      </section>

      <footer className="academy-sales__footer px-6 py-10 text-center text-sm">
        <Link to={ACADEMY_STORE_PATHS.cart}>{ACADEMY_CART.cartTitle}</Link>
        <span className="mx-2 opacity-30">·</span>
        <Link to="/academia/entrar" state={{ from: ACADEMY_APP_BASE }}>
          {copy.footer.portal}
        </Link>
        <span className="mx-2 opacity-30">·</span>
        <Link to="/">{copy.footer.agency}</Link>
      </footer>
    </AcademyStoreShell>
  );
}
