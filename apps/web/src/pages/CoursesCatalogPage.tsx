import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { COURSES_UI } from "@ederson-agencia/shared";
import { apiGet, apiPost } from "../api";

type CourseCard = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  visibility: string;
  priceCents: number | null;
  purchasable: boolean;
  hasAccess: boolean;
  locked: boolean;
};

export function CoursesCatalogPage() {
  const [courses, setCourses] = useState<CourseCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutMsg, setCheckoutMsg] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const data = await apiGet<{ courses: CourseCard[] }>("/courses");
        setCourses(data.courses);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar cursos.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <p className="text-white/60">{COURSES_UI.catalog.loading}</p>;
  }

  if (error) {
    return <p className="text-red-300">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{COURSES_UI.catalog.title}</h1>
        <p className="mt-2 text-sm text-white/60">{COURSES_UI.catalog.subtitle}</p>
      </div>

      <ul className="grid gap-4 md:grid-cols-2">
        {courses.map((course) => (
          <li key={course.id}>
            <div className="panel flex h-full flex-col p-6">
              <p className="text-xs uppercase tracking-wider text-brand-primary">
                {course.visibility === "INTERNAL" ? COURSES_UI.catalog.badgeInternal : COURSES_UI.catalog.badgeSale}
                {course.locked ? " · aguardando compra" : ""}
              </p>
              <h2 className="mt-2 text-lg font-semibold">{course.title}</h2>
              {course.summary ? <p className="mt-2 flex-1 text-sm text-white/60">{course.summary}</p> : null}
              {course.purchasable && course.priceCents != null ? (
                <p className="mt-3 text-sm text-white/80">
                  {(course.priceCents / 100).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                  })}
                </p>
              ) : null}
              {course.hasAccess ? (
                <Link
                  to={`/app/cursos/${course.slug}`}
                  className="mt-4 inline-block text-sm text-brand-primary hover:underline"
                >
                  {COURSES_UI.catalog.enter} →
                </Link>
              ) : course.locked ? (
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-white/50">{COURSES_UI.catalog.lockedHint}</p>
                  <div className="flex flex-wrap gap-2">
                    {(["PIX", "CARD", "BOLETO"] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        className="btn-secondary text-xs"
                        onClick={() =>
                          void (async () => {
                            try {
                              await apiPost(`/courses/${course.slug}/checkout`, { paymentMethod: method });
                            } catch (err) {
                              setCheckoutMsg(err instanceof Error ? err.message : "Checkout indisponível.");
                            }
                          })()
                        }
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      {checkoutMsg ? <p className="text-sm text-amber-200">{checkoutMsg}</p> : null}

      {courses.length === 0 ? (
        <p className="text-sm text-white/50">{COURSES_UI.catalog.empty}</p>
      ) : null}
    </div>
  );
}
