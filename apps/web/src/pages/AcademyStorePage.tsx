import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ACADEMY_APP_BASE, ACADEMY_ADMIN_COURSES_BASE, COURSES_UI } from "@ederson-agencia/shared";
import { apiGet, apiPost } from "../api";
import { CourseCatalogCard, type CourseCatalogItem } from "../components/courses/CourseCatalogCard";
import { useAcademySession } from "../stores/authStore";
import "../styles/course-study.css";

export function AcademyStorePage() {
  const academyUser = useAcademySession()?.user;
  const [courses, setCourses] = useState<CourseCatalogItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutMsg, setCheckoutMsg] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const data = await apiGet<{ courses: CourseCatalogItem[] }>("/courses/store");
        setCourses(data.courses);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar vitrine.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onCheckout = useCallback(async (slug: string, method: "PIX" | "CARD" | "BOLETO") => {
    setCheckoutMsg(null);
    try {
      await apiPost(`/courses/${slug}/checkout`, { paymentMethod: method });
    } catch (err) {
      setCheckoutMsg(err instanceof Error ? err.message : "Checkout indisponível.");
    }
  }, []);

  if (loading) {
    return <p className="course-text-muted">{COURSES_UI.store.loading}</p>;
  }

  if (error) {
    return <p className="text-red-300">{error}</p>;
  }

  return (
    <div className="courses-academy space-y-8">
      <div className="panel overflow-hidden p-0">
        <div className="border-b border-[var(--app-border)] bg-gradient-to-br from-brand-primary/10 via-transparent to-transparent px-5 py-8 sm:px-8">
          <p className="text-xs uppercase tracking-widest text-brand-primary">Academia</p>
          <h1 className="mt-2 text-2xl font-bold text-[var(--app-text)] sm:text-3xl">{COURSES_UI.store.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--app-text-muted)]">
            {COURSES_UI.store.subtitle}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to={ACADEMY_APP_BASE} className="btn-secondary inline-flex min-h-11 items-center text-sm">
              {COURSES_UI.store.backToMine}
            </Link>
            {academyUser?.role === "ADMIN" ? (
              <Link to={ACADEMY_ADMIN_COURSES_BASE} className="btn-ghost inline-flex min-h-11 items-center text-sm">
                Gerenciar catálogo
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {courses.length > 0 ? (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <li key={course.id}>
              <CourseCatalogCard course={course} variant="store" onCheckout={(slug, method) => void onCheckout(slug, method)} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="panel space-y-3 p-6 text-center">
          <p className="course-text-subtle text-sm">{COURSES_UI.store.empty}</p>
          {academyUser?.role === "ADMIN" ? (
            <p className="text-xs text-[var(--app-text-muted)]">
              Publique um curso com visibilidade <strong>Venda pública</strong>, status <strong>Publicado</strong> e preço
              definido.
            </p>
          ) : null}
        </div>
      )}

      {checkoutMsg ? <p className="text-sm text-amber-200">{checkoutMsg}</p> : null}
    </div>
  );
}
