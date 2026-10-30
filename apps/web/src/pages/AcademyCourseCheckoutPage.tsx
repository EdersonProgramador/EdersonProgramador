import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Lock, Shield } from "lucide-react";
import { ACADEMY_SALES, ACADEMY_STORE_BASE } from "@ederson-agencia/shared";
import { apiGet, apiPost } from "../api";
import { AcademyStoreShell } from "../components/academy/AcademyStoreShell";
import { CourseCover } from "../components/courses/CourseCover";
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

export function AcademyCourseCheckoutPage() {
  const { courseSlug } = useParams<{ courseSlug: string }>();
  const [course, setCourse] = useState<StoreCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseSlug) {
      setError(copy.checkout.notFound);
      setLoading(false);
      return;
    }
    void (async () => {
      try {
        const data = await apiGet<{ course: StoreCourse }>(
          `/public/academy/courses/${encodeURIComponent(courseSlug)}`
        );
        setCourse(data.course);
      } catch (err) {
        setError(err instanceof Error ? err.message : copy.checkout.notFound);
      } finally {
        setLoading(false);
      }
    })();
  }, [courseSlug]);

  async function onPurchase(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!course) return;
    setFormError(null);
    setSuccess(null);
    setSubmitting(true);
    const fd = new FormData(event.currentTarget);
    try {
      const res = await apiPost<{ message: string; emailSent?: boolean }>("/public/academy/purchase", {
        courseSlug: course.slug,
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

  const price =
    course &&
    (course.priceCents / 100).toLocaleString("pt-BR", { style: "currency", currency: course.currency || "BRL" });

  return (
    <AcademyStoreShell>
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <Link to={ACADEMY_STORE_BASE} className="inline-flex items-center gap-2 text-sm text-white/75 hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {copy.checkout.backToStore}
        </Link>
      </div>
      <main className="academy-checkout mx-auto max-w-6xl px-4 py-8 sm:py-10">
        {loading ? <p className="text-white/50">{copy.courses.loading}</p> : null}
        {error && !loading ? (
          <div className="panel mx-auto max-w-lg border-white/10 bg-white/[0.03] p-8 text-center">
            <p className="text-red-300">{error}</p>
            <Link to={ACADEMY_STORE_BASE} className="btn-primary mt-6 inline-flex">
              {copy.checkout.backToStore}
            </Link>
          </div>
        ) : null}

        {course && !loading ? (
          <>
            <h1 className="text-2xl font-bold sm:text-3xl">{copy.checkout.title}</h1>
            <p className="mt-2 text-sm text-white/55">
              <Lock className="mr-1 inline h-3.5 w-3.5 align-text-bottom" aria-hidden />
              {copy.checkout.secureNote}
            </p>

            <div className="mt-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              <aside className="panel h-fit border-white/10 bg-white/[0.03] p-6 lg:sticky lg:top-24">
                <h2 className="text-sm font-medium uppercase tracking-wide text-white/50">{copy.checkout.summaryTitle}</h2>
                <CourseCover
                  title={course.title}
                  coverUrl={course.coverUrl}
                  courseSlug={course.slug}
                  className="course-cover--card mt-4"
                />
                <h3 className="mt-4 text-xl font-semibold">{course.title}</h3>
                {course.summary ? <p className="mt-2 text-sm leading-relaxed text-white/65">{course.summary}</p> : null}
                <p className="mt-6 text-2xl font-semibold text-sky-300">{price}</p>
                <ul className="mt-6 space-y-2 border-t border-white/10 pt-6 text-sm text-white/70">
                  {copy.bonus.items.map((item) => (
                    <li key={item.title}>· {item.title}</li>
                  ))}
                </ul>
                <p className="mt-6 flex items-start gap-2 text-xs text-white/50">
                  <Shield className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" aria-hidden />
                  {copy.guarantee.subtitle}
                </p>
              </aside>

              <div className="panel border-white/10 bg-white/[0.03] p-6 sm:p-8">
                <h2 className="text-lg font-semibold">{copy.checkout.formTitle}</h2>

                {success ? (
                  <p className="mt-4 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-100">
                    <strong>{copy.checkout.successTitle}</strong>
                    <br />
                    {success}
                  </p>
                ) : (
                  <form className="mt-6 space-y-4" onSubmit={(e) => void onPurchase(e)}>
                    <input
                      className="input w-full"
                      name="name"
                      placeholder={copy.checkout.name}
                      required
                      disabled={submitting}
                    />
                    <input
                      className="input w-full"
                      type="email"
                      name="email"
                      placeholder={copy.checkout.email}
                      required
                      autoComplete="email"
                      disabled={submitting}
                    />
                    <input className="input w-full" name="phone" placeholder={copy.checkout.phone} disabled={submitting} />
                    <fieldset className="space-y-2" disabled={submitting}>
                      <legend className="text-sm text-white/70">{copy.checkout.payment}</legend>
                      <label className="flex cursor-pointer items-center gap-2 text-sm">
                        <input type="radio" name="paymentMethod" value="PIX" defaultChecked required />
                        {copy.checkout.pix}
                      </label>
                      <label className="flex cursor-pointer items-center gap-2 text-sm">
                        <input type="radio" name="paymentMethod" value="CARD" required />
                        {copy.checkout.card}
                      </label>
                    </fieldset>
                    <label className="flex items-start gap-2 text-xs text-white/65">
                      <input type="checkbox" name="acceptTerms" className="mt-0.5" required disabled={submitting} />
                      {copy.checkout.terms}
                    </label>
                    {formError ? <p className="text-sm text-red-300">{formError}</p> : null}
                    <button type="submit" className="btn-primary w-full min-h-12 text-base" disabled={submitting}>
                      {submitting ? copy.checkout.submitting : copy.checkout.submit}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </>
        ) : null}
      </main>
    </AcademyStoreShell>
  );
}
