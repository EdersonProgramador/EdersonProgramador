import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AGENCY_APP_BASE,
  AGENCY_CLIENT_FUNNEL_PATH,
  formatBRL,
  packageTierLabel,
  parsePackageTier,
  projectProgressPercent
} from "@ederson-agencia/shared";
import { apiGet } from "../../api";

type Deliverable = { id: string; label: string; status: string };

type Phase = {
  id: string;
  phaseKey: string;
  label: string;
  daysPlanned: number;
  status: string;
  deliverables: Deliverable[];
};

type Project = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  contractStatus?: string;
  paymentStatus: string;
  packageTier: string;
  totalValueCents: number;
  phases: Phase[];
};

function ProjectCard({ project }: { project: Project }) {
  const deliverables = project.phases.flatMap((p) => p.deliverables);
  const progress = projectProgressPercent(project.phases, deliverables);
  const tier = parsePackageTier(project.packageTier) ?? "professional";

  return (
    <article className="rounded-2xl border border-[var(--acp-line)] bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--acp-muted)]">
        Pacote {packageTierLabel(tier)}
      </p>
      <h3 className="mt-1 text-lg font-semibold text-[var(--acp-ink)]">{project.title}</h3>
      {project.description ? (
        <p className="mt-1 text-sm text-[var(--acp-muted)]">{project.description}</p>
      ) : null}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-[var(--acp-muted)]">
          <span>Progresso</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--acp-surface)]">
          <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <p className="mt-3 text-sm text-[var(--acp-muted)]">
        Investimento total: <strong className="text-[var(--acp-ink)]">{formatBRL(project.totalValueCents)}</strong>
      </p>
      <Link
        to={`${AGENCY_APP_BASE}/projetos/${project.id}`}
        className="btn-primary mt-4 inline-flex text-sm"
      >
        Acompanhar etapas e entregas
      </Link>
    </article>
  );
}

export function ClientDashboardProjects() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    void apiGet<{ projects: Project[] }>("/agency/projects").then((res) => setProjects(res.projects));
  }, []);

  return (
    <section className="acp-panel space-y-4">
      {projects.length === 0 ? (
        <p className="text-sm text-[var(--acp-muted)]">
          Nenhum projeto em andamento.{" "}
          <Link to={AGENCY_CLIENT_FUNNEL_PATH} className="font-semibold text-indigo-600 hover:underline">
            Contratar serviços
          </Link>{" "}
          ou fale com a equipe.
        </p>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </section>
  );
}