import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation, useParams, useSearchParams } from "react-router-dom";
import {
  findDevelopmentOperationNavContext,
  findMarketingOperationNavContext,
  MARKETING_LEGACY_PATH_ALIASES,
  getMarketingOperationPage,
  launchOperationProgress,
  marketingDevTaskId,
  marketingProductionResolvedItems,
  type MarketingDevStack
} from "@ederson-agencia/shared";
import { ApiError, apiGet } from "../api";
import { getProjectWorkspace, patchProjectWorkspace } from "../api/project-workspace-api";
import { ADMIN_BASE } from "../components/admin/AdminOperationsLayout";
import {
  LaunchOperationPillarBadges,
  LaunchOperationPillarsOverview
} from "../components/admin/LaunchOperationPillars";
import {
  MARKETING_PROJECTION_TARGETS,
  WorkspaceProjectionsPanel
} from "../components/admin/WorkspaceProjectionsPanel";
import type { BrandingWorkspaceData } from "@ederson-agencia/shared";

const STORAGE_KEY = "ederson-agencia.project-workspace.v1";

type ProjectOption = { id: string; title: string };

function readLocalChecked(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { checklist?: Record<string, boolean> };
    return parsed.checklist ?? (parsed as Record<string, boolean>);
  } catch {
    return {};
  }
}

function writeLocalChecked(map: Record<string, boolean>) {
  let fields = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { fields?: Record<string, unknown> };
      fields = parsed.fields ?? {};
    }
  } catch {
    /* ignore */
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ fields, checklist: map }));
}

function devStackProgress(stack: MarketingDevStack, checked: Record<string, boolean>) {
  let done = 0;
  stack.items.forEach((_item, index) => {
    if (checked[marketingDevTaskId(stack.id, index)]) done += 1;
  });
  const total = stack.items.length;
  return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export function AdminMarketingDevPage() {
  const { stackId } = useParams<{ stackId: string }>();
  const location = useLocation();
  const isDevelopmentRoute = location.pathname.includes("/operacao/desenvolvimento/");
  const page = stackId ? getMarketingOperationPage(stackId) : undefined;
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get("project") ?? "";

  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [workspaceFields, setWorkspaceFields] = useState<BrandingWorkspaceData>({});
  const [loadingChecked, setLoadingChecked] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [savingTaskId, setSavingTaskId] = useState<string | null>(null);

  const checklistRows = useMemo(() => {
    if (!page) return [];
    if (page.kind === "dev") {
      return page.stack.items.map((item, index) => ({
        taskId: marketingDevTaskId(page.stack.id, index),
        item
      }));
    }
    return marketingProductionResolvedItems(page.view);
  }, [page]);

  const pageTitle = page?.kind === "dev" ? page.stack.title : page?.view.title ?? "";
  const pageSubtitle = page?.kind === "dev" ? page.stack.subtitle : page?.view.subtitle ?? "";
  const progressLabel =
    page?.kind === "dev" ? page.stack.navLabel : page?.view.navLabel ?? "Marketing";

  useEffect(() => {
    void apiGet<{ projects: ProjectOption[] }>("/agency/projects").then((res) =>
      setProjects(res.projects.map((p) => ({ id: p.id, title: p.title })))
    );
  }, []);

  useEffect(() => {
    if (projectId) {
      setLoadingChecked(true);
      void getProjectWorkspace(projectId)
        .then((res) => {
          setChecked(res.workspace.checklist);
          setWorkspaceFields(res.workspace.fields);
        })
        .catch((err) => {
          setChecked({});
          setSyncError(err instanceof ApiError ? err.message : "Erro ao carregar checklist.");
        })
        .finally(() => setLoadingChecked(false));
      return;
    }
    setChecked(readLocalChecked());
  }, [projectId, stackId]);

  const persistMode = projectId ? "project" : "local";

  const toggle = useCallback(
    (taskId: string, value: boolean) => {
      setChecked((prev) => {
        const next = { ...prev, [taskId]: value };
        if (!value) delete next[taskId];
        if (persistMode === "local") writeLocalChecked(next);
        return next;
      });
      if (persistMode === "project") {
        setSavingTaskId(taskId);
        void patchProjectWorkspace(projectId, { taskId, done: value })
          .then((res) => setChecked(res.checked ?? {}))
          .catch((err) => setSyncError(err instanceof ApiError ? err.message : "Falha ao salvar."))
          .finally(() => setSavingTaskId(null));
      }
    },
    [persistMode, projectId]
  );

  const progress = useMemo(() => {
    let done = 0;
    for (const row of checklistRows) {
      if (checked[row.taskId]) done += 1;
    }
    const total = checklistRows.length;
    return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
  }, [checklistRows, checked]);

  const overall = useMemo(() => launchOperationProgress(checked), [checked]);

  function onProjectChange(nextId: string) {
    const next = new URLSearchParams(searchParams);
    if (nextId) next.set("project", nextId);
    else next.delete("project");
    setSearchParams(next, { replace: true });
  }

  if (!stackId || !page) {
    const q = projectId ? `?project=${encodeURIComponent(projectId)}` : "";
    const fallback = isDevelopmentRoute
      ? `${ADMIN_BASE}/operacao/desenvolvimento/estatistica${q}`
      : `${ADMIN_BASE}/operacao/marketing/estatistica${q}`;
    return <Navigate to={fallback} replace />;
  }

  const stackPath = isDevelopmentRoute
    ? `operacao/desenvolvimento/${stackId}`
    : `operacao/marketing/${stackId}`;
  const devCtx = findDevelopmentOperationNavContext(stackPath);
  const marketingCtx =
    findMarketingOperationNavContext(stackPath) ??
    findMarketingOperationNavContext(MARKETING_LEGACY_PATH_ALIASES[stackPath] ?? stackPath);
  const headAccent = devCtx
    ? "text-sky-600 dark:text-sky-300"
    : marketingCtx
      ? "text-rose-600 dark:text-rose-300"
      : "text-sky-600 dark:text-sky-300";

  const projectQ = projectId ? `?project=${encodeURIComponent(projectId)}` : "";

  const stackChoicePath =
    page.kind === "dev" && stackId
      ? ({
          "front-end": "operacao/desenvolvimento/stack-front-end",
          "back-end": "operacao/desenvolvimento/stack-back-end",
          "banco-de-dados": "operacao/desenvolvimento/stack-dados"
        }[stackId] ?? null)
      : null;

  return (
    <div className="space-y-6">
      {stackChoicePath && projectId ? (
        <p className="panel border-sky-500/30 bg-sky-500/5 px-4 py-3 text-sm text-[var(--app-text-muted)]">
          Defina a stack antes do checklist:{" "}
          <Link to={`${ADMIN_BASE}/${stackChoicePath}${projectQ}`} className="font-medium text-sky-700 hover:underline dark:text-sky-200">
            escolher tecnologias →
          </Link>
        </p>
      ) : null}
      <header className="agency-admin-page-head">
        <p className={`text-xs font-semibold uppercase tracking-wide ${headAccent}`}>
          {devCtx ? (
            <>
              {devCtx.pillarLabel} · {devCtx.sectionLabel} · {devCtx.itemLabel}
            </>
          ) : marketingCtx ? (
            <>
              {marketingCtx.pillarLabel} · {marketingCtx.sectionLabel} · {marketingCtx.itemLabel}
            </>
          ) : page.kind === "dev" ? (
            "Desenvolvimento"
          ) : (
            "Marketing"
          )}
        </p>
        <h1>{pageTitle}</h1>
        <p>{pageSubtitle}</p>
      </header>

      <LaunchOperationPillarsOverview checked={checked} compact />

      {projectId ? (
        <WorkspaceProjectionsPanel
          fields={workspaceFields}
          title="Dados para captação & checkout"
          targetIds={[...MARKETING_PROJECTION_TARGETS]}
          compact
        />
      ) : null}

      <div className="panel space-y-3 p-4 sm:p-5">
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-[var(--app-text)]">Projeto</span>
          <select className="input w-full max-w-xl" value={projectId} onChange={(e) => onProjectChange(e.target.value)}>
            <option value="">Rascunho local</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        {projectId ? (
          <p className="text-xs text-[var(--app-text-muted)]">
            Lançamento (todos os pilares): {overall.done}/{overall.total} ({overall.percent}%)
          </p>
        ) : null}
        {syncError ? <p className="text-sm text-red-500">{syncError}</p> : null}
      </div>

      <div className="panel p-4 sm:p-5">
        <p className="text-sm text-[var(--app-text-muted)]">
          Checklist {progressLabel}:{" "}
          <strong className="text-[var(--app-text)]">
            {progress.done}/{progress.total}
          </strong>{" "}
          ({progress.percent}%)
        </p>
      </div>

      <section className="panel p-4 sm:p-5">
        <ul className="space-y-2">
          {checklistRows.map(({ taskId, item }) => {
            const isChecked = Boolean(checked[taskId]);
            return (
              <li key={taskId}>
                <label className="agency-op-check flex cursor-pointer gap-3 rounded-lg px-2 py-2 hover:bg-[var(--app-hover)]/40">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-sky-600"
                    checked={isChecked}
                    disabled={loadingChecked || savingTaskId === taskId}
                    onChange={(e) => toggle(taskId, e.target.checked)}
                  />
                  <span className="min-w-0 flex-1 space-y-1.5">
                    <span
                      className={`block text-sm ${isChecked ? "line-through text-[var(--app-text-muted)]" : "text-[var(--app-text)]"}`}
                    >
                      {item.text}
                    </span>
                    <LaunchOperationPillarBadges ids={item.pillars} />
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      {page.kind === "production" && page.view.id === "conteudo-seo" ? (
        <p className="text-sm">
          <Link to={`${ADMIN_BASE}/operacao/fase-2${projectQ}`} className="text-brand-primary hover:underline">
            Ver fase completa de Branding (Identidade) →
          </Link>
        </p>
      ) : null}
      {page.kind === "production" && page.view.id === "captacao-trafego" ? (
        <p className="text-sm">
          <Link to={`${ADMIN_BASE}/operacao/fase-3${projectQ}`} className="text-brand-primary hover:underline">
            Ver Fase 3 FL completa (Infra PPL) →
          </Link>
        </p>
      ) : null}
      {page.kind === "dev" ? (
        <p className="text-sm">
          <Link to={`${ADMIN_BASE}/operacao/fase-3${projectQ}`} className="text-brand-primary hover:underline">
            Ver também Fase 3 — Infra PPL (captação e automação) →
          </Link>
        </p>
      ) : null}
    </div>
  );
}
