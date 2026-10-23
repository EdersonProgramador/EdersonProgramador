import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../api";

type CourseCard = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  visibility: string;
  priceCents: number | null;
  purchasable: boolean;
};

export function CoursesCatalogPage() {
  const [courses, setCourses] = useState<CourseCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
    return <p className="text-white/60">Carregando catálogo…</p>;
  }

  if (error) {
    return <p className="text-red-300">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cursos</h1>
        <p className="mt-2 text-sm text-white/60">
          Formação interna da Ederson Programador. Novos cursos serão cadastrados pelo administrador.
        </p>
      </div>

      <ul className="grid gap-4 md:grid-cols-2">
        {courses.map((course) => (
          <li key={course.id}>
            <Link
              to={`/app/cursos/${course.slug}`}
              className="panel block h-full p-6 transition hover:border-brand-primary/40"
            >
              <p className="text-xs uppercase tracking-wider text-brand-primary">
                {course.visibility === "INTERNAL" ? "Interno" : "À venda"}
              </p>
              <h2 className="mt-2 text-lg font-semibold">{course.title}</h2>
              {course.summary ? <p className="mt-2 text-sm text-white/60">{course.summary}</p> : null}
              {course.purchasable && course.priceCents != null ? (
                <p className="mt-3 text-sm text-white/80">
                  {(course.priceCents / 100).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                  })}{" "}
                  — checkout em breve
                </p>
              ) : null}
              <span className="mt-4 inline-block text-sm text-brand-primary">Entrar na trilha →</span>
            </Link>
          </li>
        ))}
      </ul>

      {courses.length === 0 ? (
        <p className="text-sm text-white/50">Nenhum curso publicado no momento.</p>
      ) : null}
    </div>
  );
}
