import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatBRL } from "@ederson-agencia/shared";
import { apiGet, apiPatch, apiPost } from "../api";

type DashboardStats = Record<string, number>;

type Phase = {
  id: string;
  phaseKey: string;
  label: string;
  daysPlanned: number;
  status: string;
  notes?: string | null;
};

type Project = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  paymentStatus: string;
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
  status: string;
  createdAt: string;
};

function StatGrid({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Object.entries(stats).map(([key, value]) => (
        <div key={key} className="panel p-4">
          <p className="text-xs uppercase tracking-wide text-white/50">{key}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      ))}
    </div>
  );
}

function PhaseList({
  phases,
  canEdit,
  onUpdate
}: {
  phases: Phase[];
  canEdit: boolean;
  onUpdate: (phaseId: string, status: string) => Promise<void>;
}) {
  return (
    <ul className="space-y-3">
      {phases.map((phase) => (
        <li key={phase.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-medium">{phase.label}</p>
              <p className="text-xs text-white/50">
                {phase.daysPlanned} dias · {phase.status}
              </p>
            </div>
            {canEdit ? (
              <select
                className="input max-w-[220px]"
                value={phase.status}
                onChange={(event) => void onUpdate(phase.id, event.target.value)}
              >
                {[
                  "PENDING",
                  "IN_PROGRESS",
                  "WAITING_APPROVAL",
                  "APPROVED",
                  "DONE"
                ].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

function ProjectsPanel({ role }: { role: "ADMIN" | "CLIENT" | "FREELANCER" }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const canEditPhases = role === "ADMIN" || role === "FREELANCER" || role === "CLIENT";

  useEffect(() => {
    void apiGet<{ projects: Project[] }>("/agency/projects").then((res) => setProjects(res.projects));
  }, []);

  async function updatePhase(phaseId: string, status: string) {
    await apiPatch(`/agency/phases/${phaseId}`, { status });
    const refreshed = await apiGet<{ projects: Project[] }>("/agency/projects");
    setProjects(refreshed.projects);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Projetos</h2>
      {projects.length === 0 ? (
        <p className="text-white/60">Nenhum projeto ainda.</p>
      ) : (
        projects.map((project) => (
          <article key={project.id} className="panel space-y-4 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{project.title}</h3>
                <p className="text-sm text-white/60">{project.description}</p>
              </div>
              <div className="text-right text-sm">
                <p>{formatBRL(project.totalValueCents)}</p>
                <p className="text-white/50">
                  Entrada {formatBRL(project.entryValueCents)} · {project.paymentStatus}
                </p>
              </div>
            </div>
            <PhaseList phases={project.phases} canEdit={canEditPhases} onUpdate={updatePhase} />
          </article>
        ))
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
    await apiPost(`/agency/leads/${lead.id}/convert`, {
      clientEmail,
      projectTitle: `Projeto — ${lead.company ?? lead.name}`
    });
    const refreshed = await apiGet<{ leads: Lead[] }>("/agency/leads");
    setLeads(refreshed.leads);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Administração</h1>
        <p className="text-white/60">Leads, projetos e operação da agência.</p>
      </div>
      <StatGrid stats={stats} />
      <p className="text-sm">
        <Link to="/app/admin/cursos" className="text-brand-primary hover:underline">
          Gerenciar cursos online →
        </Link>
      </p>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Leads da landing</h2>
        <div className="space-y-3">
          {leads.map((lead) => (
            <div key={lead.id} className="panel flex flex-wrap items-start justify-between gap-3 p-4">
              <div>
                <p className="font-medium">
                  {lead.name} · {lead.status}
                </p>
                <p className="text-sm text-white/60">
                  {lead.email} {lead.phone ? `· ${lead.phone}` : ""}
                </p>
                <p className="mt-2 text-sm text-white/80">{lead.message}</p>
              </div>
              <button type="button" className="btn-secondary" onClick={() => void convertLead(lead)}>
                Converter em projeto
              </button>
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
        <h1 className="text-3xl font-bold">Área do cliente</h1>
        <p className="text-white/60">
          Acompanhe as fases do cronograma, aprovações por escrito e condições de pagamento do seu contrato.
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
        <h1 className="text-3xl font-bold">Área do freelancer</h1>
        <p className="text-white/60">Projetos atribuídos e status das entregas por fase.</p>
      </div>
      <StatGrid stats={stats} />
      <ProjectsPanel role="FREELANCER" />
    </div>
  );
}
