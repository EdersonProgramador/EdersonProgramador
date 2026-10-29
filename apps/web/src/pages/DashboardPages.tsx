import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AGENCY_APP_BASE,
  formatBRL,
  packageTierLabel,
  parsePackageTier,
  projectProgressPercent,
  type PackageTierId
} from "@ederson-agencia/shared";
import { apiGet, apiPatch, apiPost } from "../api";

type DashboardStats = Record<string, number>;

type Deliverable = { id: string; label: string; status: string };

type Phase = {
  id: string;
  phaseKey: string;
  label: string;
  daysPlanned: number;
  status: string;
  notes?: string | null;
  deliverables: Deliverable[];
};

type Project = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  paymentStatus: string;
  packageTier: string;
  totalValueCents: number;
  entryValueCents: number;
  phases: Phase[];
  client?: { name: string; email: string; company?: string | null };
  freelancer?: { name: string; email: string } | null;
};

type Lead = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  message: string;
  packageTier?: string | null;
  status: string;
  createdAt: string;
};

function StatGrid({ stats }: { stats: DashboardStats }) {
  const labels: Record<string, string> = {
    leads: "Leads",
    projects: "Projetos",
    freelancers: "Freelancers",
    clients: "Clientes",
    inProgress: "Fases em andamento",
    awaitingApproval: "Aguardando aprovação"
  };
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Object.entries(stats).map(([key, value]) => (
        <div key={key} className="panel p-4">
          <p className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">{labels[key] ?? key}</p>
          <p className="text-2xl font-bold text-[var(--app-text)]">{value}</p>
        </div>
      ))}
    </div>
  );
}

function ProjectCard({ project, role }: { project: Project; role: "ADMIN" | "CLIENT" | "FREELANCER" }) {
  const deliverables = project.phases.flatMap((p) => p.deliverables);
  const progress = projectProgressPercent(project.phases, deliverables);
  const tier = parsePackageTier(project.packageTier) ?? "professional";

  return (
    <article className="panel space-y-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">
            Pacote {packageTierLabel(tier)}
          </p>
          <h3 className="text-lg font-semibold text-[var(--app-text)]">{project.title}</h3>
          <p className="text-sm text-[var(--app-text-muted)]">{project.description}</p>
        </div>
        <div className="text-right text-sm">
          <p className="font-medium text-[var(--app-text)]">{formatBRL(project.totalValueCents)}</p>
          <p className="text-[var(--app-text-muted)]">{project.paymentStatus}</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs text-[var(--app-text-muted)]">
          <span>Progresso</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--app-hover)]">
          <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <Link to={`${AGENCY_APP_BASE}/projetos/${project.id}`} className="btn-primary inline-flex text-sm">
        {role === "CLIENT" ? "Acompanhar etapas e entregas" : "Gerenciar jornada do projeto"}
      </Link>
    </article>
  );
}

function ProjectsPanel({ role }: { role: "ADMIN" | "CLIENT" | "FREELANCER" }) {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    void apiGet<{ projects: Project[] }>("/agency/projects").then((res) => setProjects(res.projects));
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-[var(--app-text)]">Projetos</h2>
      {projects.length === 0 ? (
        <p className="text-[var(--app-text-muted)]">Nenhum projeto ainda.</p>
      ) : (
        projects.map((project) => <ProjectCard key={project.id} project={project} role={role} />)
      )}
    </div>
  );
}

function useDashboard() {
  const [stats, setStats] = useState<DashboardStats>({});
  useEffect(() => {
    void apiGet<{ stats: DashboardStats }>("/agency/dashboard").then((res) => setStats(res.stats));
  }, []);
  return stats;
}

export function AdminDashboard() {
  const stats = useDashboard();
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    void apiGet<{ leads: Lead[] }>("/agency/leads").then((res) => setLeads(res.leads));
  }, []);

  async function convertLead(lead: Lead) {
    const clientEmail = window.prompt("E-mail do cliente (conta já cadastrada):", lead.email);
    if (!clientEmail) return;
    const defaultTier = (parsePackageTier(lead.packageTier) ?? "professional") as PackageTierId;
    const tierInput = window.prompt(
      "Pacote (essential | professional | advanced):",
      defaultTier
    );
    const packageTier = parsePackageTier(tierInput) ?? defaultTier;
    await apiPost(`/agency/leads/${lead.id}/convert`, {
      clientEmail,
      projectTitle: `App do Zero ao Lançamento — ${lead.company ?? lead.name}`,
      packageTier
    });
    const refreshed = await apiGet<{ leads: Lead[] }>("/agency/leads");
    setLeads(refreshed.leads);
  }

  async function setLeadTier(leadId: string, packageTier: PackageTierId) {
    await apiPatch(`/agency/leads/${leadId}`, { packageTier });
    const refreshed = await apiGet<{ leads: Lead[] }>("/agency/leads");
    setLeads(refreshed.leads);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--app-text)]">Administração</h1>
        <p className="text-[var(--app-text-muted)]">Leads, pacotes e jornada dos projetos.</p>
      </div>
      <StatGrid stats={stats} />
      <p className="text-sm">
        <Link to={`${AGENCY_APP_BASE}/admin/cursos`} className="text-brand-primary hover:underline">
          Gerenciar cursos online →
        </Link>
      </p>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--app-text)]">Leads da landing</h2>
        <div className="space-y-3">
          {leads.map((lead) => (
            <div key={lead.id} className="panel flex flex-wrap items-start justify-between gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-[var(--app-text)]">
                  {lead.name} · {lead.status}
                  {lead.packageTier ? (
                    <span className="ml-2 text-sm font-normal text-sky-600 dark:text-sky-300">
                      Pacote: {packageTierLabel(parsePackageTier(lead.packageTier) ?? "professional")}
                    </span>
                  ) : null}
                </p>
                <p className="text-sm text-[var(--app-text-muted)]">
                  {lead.email} {lead.phone ? `· ${lead.phone}` : ""}
                </p>
                <p className="mt-2 text-sm text-[var(--app-text-muted)]">{lead.message}</p>
              </div>
              <div className="flex flex-col gap-2">
                <select
                  className="input text-sm"
                  value={lead.packageTier ?? ""}
                  onChange={(e) => {
                    const t = parsePackageTier(e.target.value);
                    if (t) void setLeadTier(lead.id, t);
                  }}
                >
                  <option value="">Definir pacote…</option>
                  <option value="essential">Essencial</option>
                  <option value="professional">Profissional</option>
                  <option value="advanced">Avançado</option>
                </select>
                <button type="button" className="btn-secondary text-sm" onClick={() => void convertLead(lead)}>
                  Converter em projeto
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <ProjectsPanel role="ADMIN" />
    </div>
  );
}

export function ClientDashboard() {
  const stats = useDashboard();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--app-text)]">Área do cliente</h1>
        <p className="text-[var(--app-text-muted)]">
          Acompanhe em qual etapa está seu aplicativo, entregáveis concluídos e solicite upgrade de pacote quando
          precisar.
        </p>
      </div>
      <StatGrid stats={stats} />
      <ProjectsPanel role="CLIENT" />
    </div>
  );
}

export function FreelancerDashboard() {
  const stats = useDashboard();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--app-text)]">Área do freelancer</h1>
        <p className="text-[var(--app-text-muted)]">Atualize entregáveis e fases dos projetos atribuídos.</p>
      </div>
      <StatGrid stats={stats} />
      <ProjectsPanel role="FREELANCER" />
    </div>
  );
}
