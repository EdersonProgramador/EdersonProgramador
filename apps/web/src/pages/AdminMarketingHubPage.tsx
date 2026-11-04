import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import {
  buildLeadloversBlueprint,
  findMarketingOperationNavContext,
  MARKETING_OPERATION_NAV,
  projectWorkspaceSummary,
  type BrandingWorkspaceData,
  type MarketingNavItem
} from "@ederson-agencia/shared";
import { ApiError, apiGet, apiPost } from "../api";
import { getProjectWorkspace } from "../api/project-workspace-api";
import { ADMIN_BASE } from "../components/admin/AdminOperationsLayout";
import { WorkspaceProjectionsPanel } from "../components/admin/WorkspaceProjectionsPanel";

type ProjectOption = { id: string; title: string };

type ExternalEvent = { id: string; provider: string; eventType: string; createdAt: string };

function hubViewFromPath(pathname: string): string | null {
  const marker = "/admin/operacao/marketing/";
  const idx = pathname.indexOf(marker);
  if (idx === -1) return null;
  return pathname.slice(idx + marker.length).split("/")[0] ?? null;
}

export function AdminMarketingHubPage() {
  const location = useLocation();
  const view = hubViewFromPath(location.pathname);
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get("project") ?? "";

  const navItem = view
    ? MARKETING_NAV_ITEM(view)
    : null;

  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [fields, setFields] = useState<BrandingWorkspaceData>({});
  const [summary, setSummary] = useState<ReturnType<typeof projectWorkspaceSummary> | null>(null);
  const [events, setEvents] = useState<ExternalEvent[]>([]);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const adminPath = view ? `operacao/marketing/${view}` : "";
  const navCtx = adminPath ? findMarketingOperationNavContext(adminPath) : null;

  useEffect(() => {
    void apiGet<{ projects: ProjectOption[] }>("/agency/projects").then((res) =>
      setProjects(res.projects.map((p) => ({ id: p.id, title: p.title })))
    );
  }, []);

  const load = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const ws = await getProjectWorkspace(id);
      setFields(ws.workspace.fields);
      setSummary(ws.summary);
      if (view === "historico") {
        const ev = await apiGet<{ events: ExternalEvent[] }>(`/agency/projects/${id}/external-events?limit=20`);
        setEvents(ev.events);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao carregar.");
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    if (projectId) void load(projectId);
    else {
      setFields({});
      setSummary(null);
      setEvents([]);
    }
  }, [projectId, load]);

  const blueprint = useMemo(() => buildLeadloversBlueprint(fields), [fields]);

  function onProjectChange(nextId: string) {
    const next = new URLSearchParams(searchParams);
    if (nextId) next.set("project", nextId);
    else next.delete("project");
    setSearchParams(next, { replace: true });
  }

  if (view === "formularios") {
    const q = projectId ? `?project=${encodeURIComponent(projectId)}` : "";
    return <Navigate to={`${ADMIN_BASE}/operacao/marketing/conteudo-seo${q}`} replace />;
  }

  if (view === "ajustes") {
    const q = projectId ? `?project=${encodeURIComponent(projectId)}` : "";
    return <Navigate to={`${ADMIN_BASE}/operacao/produto-oferta${q}`} replace />;
  }

  if (!view || !navItem) {
    const q = projectId ? `?project=${encodeURIComponent(projectId)}` : "";
    return <Navigate to={`${ADMIN_BASE}/operacao/marketing/estatistica${q}`} replace />;
  }

  async function publishLp() {
    if (!projectId) return;
    try {
      const res = await apiPost<{ publicUrl: string }>(`/agency/projects/${projectId}/launch-page/publish`, {});
      setPublicUrl(res.publicUrl);
      setMessage(`LP publicada: ${res.publicUrl}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao publicar.");
    }
  }

  async function syncLeadlovers() {
    if (!projectId) return;
    try {
      const res = await apiPost<{ mode: string; message?: string }>(`/agency/projects/${projectId}/sync/leadlovers`, {});
      setMessage(res.message ?? res.mode);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha no sync.");
    }
  }

  return (
    <div className="space-y-6">
      <header className="agency-admin-page-head">
        <p className="text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-300">
          {navCtx ? (
            <>
              {navCtx.pillarLabel} · {navCtx.sectionLabel} · {navCtx.itemLabel}
            </>
          ) : (
            "Marketing"
          )}
        </p>
        <h1>{navItem.label}</h1>
        <p>{navItem.description}</p>
      </header>

      <div className="panel space-y-3 p-4 sm:p-5">
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-[var(--app-text)]">Projeto</span>
          <select className="input w-full max-w-xl" value={projectId} onChange={(e) => onProjectChange(e.target.value)}>
            <option value="">Selecione um projeto…</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        {loading ? <p className="text-xs text-[var(--app-text-muted)]">Carregando…</p> : null}
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      </div>

      {!projectId ? (
        <p className="text-sm text-[var(--app-text-muted)]">Selecione um projeto para usar o módulo de Marketing.</p>
      ) : null}

      {projectId && view === "estatistica" && summary ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                ["marketing", "Marketing"],
                ["branding", "Branding (feeds)"],
                ["development", "Dev (checklist)"],
                ["formula", "Fórmula L."]
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="panel p-4">
                <p className="text-xs text-[var(--app-text-muted)]">{label}</p>
                <p className="text-2xl font-bold text-[var(--app-text)]">{summary[key].percent}%</p>
                <p className="text-xs text-[var(--app-text-subtle)]">
                  {summary[key].done}/{summary[key].total}
                </p>
              </div>
            ))}
          </div>
          <WorkspaceProjectionsPanel fields={fields} title="Projeções ativas" />
        </>
      ) : null}

      {projectId && (view === "sequencia" || view === "automacoes") ? (
        <section className="panel space-y-3 p-4 sm:p-5">
          <h2 className="text-lg font-semibold">Blueprint Leadlovers</h2>
          <p className="text-sm text-[var(--app-text-muted)]">Tags: {blueprint.tags.join(", ")}</p>
          <ul className="space-y-3">
            {blueprint.sequences.map((seq) => (
              <li key={seq.id} className="rounded-lg border border-[var(--app-border)] p-3 text-sm">
                <strong>{seq.name}</strong>
                <span className="text-[var(--app-text-muted)]"> — {seq.trigger}</span>
                <ul className="mt-2 list-disc pl-5 text-[var(--app-text-muted)]">
                  {seq.emails.map((em, i) => (
                    <li key={i}>
                      {em.subject}: {em.bodyPreview.slice(0, 120)}…
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <button type="button" className="btn-secondary text-sm" onClick={() => void syncLeadlovers()}>
            Sync Leadlovers
          </button>
          <Link
            className="btn-ghost text-sm"
            to={`${ADMIN_BASE}/operacao/marketing/captacao-trafego?project=${encodeURIComponent(projectId)}`}
          >
            Checklist captação & tráfego →
          </Link>
        </section>
      ) : null}

      {projectId && view === "historico" ? (
        <section className="panel p-4 sm:p-5">
          <h2 className="mb-3 text-lg font-semibold">Eventos</h2>
          {events.length === 0 ? (
            <p className="text-sm text-[var(--app-text-muted)]">Nenhum webhook recebido ainda.</p>
          ) : (
            <ul className="divide-y divide-[var(--app-border)] text-sm">
              {events.map((ev) => (
                <li key={ev.id} className="flex justify-between gap-2 py-2">
                  <span>
                    <strong>{ev.provider}</strong> · {ev.eventType}
                  </span>
                  <span className="text-xs text-[var(--app-text-muted)]">
                    {new Date(ev.createdAt).toLocaleString("pt-BR")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {projectId && view === "paginas" ? (
        <section className="panel space-y-3 p-4 sm:p-5">
          <h2 className="text-lg font-semibold">Páginas de captação</h2>
          <button type="button" className="btn-primary text-sm" onClick={() => void publishLp()}>
            Publicar LP
          </button>
          {publicUrl ? (
            <a href={publicUrl} className="text-sm text-brand-primary hover:underline" target="_blank" rel="noreferrer">
              {publicUrl}
            </a>
          ) : null}
          <Link
            className="btn-secondary inline-flex text-sm"
            to={`${ADMIN_BASE}/operacao/launch-kit?project=${encodeURIComponent(projectId)}`}
          >
            Kit LP & e-mail (templates)
          </Link>
        </section>
      ) : null}

      {projectId && view === "popups" ? (
        <section className="panel space-y-4 p-4 sm:p-5 text-sm">
          <p className="text-[var(--app-text-muted)]">
            Overlays de captação (exit intent, barra fixa, modal de isca) devem respeitar a identidade do projeto e
            apontar para a mesma lista da LP publicada.
          </p>
          <ol className="list-decimal space-y-2 pl-5 text-[var(--app-text)]">
            <li>Defina isca e copy no branding / produto (promessa alinhada ao avatar).</li>
            <li>Publique ou valide a LP em Páginas — pop-up usa o mesmo formulário ou tag de lead.</li>
            <li>Ative remarketing e pixels no checklist de captação (Fase 3 / Automações).</li>
            <li>Teste mobile: exit intent costuma ser desktop; use barra inferior no celular.</li>
          </ol>
          <div className="flex flex-wrap gap-2">
            <Link
              className="btn-secondary inline-flex text-sm"
              to={`${ADMIN_BASE}/operacao/marketing/paginas?project=${encodeURIComponent(projectId)}`}
            >
              Páginas & LP
            </Link>
            <Link
              className="btn-secondary inline-flex text-sm"
              to={`${ADMIN_BASE}/operacao/marketing/captacao-trafego?project=${encodeURIComponent(projectId)}`}
            >
              Captação & tráfego
            </Link>
            <Link
              className="btn-ghost inline-flex text-sm"
              to={`${ADMIN_BASE}/operacao/desenvolvimento/front-end?project=${encodeURIComponent(projectId)}`}
            >
              Checklist front-end
            </Link>
          </div>
        </section>
      ) : null}

      {projectId && view === "contatos" ? (
        <section className="panel p-4 sm:p-5">
          <p className="text-sm text-[var(--app-text-muted)]">Leads de LP, funil e operação comercial.</p>
          <Link className="btn-primary mt-3 inline-flex text-sm" to={`${ADMIN_BASE}/leads`}>
            Abrir Leads
          </Link>
        </section>
      ) : null}

      {projectId && view === "contas-envio" ? (
        <section className="panel p-4 sm:p-5">
          <p className="text-sm text-[var(--app-text-muted)]">
            Resend (MAIL_FROM), webhooks e tokens — configure no Kit LP ou em Produto & checkout.
          </p>
          <Link
            className="btn-secondary mt-3 inline-flex text-sm"
            to={`${ADMIN_BASE}/operacao/launch-kit?project=${encodeURIComponent(projectId)}`}
          >
            Integrações & envio →
          </Link>
        </section>
      ) : null}
    </div>
  );
}

function MARKETING_NAV_ITEM(view: string): MarketingNavItem | null {
  for (const section of MARKETING_OPERATION_NAV) {
    const item = section.items.find((i) => i.id === view);
    if (item) return item;
  }
  return null;
}
