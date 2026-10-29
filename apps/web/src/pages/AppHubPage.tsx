import { Link } from "react-router-dom";
import { BookOpen, Briefcase } from "lucide-react";
import { agencyHomePathForRole, canAccessAcademy, canAccessAgency } from "@ederson-agencia/shared";
import { COURSES_UI } from "@ederson-agencia/shared";
import { useAuthStore } from "../stores/authStore";
import "../styles/course-study.css";

export function AppHubPage() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;

  const agencyPath = agencyHomePathForRole(user.role);
  const showAgency = canAccessAgency(user);
  const showAcademy = canAccessAcademy(user);

  return (
    <div className="courses-academy space-y-8">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl text-[var(--app-text)]">Portal Ederson Programador</h1>
        <p className="course-text-muted mt-2 text-sm leading-relaxed">
          Agência e Academia usam logins distintos. Entre na área correspondente ao que você precisa agora.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {showAcademy ? (
          <Link
            to="/app/cursos"
            className="panel group flex flex-col gap-3 p-6 transition hover:border-brand-primary/40"
          >
            <BookOpen className="h-8 w-8 text-brand-primary" />
            <h2 className="text-lg font-semibold text-[var(--app-text)]">{COURSES_UI.hub.cardTitle}</h2>
            <p className="course-text-muted text-sm leading-relaxed">{COURSES_UI.hub.cardBody}</p>
            <span className="text-sm text-brand-primary group-hover:underline">Ver cursos →</span>
          </Link>
        ) : (
          <div className="panel flex flex-col gap-3 p-6 opacity-90">
            <BookOpen className="h-8 w-8 text-[var(--app-text-subtle)]" />
            <h2 className="text-lg font-semibold text-[var(--app-text)]">Academia</h2>
            <p className="text-sm text-[var(--app-text-muted)]">
              Você entrou pela Agência. Para cursos, use o login da Academia (matrícula necessária).
            </p>
            <Link to="/academia/entrar" className="text-sm text-brand-primary hover:underline">
              Ir para login da Academia →
            </Link>
          </div>
        )}

        {showAgency ? (
          <Link
            to={agencyPath}
            className="panel group flex flex-col gap-3 p-6 transition hover:border-brand-primary/40"
          >
            <Briefcase className="h-8 w-8 text-brand-primary" />
            <h2 className="text-lg font-semibold text-[var(--app-text)]">Agência</h2>
            <p className="text-sm text-[var(--app-text-muted)]">
              Projetos, pacotes, etapas do App do Zero ao Lançamento e operação comercial.
            </p>
            <span className="text-sm text-brand-primary group-hover:underline">Ir para operação →</span>
          </Link>
        ) : (
          <div className="panel flex flex-col gap-3 p-6 opacity-90">
            <Briefcase className="h-8 w-8 text-[var(--app-text-subtle)]" />
            <h2 className="text-lg font-semibold text-[var(--app-text)]">Agência</h2>
            <p className="text-sm text-[var(--app-text-muted)]">
              Você entrou pela Academia. Para projetos contratados, use o login da Agência.
            </p>
            <Link to="/login" className="text-sm text-brand-primary hover:underline">
              Ir para login da Agência →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
