import { Link } from "react-router-dom";
import { ACADEMY_APP_BASE, COURSES_UI } from "@ederson-agencia/shared";
import { CourseCover } from "./CourseCover";

export type CourseCatalogItem = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  visibility: string;
  priceCents: number | null;
  purchasable: boolean;
  hasAccess: boolean;
  locked: boolean;
  contentReady?: boolean;
  coverUrl?: string | null;
};

type CourseCatalogCardProps = {
  course: CourseCatalogItem;
  variant: "mine" | "store";
  onCheckout?: (slug: string, method: "PIX" | "CARD" | "BOLETO") => void;
};

export function CourseCatalogCard({ course, variant, onCheckout }: CourseCatalogCardProps) {
  const badge =
    variant === "store"
      ? course.hasAccess
        ? COURSES_UI.store.badgeOwned
        : COURSES_UI.store.badge
      : course.visibility === "INTERNAL"
        ? COURSES_UI.catalog.badgeInternal
        : COURSES_UI.catalog.badgeSale;

  return (
    <div className="course-card panel flex h-full flex-col p-0">
      <CourseCover title={course.title} coverUrl={course.coverUrl} className="course-cover--card" />
      <div className="flex flex-1 flex-col p-4 sm:p-6">
        <p className="text-xs uppercase tracking-wider text-brand-primary">
          {badge}
          {variant === "mine" && course.locked ? " · aguardando compra" : null}
        </p>
        <h2 className="mt-2 text-lg font-semibold text-white">{course.title}</h2>
        {course.summary ? (
          <p className="course-text-muted mt-2 flex-1 text-sm leading-relaxed">{course.summary}</p>
        ) : null}
        {course.priceCents != null && course.priceCents > 0 ? (
          <p className="mt-3 text-sm font-medium text-[var(--course-fg)]">
            {variant === "store" ? `${COURSES_UI.store.priceFrom}: ` : null}
            {(course.priceCents / 100).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL"
            })}
          </p>
        ) : null}

        {course.hasAccess && course.contentReady === false ? (
          <p className="course-text-subtle mt-4 text-xs leading-relaxed">{COURSES_UI.catalog.contentNotReady}</p>
        ) : null}

        {course.hasAccess && course.contentReady !== false ? (
          <Link
            to={`${ACADEMY_APP_BASE}/cursos/${course.slug}`}
            className="btn-primary mt-4 inline-flex w-full min-h-11 items-center justify-center sm:w-auto"
          >
            {variant === "store" ? COURSES_UI.store.enter : COURSES_UI.catalog.enter} →
          </Link>
        ) : course.locked && onCheckout ? (
          <div className="mt-4 space-y-3">
            <p className="course-text-subtle text-xs leading-relaxed">
              {variant === "store" ? COURSES_UI.store.buyHint : COURSES_UI.catalog.lockedHint}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {(["PIX", "CARD", "BOLETO"] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  className="btn-secondary min-h-11 w-full text-sm sm:w-auto"
                  onClick={() => onCheckout(course.slug, method)}
                >
                  {variant === "store" ? `${COURSES_UI.store.buy} · ${method}` : method}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
