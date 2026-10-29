import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ACADEMY_SALES, normalizePublicCourseProgram, type PublicCourseProgram } from "@ederson-agencia/shared";
import { ApiError, apiGet } from "../api";
import { AcademyCourseProgramLayout } from "../components/academy/AcademyCourseProgramLayout";
import { AcademyStoreShell } from "../components/academy/AcademyStoreShell";
import { useAcademyCartStore } from "../stores/academyCartStore";
import "../styles/academy-sales.css";

const copy = ACADEMY_SALES;

export function AcademyCourseProgramPage() {
  const { courseSlug } = useParams<{ courseSlug: string }>();
  const [course, setCourse] = useState<PublicCourseProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const addItem = useAcademyCartStore((s) => s.addItem);
  const hasSlug = useAcademyCartStore((s) => s.hasSlug);

  useEffect(() => {
    if (!courseSlug) {
      setError(copy.checkout.notFound);
      setLoading(false);
      return;
    }
    void (async () => {
      try {
        const data = await apiGet<{ course: PublicCourseProgram }>(
          `/public/academy/courses/${encodeURIComponent(courseSlug)}`
        );
        setCourse(normalizePublicCourseProgram(data.course));
      } catch (err) {
        setError(err instanceof ApiError ? err.message : copy.checkout.notFound);
      } finally {
        setLoading(false);
      }
    })();
  }, [courseSlug]);

  return (
    <AcademyStoreShell>
      <div className="academy-inst-program-page px-4 py-10 sm:py-14">
        {loading ? (
          <p className="text-center text-sm text-[var(--as-body-muted,#64748b)]">{copy.courses.loading}</p>
        ) : null}
        {!loading && error ? (
          <p className="mx-auto max-w-lg text-center text-sm text-red-400">{error}</p>
        ) : null}
        {!loading && course ? (
          <AcademyCourseProgramLayout
            course={course}
            inCart={hasSlug(course.slug)}
            onAddToCart={() =>
              addItem({
                id: course.id,
                slug: course.slug,
                title: course.title,
                summary: course.summary,
                priceCents: course.priceCents,
                currency: course.currency,
                coverUrl: course.coverUrl,
                contentReady: course.contentReady
              })
            }
          />
        ) : null}
      </div>
    </AcademyStoreShell>
  );
}
