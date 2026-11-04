import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  findOperationNavByAdminPath,
  operationPhaseNavLabel,
  PRODUCT_OFFER_FIELDS,
  productOfferProgress,
  productOfferSnapshot,
  type BrandingFieldValue,
  type BrandingWorkspaceData
} from "@ederson-agencia/shared";
import { ApiError, apiGet } from "../api";
import { getProjectWorkspace, patchProjectWorkspace } from "../api/project-workspace-api";
import { ADMIN_BASE } from "../components/admin/AdminOperationsLayout";
import { BrandingFieldEditor } from "../components/admin/BrandingFieldEditor";
import { WorkspaceProjectionsPanel } from "../components/admin/WorkspaceProjectionsPanel";

type ProjectOption = { id: string; title: string };

type IntegrationInfo = {
  ingressToken: string;
  webhooks: Record<string, string>;
};

type ExternalEvent = {
  id: string;
  provider: string;
  eventType: string;
  createdAt: string;
};

export function AdminProductOfferPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get("project") ?? "";
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [fields, setFields] = useState<BrandingWorkspaceData>({});
  const [integrations, setIntegrations] = useState<IntegrationInfo | null>(null);
  const [events, setEvents] = useState<ExternalEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [savingField, setSavingField] = useState<string | null>(null);

  const navCtx = findOperationNavByAdminPath("operacao/produto-oferta");
  const progress = useMemo(() => productOfferProgress(fields), [fields]);
  const snapshot = useMemo(() => productOfferSnapshot(fields), [fields]);

  useEffect(() => {
    void apiGet<{ projects: ProjectOption[] }>("/agency/projects").then((res) =>
      setProjects(res.projects.map((p) => ({ id: p.id, title: p.title })))
    );
  }, []);

  const loadProject = useCallback(async (id: string) => {
    setLoading(true);
    setSyncError(null);
    try {
      const [ws, int, ev] = await Promise.all([
        getProjectWorkspace(id),
        apiGet<{ ingressToken: string; webhooks: Record<string, string> }>(`/agency/projects/${id}/integrations`),
        apiGet<{ events: ExternalEvent[] }>(`/agency/projects/${id}/external-events?limit=8`).catch(() => ({
          events: [] as ExternalEvent[]
        }))
      ]);
      setFields(ws.workspace.fields);
      setIntegrations({ ingressToken: int.ingressToken, webhooks: int.webhooks });
      setEvents(ev.events);
    } catch (err) {
      setSyncError(err instanceof ApiError ? err.message : "Erro ao carregar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (projectId) void loadProject(projectId);
    else {
      setFields({});
      setIntegrations(null);
      setEvents([]);
    }
  }, [projectId, loadProject]);

  function onProjectChange(nextId: string) {
    const next = new URLSearchParams(searchParams);
    if (nextId) next.set("project", nextId);
    else next.delete("project");
    setSearchParams(next, { replace: true });
  }

  const setField = useCallback(
    (fieldId: string, value: BrandingFieldValue | null) => {
      if (!projectId) return;
      setFields((prev) => {
        const next = { ...prev };
        if (value === null) delete next[fieldId];
        else next[fieldId] = value;
        return next;
      });
      setSavingField(fieldId);
      void patchProjectWorkspace(projectId, { fieldId, value })
        .then((res) => {
          if (res.workspace?.fields) setFields(res.workspace.fields);
          else if (res.data) setFields(res.data);
        })
        .catch((err) => setSyncError(err instanceof ApiError ? err.message : "Falha ao salvar."))
        .finally(() => setSavingField(null));
    },
    [projectId]
  );

  return (
    <div className="space-y-6">
      <header className="agency-admin-page-head">
        <p className="text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-300">
          {navCtx ? (
            <>
              {navCtx.pillar.pillarLabel} · {operationPhaseNavLabel(navCtx.phase)}
            </>
          ) : (
            "Marketing"
          )}
        </p>
        <h1>Produto & checkout</h1>
        <p>
          Oferta estilo Hotmart / Kiwify / Monetizze — sincronizada com Branding, copy de lançamento e webhooks de
          venda.
        </p>
      </header>

      <div className="panel space-y-3 p-4 sm:p-5">
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-[var(--app-text)]">Projeto / cliente</span>
          <select className="input w-full max-w-xl" value={projectId} onChange={(e) => onProjectChange(e.target.value)}>
            <option value="">Selecione um projeto…</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        {projectId ? (
          <p className="text-xs text-[var(--app-text-muted)]">
            Oferta:{" "}
            <strong className="text-[var(--app-text)]">
              {progress.done}/{progress.total}
            </strong>{" "}
            ({progress.percent}%)
          </p>
        ) : null}
        {loading ? <p className="text-xs text-[var(--app-text-muted)]">Carregando…</p> : null}
        {syncError ? <p className="text-sm text-red-500">{syncError}</p> : null}
      </div>

      {!projectId ? (
        <p className="text-sm text-[var(--app-text-muted)]">
          Selecione um projeto para editar produto, checkout e integrações.
        </p>
      ) : (
        <>
          {snapshot.nome || snapshot.promessa ? (
            <div className="panel p-4 text-sm">
              <p className="font-semibold text-[var(--app-text)]">{snapshot.nome ?? "Produto sem nome"}</p>
              {snapshot.promessa ? <p className="mt-1 text-[var(--app-text-muted)]">{snapshot.promessa}</p> : null}
              {snapshot.precoBrl ? <p className="mt-2 text-[var(--app-text)]">R$ {snapshot.precoBrl}</p> : null}
            </div>
          ) : null}

          <WorkspaceProjectionsPanel fields={fields} title="Projeções para Marketing & FL" compact />

          <section className="panel space-y-4 p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-[var(--app-text)]">Dados do produto e oferta</h2>
            {PRODUCT_OFFER_FIELDS.map((field) => (
              <div key={field.id} className="agency-branding-field-block">
                <div className="mb-2 flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold text-[var(--app-text)]">{field.label}</h3>
                  {savingField === field.id ? (
                    <span className="text-xs text-[var(--app-text-muted)]">Salvando…</span>
                  ) : null}
                </div>
                {field.description ? (
                  <p className="mb-2 text-xs text-[var(--app-text-muted)]">{field.description}</p>
                ) : null}
                <BrandingFieldEditor
                  field={field}
                  value={fields[field.id]}
                  projectId={projectId}
                  disabled={loading}
                  onChange={(value) => setField(field.id, value)}
                />
              </div>
            ))}
          </section>

          {integrations ? (
            <section className="panel space-y-3 p-4 sm:p-5">
              <h2 className="text-lg font-semibold text-[var(--app-text)]">Webhooks (ingress)</h2>
              <p className="text-xs text-[var(--app-text-muted)]">
                Configure no painel Hotmart, Kiwify, Monetizze ou Leadlovers. Eventos ficam registrados no projeto.
              </p>
              <ul className="space-y-2 font-mono text-xs break-all">
                {Object.entries(integrations.webhooks).map(([provider, url]) => (
                  <li key={provider} className="rounded-lg bg-[var(--app-hover)] px-3 py-2">
                    <span className="font-sans font-semibold text-[var(--app-text)]">{provider}: </span>
                    {url}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {events.length > 0 ? (
            <section className="panel space-y-2 p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-[var(--app-text)]">Eventos recentes</h2>
              <ul className="divide-y divide-[var(--app-border)] text-sm">
                {events.map((ev) => (
                  <li key={ev.id} className="flex flex-wrap justify-between gap-2 py-2">
                    <span>
                      <strong>{ev.provider}</strong> · {ev.eventType}
                    </span>
                    <span className="text-xs text-[var(--app-text-muted)]">
                      {new Date(ev.createdAt).toLocaleString("pt-BR")}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}

      <p className="text-sm">
        <Link
          to={`${ADMIN_BASE}/operacao/fase-4${projectId ? `?project=${encodeURIComponent(projectId)}` : ""}`}
          className="text-brand-primary hover:underline"
        >
          Ir para Fórmula — Pré-lançamento (PL) →
        </Link>
      </p>
    </div>
  );
}
