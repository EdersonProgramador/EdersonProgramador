import { Link } from "react-router-dom";
import { BookOpen, Briefcase } from "lucide-react";
import { agencyHomePathForRole, COURSES_UI } from "@ederson-agencia/shared";
import { useAuthStore } from "../stores/authStore";

export function AppHubPage() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;

  const agencyPath = agencyHomePathForRole(user.role);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Portal Ederson Programador</h1>
        <p className="mt-2 text-sm text-white/60">
          Desenvolvimento de sistemas sob contrato e formação interna — áreas separadas, mesmo acesso.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          to="/app/cursos"
          className="panel group flex flex-col gap-3 p-6 transition hover:border-brand-primary/40"
        >
          <BookOpen className="h-8 w-8 text-brand-primary" />
          <h2 className="text-lg font-semibold">{COURSES_UI.hub.cardTitle}</h2>
          <p className="text-sm text-white/60">{COURSES_UI.hub.cardBody}</p>
          <span className="text-sm text-brand-primary group-hover:underline">Ver cursos →</span>
        </Link>

        <Link
          to={agencyPath}
          className="panel group flex flex-col gap-3 p-6 transition hover:border-brand-primary/40"
        >
          <Briefcase className="h-8 w-8 text-brand-primary" />
          <h2 className="text-lg font-semibold">Agência</h2>
          <p className="text-sm text-white/60">
            Projetos de software, etapas do contrato, leads e acompanhamento cliente/freelancer.
          </p>
          <span className="text-sm text-brand-primary group-hover:underline">Ir para operação →</span>
        </Link>
      </div>
    </div>
  );
}
