import { Link } from "react-router-dom";
import { Check, Shield } from "lucide-react";
import {
  ACADEMY_CART,
  ACADEMY_SALES,
  ACADEMY_STORE_BASE,
  ACADEMY_STORE_PATHS,
  academyCourseCheckoutPath,
  type PublicCourseProgram
} from "@ederson-agencia/shared";
import { CourseCover } from "../courses/CourseCover";

const copy = ACADEMY_SALES;

export function AcademyCourseProgramLayout({
  course,
  inCart,
  onAddToCart
}: {
  course: PublicCourseProgram;
  inCart: boolean;
  onAddToCart: () => void;
}) {
  const { program } = course;
  const price = (course.priceCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: course.currency || "BRL"
  });

  return (
    <article className="academy-inst-program mx-auto max-w-4xl">
      <Link to={ACADEMY_STORE_BASE} className="text-sm text-brand-primary hover:underline">
        ← Voltar aos programas
      </Link>

      <header className="academy-inst-program__hero mt-8">
        <CourseCover title={course.title} coverUrl={course.coverUrl} className="course-cover--card academy-inst-program__cover" />
        <div className="min-w-0 flex-1">
          <p className="academy-sales__eyebrow text-xs uppercase tracking-[0.2em]">{copy.brand}</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">{course.title}</h1>
          {course.summary ? (
            <p className="mt-4 text-base leading-relaxed text-[var(--as-body-muted,#64748b)]">{course.summary}</p>
          ) : null}
        </div>
      </header>

      <section className="academy-inst-program__block mt-12 border-t border-[var(--as-body-border,rgba(15,23,42,0.08))] pt-10">
        <p className="academy-inst-program__promise text-xl font-medium leading-relaxed sm:text-2xl">{program.promise}</p>
      </section>

      <section className="academy-inst-program__block mt-12 border-t border-[var(--as-body-border,rgba(15,23,42,0.08))] pt-10">
        <ul className="space-y-3">
          {program.deliverables.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-relaxed sm:text-base">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {program.bonus.length > 0 ? (
        <section className="academy-inst-program__block mt-12 border-t border-[var(--as-body-border,rgba(15,23,42,0.08))] pt-10">
          <ul className="grid gap-4 sm:grid-cols-2">
            {program.bonus.map((item) => (
              <li key={item.title} className="panel border-[var(--as-body-border,rgba(15,23,42,0.1))] bg-[var(--as-body-panel,rgba(255,255,255,0.6))] p-5">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--as-body-muted,#64748b)]">{item.body}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="academy-inst-program__block academy-inst-program__invest mt-12 border-t border-[var(--as-body-border,rgba(15,23,42,0.08))] pt-10">
        <p className="font-mono text-3xl font-semibold tracking-tight sm:text-4xl">{price}</p>
        <p className="mt-2 text-sm text-[var(--as-body-muted,#64748b)]">
          {course.contentReady ? copy.courses.contentReady : copy.courses.contentPending}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            className="btn-secondary inline-flex min-h-11 items-center justify-center px-6"
            disabled={inCart}
            onClick={onAddToCart}
          >
            {inCart ? ACADEMY_CART.inCart : ACADEMY_CART.addToCart}
          </button>
          <Link
            to={academyCourseCheckoutPath(course.slug)}
            className="btn-primary academy-sales__cta-primary inline-flex min-h-12 items-center justify-center px-8"
          >
            {copy.courses.acquireCta}
          </Link>
          <Link to={ACADEMY_STORE_PATHS.cart} className="text-sm text-brand-primary hover:underline sm:self-center">
            {ACADEMY_CART.goToCart}
          </Link>
        </div>
      </section>

      <section className="academy-inst-program__block mt-12 border-t border-[var(--as-body-border,rgba(15,23,42,0.08))] pt-10 pb-8">
        <div className="flex gap-4">
          <Shield className="h-8 w-8 shrink-0 text-brand-primary" aria-hidden />
          <p className="text-sm leading-relaxed text-[var(--as-body-muted,#64748b)] sm:text-base">{program.guarantee}</p>
        </div>
        <p className="mt-4 text-sm text-[var(--as-body-muted,#64748b)]">
          Dúvidas:{" "}
          <a href={`mailto:${copy.guarantee.supportEmail}`} className="text-brand-primary hover:underline">
            {copy.guarantee.supportEmail}
          </a>
        </p>
      </section>
    </article>
  );
}
