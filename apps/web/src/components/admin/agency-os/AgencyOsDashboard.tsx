import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ApiError, apiGet, apiPost } from "../../../api";
import { useAdminProjectScope } from "../admin-project-scope";
import { ApprovalQueuePanel } from "./ApprovalQueuePanel";
import { CampaignsPanel } from "./CampaignsPanel";
import { ClientAgentsPanel, findProposalAgentId } from "./ClientAgentsPanel";
import { ClientBookPanel } from "./ClientBookPanel";
import type { AgentJob, AgentRow, BookClient } from "./types";

type OpsOverview = {
  leadsNew: number;
  enrollmentsDue: number;
  campaignsActive: number;
  projectsOpen: number;
  agentApprovalsPending?: number;
  agentsDeployed?: number;
  clientsCount?: number;
};

const FLOW = [
  { n: 1, t: "Onboard", d: "Cliente na carteira" },
  { n: 2, t: "Agentes", d: "Especialistas por domínio" },
  { n: 3, t: "Gerar", d: "Proposta e materiais" },
  { n: 4, t: "Aprovar", d: "Você assina o que sai" }
] as const;

export function AgencyOsDashboard({ deepDive = false }: { deepDive?: boolean }) {
  const { withProjectQuery } = useAdminProjectScope();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedProjectId = searchParams.get("project")?.trim() ?? "";

  const [ops, setOps] = useState<OpsOverview | null>(null);
  const [clients, setClients] = useState<BookClient[]>([]);
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [jobs, setJobs] = useState<AgentJob[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [campMsg, setCampMsg] = useState<string | null>(null);

  const selected = useMemo(
    () => clients.find((c) => c.projectId === selectedProjectId) ?? null,
    [clients, selectedProjectId]
  );

  const refresh = useCallback(async () => {
    const [book, list, pending, overview] = await Promise.all([
      apiGet<{ clients: BookClient[] }>("/agency/admin/agents/book"),
      apiGet<{ agents: AgentRow[] }>("/agency/admin/agents"),
      apiGet<{ jobs: AgentJob[] }>(
        selectedProjectId
          ? `/agency/admin/agents/jobs?status=PENDING_APPROVAL&projectId=${encodeURIComponent(selectedProjectId)}`
          : "/agency/admin/agents/jobs?status=PENDING_APPROVAL"
      ),
      apiGet<OpsOverview>("/agency/admin/ops/overview")
    ]);
    setClients(book.clients);
    setAgents(list.agents);
    setJobs(pending.jobs);
    setOps(overview);
  }, [selectedProjectId]);

  useEffect(() => {
    void refresh().catch(() => null);
  }, [refresh]);

  function selectProject(projectId: string) {
    const next = new URLSearchParams(searchParams);
    next.set("project", projectId);
    setSearchParams(next, { replace: true });
  }

  async function bootstrap(projectId: string) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await apiPost<{ message: string }>("/agency/admin/agents/bootstrap-client", {
        projectId
      });
      setMsg(res.message);
      selectProject(projectId);
      await refresh();
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "Falha no bootstrap");
    } finally {
      setBusy(false);
    }
  }

  async function runAgent(agentId: string) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await apiPost<{ message: string }>(`/agency/admin/agents/${agentId}/run`, {
        projectId: selectedProjectId || undefined,
        input: {
          packageTier: selected?.packageTier || selected?.leadPackageTier || "professional",
          leadName: selected?.clientName,
          topic: "proposta comercial"
        }
      });
      setMsg(res.message);
      await refresh();
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "Falha ao gerar");
    } finally {
      setBusy(false);
    }
  }

  async function runProposalPack() {
    if (!selectedProjectId) return;
    let agentId = findProposalAgentId(agents, selectedProjectId);
    if (!agentId) {
      await bootstrap(selectedProjectId);
      const list = await apiGet<{ agents: AgentRow[] }>("/agency/admin/agents");
      setAgents(list.agents);
      agentId = findProposalAgentId(list.agents, selectedProjectId);
    }
    if (!agentId) {
      setMsg("Não foi possível criar o Arquiteto de proposta.");
      return;
    }
    await runAgent(agentId);
  }

  async function decide(jobId: string, decision: "APPROVED" | "REJECTED" | "SENT") {
    setBusy(true);
    setMsg(null);
    try {
      const res = await apiPost<{ message: string }>(`/agency/admin/agents/jobs/${jobId}/decide`, {
        decision,
        apply: decision !== "REJECTED"
      });
      setMsg(res.message);
      await refresh();
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "Falha na decisão");
    } finally {
      setBusy(false);
    }
  }

  async function processDue() {
    setBusy(true);
    setCampMsg(null);
    try {
      const res = await apiPost<{ message: string }>("/agency/admin/marketing/campaigns/process-due", {});
      setCampMsg(res.message);
      await refresh();
    } catch (e) {
      setCampMsg(e instanceof ApiError ? e.message : "Falha ao processar fila");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`agency-os${deepDive ? " agency-os--deep" : ""}`}>
      <header className="agency-os-hero">
        <p className="agency-os-hero__eyebrow">Agency OS</p>
        <h1>Multi-client dashboard</h1>
        <p>
          Agentes especialistas produzem branding, proposta START/BUSINESS/ENTERPRISE, campanhas e stack —
          você aprova antes de gravar.
        </p>
      </header>

      <ol className="admin-agents-flow">
        {FLOW.map((s) => (
          <li key={s.n} className="admin-agents-flow__item">
            <span className="admin-agents-flow__n">{s.n}</span>
            <span>
              <strong>{s.t}</strong>
              <span className="admin-agents-flow__d">{s.d}</span>
            </span>
          </li>
        ))}
      </ol>

      <section className="admin-ops-kpis">
        <article className="admin-ops-kpi">
          <p className="admin-ops-kpi__label">Clientes</p>
          <p className="admin-ops-kpi__value">{ops?.clientsCount ?? clients.length}</p>
        </article>
        <article className="admin-ops-kpi">
          <p className="admin-ops-kpi__label">Agentes implantados</p>
          <p className="admin-ops-kpi__value">{ops?.agentsDeployed ?? "—"}</p>
        </article>
        <article className="admin-ops-kpi">
          <p className="admin-ops-kpi__label">Aprovar</p>
          <p className="admin-ops-kpi__value">{ops?.agentApprovalsPending ?? jobs.length}</p>
        </article>
        <article className="admin-ops-kpi">
          <p className="admin-ops-kpi__label">Campanhas</p>
          <p className="admin-ops-kpi__value">{ops?.campaignsActive ?? "—"}</p>
        </article>
        <article className="admin-ops-kpi">
          <p className="admin-ops-kpi__label">Leads novos</p>
          <p className="admin-ops-kpi__value">{ops?.leadsNew ?? "—"}</p>
        </article>
      </section>

      {msg ? <p className="text-sm text-emerald-400">{msg}</p> : null}

      <div className="agency-os-grid">
        <ClientBookPanel
          clients={clients}
          selectedProjectId={selectedProjectId}
          busy={busy}
          onSelect={selectProject}
          onBootstrap={(id) => void bootstrap(id)}
        />
        <div className="agency-os-grid__stack">
          <CampaignsPanel
            campaignsActive={ops?.campaignsActive ?? 0}
            enrollmentsDue={ops?.enrollmentsDue ?? 0}
            withProjectQuery={withProjectQuery}
            onProcessDue={() => void processDue()}
            busy={busy}
            msg={campMsg}
          />
          <ClientAgentsPanel
            selected={selected}
            agents={agents}
            busy={busy}
            onRun={(id) => void runAgent(id)}
            onRunProposalPack={() => void runProposalPack()}
          />
        </div>
      </div>

      <ApprovalQueuePanel jobs={jobs} busy={busy} onDecide={(id, d) => void decide(id, d)} />
    </div>
  );
}
