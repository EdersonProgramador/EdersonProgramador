import { Link } from "react-router-dom";
import { ACADEMY_CART, ACADEMY_SALES } from "@ederson-agencia/shared";
import { CourseCover } from "../courses/CourseCover";

export type AcademyStoreCourseCardData = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  priceCents: number;
  currency: string;
  coverUrl?: string | null;
  contentReady?: boolean;
};

type AcademyStoreCourseCardProps = {
  course: AcademyStoreCourseCardData;
  inCart: boolean;
  instructorLabel: string;
  detailHref: string;
  onAddToCart: () => void;
};

export function AcademyStoreCourseCard({
  course,
  inCart,
  instructorLabel,
  detailHref,
  onAddToCart
}: AcademyStoreCourseCardProps) {
  const price = (course.priceCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: course.currency || "BRL"
  });

  return (
    <article className="academy-udemy-card academy-inst-card">
      <Link to={detailHref} className="academy-udemy-card__link">
        <div className="academy-udemy-card__media">
          <CourseCover title={course.title} coverUrl={course.coverUrl} className="academy-udemy-card__cover" />
        </div>
        <div className="academy-udemy-card__body">
          <h3 className="academy-udemy-card__title">{course.title}</h3>
          <p className="academy-udemy-card__instructor">{instructorLabel}</p>
          {course.summary ? <p className="academy-udemy-card__meta line-clamp-3">{course.summary}</p> : null}
          <p className="academy-udemy-card__price">{price}</p>
          <span className="academy-inst-card__cta mt-3 inline-block text-sm font-medium text-brand-primary">
            {ACADEMY_SALES.courses.openProgram} →
          </span>
        </div>
      </Link>
      <button
        type="button"
        className={`academy-udemy-card__cart-btn academy-sales__cta-cart ${inCart ? "is-in-cart" : ""}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onAddToCart();
        }}
        disabled={inCart}
      >
        {inCart ? ACADEMY_CART.inCart : ACADEMY_CART.addToCart}
      </button>
    </article>
  );
}

export function AcademyStoreCourseCardSkeleton() {
  return (
    <div className="academy-udemy-card academy-udemy-card--skeleton" aria-hidden>
      <div className="academy-udemy-card__media academy-udemy-card__shimmer" />
      <div className="academy-udemy-card__body space-y-2">
        <div className="academy-udemy-card__shimmer h-4 w-full rounded" />
        <div className="academy-udemy-card__shimmer h-3 w-2/3 rounded" />
        <div className="academy-udemy-card__shimmer h-4 w-1/3 rounded" />
      </div>
    </div>
  );
}
