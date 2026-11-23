import { Link, useParams } from "react-router-dom";
import {
  AGENCY_APP_BASE,
  AGENCY_CLIENT_FUNNEL_PATH,
  AGENCY_OPS_DELIVERABLE_STATUSES,
  AGENCY_OPS_PIPELINE_STAGES,
  agencyOpsLaneAdminPath,
  getAgencyOpsLane,
  getAgencyOpsVertical,
  isAgencyOpsLaneId,
  isAgencyOpsVerticalId,
  type AgencyOpsLaneId,
  type AgencyOpsVerticalId
} from "@ederson-agencia/shared";
import { useCallback, useEffect, useState } from "react";
import { AdminProcessChrome } from "../components/admin/AdminProcessChrome";
import { useAdminProjectScope } from "../components/admin/admin-project-scope";
import { ApiError, apiGet, apiPatch, apiPost } from "../api";
import { AgencyOsDashboard } from "../components/admin/agency-os/AgencyOsDashboard";

const ADMIN = `${AGENCY_APP_BASE}/admin`;

type Deliverable = {
  id: string;
  title: string;
  status: string;
  vertical: string;
  projectId: string | null;
  approvalStatus: string | null;
  timeMinutes: number | null;
};

function LaneLinks({
  vertical,
  withProjectQuery
}: {
  vertical: AgencyOpsVerticalId;
  withProjectQuery: (path: string) => string;
}) {
  const lanes: AgencyOpsLaneId[] = [
    "comando",
    "pipeline",
    "entrega",
    "propostas",
    "portal",
    "tempo",
    "financas",
    "inteligencia",
    "relatorios"
  ];
  return (
    <div className="admin-process__tabs flex-wrap">
      {lanes.map((id) => {
        const lane = getAgencyOpsLane(id);
        return (
          <Link
            key={id}
            className="admin-process__tab-link"
            to={withProjectQuery(`${ADMIN}/${agencyOpsLaneAdminPath(vertical, id)}`)}
          >
            {lane.order}. {lane.label}
          </Link>
        );
      })}
    </div>
  );
}

function DeliverableBoard({ vertical }: { vertical: AgencyOpsVerticalId }) {
  const { projectId } = useAdminProjectScope();
  const [items, setItems] = useState<Deliverable[]>([]);
  const [title, setTitle] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    const q = new URLSearchParams({ vertical });
    if (projectId) q.set("projectId", projectId);
    void apiGet<{ deliverables: Deliverable[] }>(`/agency/admin/ops/deliverables?${q}`)
      .then((r) => setItems(r.deliverables))
      .catch(() => setItems([]));
  }, [vertical, projectId]);

  useEffect(() => {
    load();
  }, [load]);

  async function create() {
    if (!title.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      await apiPost("/agency/admin/ops/deliverables", {
        title: title.trim(),
        vertical,
        projectId: projectId || undefined,
        status: "TODO"
      });
      setTitle("");
      load();
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "Falha ao criar");
    } finally {
      setBusy(false);
    }
  }

  async function move(id: string, status: string) {
    setBusy(true);
    try {
      await apiPatch(`/agency/admin/ops/deliverables/${id}`, { status });
      load();
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "Falha ao mover");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <input
          className="input min-w-[12rem] flex-1"
          placeholder="Novo entregável…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void create();
          }}
        />
        <button type="button" className="btn-primary" disabled={busy} onClick={() => void create()}>
          Adicionar
        </button>
      </div>
      {msg ? <p className="text-sm text-amber-400">{msg}</p> : null}
      <div className="agency-ops-kanban">
        {AGENCY_OPS_DELIVERABLE_STATUSES.map((status) => (
          <div key={status} className="agency-ops-kanban__col">
            <h3 className="agency-ops-kanban__title">{status}</h3>
            <ul className="agency-ops-kanban__list">
              {items
                .filter((d) => d.status === status)
                .map((d) => (
                  <li key={d.id} className="agency-ops-kanban__card">
                    <p className="font-medium text-[var(--app-text)]">{d.title}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {AGENCY_OPS_DELIVERABLE_STATUSES.filter((s) => s !== status).map((s) => (
                        <button
                          key={s}
                          type="button"
                          className="btn-secondary text-xs"
                          disabled={busy}
                          onClick={() => void move(d.id, s)}
                        >
                          → {s}
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function PipelineBoard() {
  const [grouped, setGrouped] = useState<Record<string, Array<{ id: string; name: string; email: string; status: string }>>>({});

  useEffect(() => {
    void apiGet<{
      all: Array<{ id: string; name: string; email: string; status: string }>;
    }>("/agency/admin/marketing/crm/pipeline")
      .then((res) => {
        const next: Record<string, typeof res.all> = {};
        for (const stage of AGENCY_OPS_PIPELINE_STAGES) {
          const statuses = stage.leadStatuses as readonly string[];
          next[stage.id] = res.all.filter((l) => statuses.includes(l.status));
        }
        const known = new Set<string>(
          AGENCY_OPS_PIPELINE_STAGES.flatMap((s) => [...(s.leadStatuses as readonly string[])])
        );
        next.OTHER = res.all.filter((l) => !known.has(l.status));
        setGrouped(next);
      })
      .catch(() => setGrouped({}));
  }, []);

  return (
    <div className="agency-ops-kanban">
      {AGENCY_OPS_PIPELINE_STAGES.map((stage) => (
        <div key={stage.id} className="agency-ops-kanban__col">
          <h3 className="agency-ops-kanban__title">
            {stage.label}{" "}
            <span className="text-[var(--app-text-muted)]">({grouped[stage.id]?.length ?? 0})</span>
          </h3>
          <ul className="agency-ops-kanban__list">
            {(grouped[stage.id] ?? []).map((l) => (
              <li key={l.id} className="agency-ops-kanban__card">
                <p className="font-medium text-[var(--app-text)]">{l.name}</p>
                <p className="text-xs text-[var(--app-text-muted)]">{l.email}</p>
                <p className="text-xs text-[var(--app-text-muted)]">{l.status}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function AdminAgencyOpsLanePage({
  vertical: verticalProp,
  lane: laneProp
}: {
  vertical?: AgencyOpsVerticalId;
  lane?: AgencyOpsLaneId;
} = {}) {
  const params = useParams<{ vertical?: string; lane?: string; stackId?: string; etapaId?: string }>();
  const rawVertical = verticalProp ?? params.vertical ?? "";
  const rawLane = laneProp ?? params.lane ?? params.stackId ?? params.etapaId ?? "comando";
  const { withProjectQuery } = useAdminProjectScope();

  if (!isAgencyOpsVerticalId(rawVertical) || !isAgencyOpsLaneId(rawLane)) {
    return (
      <AdminProcessChrome title="Agency Ops" description="Rota inválida.">
        <p className="text-sm text-[var(--app-text-muted)]">Vertical ou faixa não reconhecida.</p>
      </AdminProcessChrome>
    );
  }

  const vertical = getAgencyOpsVertical(rawVertical);
  const lane = getAgencyOpsLane(rawLane);

  return (
    <AdminProcessChrome
      title={`${vertical.label} · ${lane.label}`}
      description={lane.purpose}
    >
      <LaneLinks vertical={rawVertical} withProjectQuery={withProjectQuery} />

      {rawLane === "comando" ? (
        <div className="space-y-4">
          <p className="text-sm text-[var(--app-text-muted)]">
            Painel de atenção da vertical — agentes, aprovações e clientes.
          </p>
          <AgencyOsDashboard />
        </div>
      ) : null}

      {rawLane === "pipeline" ? (
        <div className="space-y-3">
          <div className="admin-process__tabs">
            <Link className="admin-process__tab-link" to={withProjectQuery(`${ADMIN}/comercial/captura`)}>
              Captura / CDP
            </Link>
            <Link className="admin-process__tab-link" to={withProjectQuery(`${ADMIN}/comercial/proposta`)}>
              Propostas
            </Link>
          </div>
          <PipelineBoard />
        </div>
      ) : null}

      {rawLane === "entrega" ? <DeliverableBoard vertical={rawVertical} /> : null}

      {rawLane === "propostas" ? (
        <div className="space-y-3">
          <p className="text-sm text-[var(--app-text-muted)]">
            Gere e aprove propostas com agentes — o rascunho entra na fila de aprovação.
          </p>
          <Link className="btn-primary inline-flex" to={withProjectQuery(`${ADMIN}/agentes`)}>
            Abrir Agentes IA
          </Link>
          <AgencyOsDashboard deepDive />
        </div>
      ) : null}

      {rawLane === "portal" ? (
        <div className="space-y-3">
          <p className="text-sm text-[var(--app-text-muted)]">
            Portal do cliente (área logada) — entregas e contratação em /agencia/cliente/contratar.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link className="btn-secondary inline-flex" to={`${AGENCY_APP_BASE}/cliente`}>
              Abrir portal do cliente
            </Link>
            <Link className="btn-secondary inline-flex" to={AGENCY_CLIENT_FUNNEL_PATH}>
              Funil de contratação
            </Link>
          </div>
        </div>
      ) : null}

      {rawLane === "tempo" ? (
        <div className="space-y-2">
          <p className="text-sm text-[var(--app-text-muted)]">
            Tempo e capacidade: registre minutos nos entregáveis na faixa Entrega. Timesheet dedicado em
            evolução.
          </p>
          <Link
            className="btn-secondary inline-flex"
            to={withProjectQuery(`${ADMIN}/${agencyOpsLaneAdminPath(rawVertical, "entrega")}`)}
          >
            Ir para Entrega
          </Link>
        </div>
      ) : null}

      {rawLane === "financas" ? (
        <div className="space-y-3">
          <p className="text-sm text-[var(--app-text-muted)]">
            Pacotes, contrato e checkout do funil — sistema de faturamento nativo em evolução.
          </p>
          <Link className="btn-secondary inline-flex" to={withProjectQuery(`${ADMIN}/comercial/contrato`)}>
            Contrato / checkout
          </Link>
          <Link className="btn-secondary inline-flex" to={withProjectQuery(`${ADMIN}/projetos`)}>
            Projetos e valores
          </Link>
        </div>
      ) : null}

      {rawLane === "inteligencia" ? (
        <div className="space-y-3">
          <Link className="btn-primary inline-flex" to={withProjectQuery(`${ADMIN}/agentes`)}>
            Agentes da agência
          </Link>
          <AgencyOsDashboard deepDive />
        </div>
      ) : null}

      {rawLane === "relatorios" ? (
        <div className="space-y-3">
          <p className="text-sm text-[var(--app-text-muted)]">
            Relatórios da vertical — use setup de marketing e KPIs do Comando.
          </p>
          <Link className="btn-secondary inline-flex" to={withProjectQuery(`${ADMIN}/marketing/integracoes`)}>
            Integrações / readiness
          </Link>
          <Link
            className="btn-secondary inline-flex"
            to={withProjectQuery(`${ADMIN}/${agencyOpsLaneAdminPath(rawVertical, "comando")}`)}
          >
            Voltar ao Comando
          </Link>
        </div>
      ) : null}
    </AdminProcessChrome>
  );
}
