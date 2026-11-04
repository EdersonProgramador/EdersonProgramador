import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import {
  adjacentLaunchOperationPhase,
  findDevelopmentOperationNavContext,
  findFormulaOperationNavContext,
  getLaunchOperationPhase,
  LAUNCH_OPERATION_PILLARS,
  launchOperationPhaseProgress,
  launchOperationProgress,
  launchOperationTaskId,
  type LaunchOperationPhase
} from "@ederson-agencia/shared";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ApiError, apiGet } from "../api";
import { getProjectWorkspace, patchProjectWorkspace } from "../api/project-workspace-api";
import { ADMIN_BASE } from "../components/admin/AdminOperationsLayout";
import {
  LaunchOperationPhasePillarFocus,
  LaunchOperationPillarBadges,
  LaunchOperationPillarsOverview
} from "../components/admin/LaunchOperationPillars";
import {
  LAUNCH_PROJECTION_TARGETS,
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
    if (parsed.checklist) return parsed.checklist;
    return parsed as Record<string, boolean>;
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

export function AdminLaunchPhasePage() {
  const { phaseId } = useParams<{ phaseId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get("project") ?? "";

  const phase = phaseId ? getLaunchOperationPhase(phaseId) : undefined;
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [workspaceFields, setWorkspaceFields] = useState<BrandingWorkspaceData>({});
  const [loadingChecked, setLoadingChecked] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [savingTaskId, setSavingTaskId] = useState<string | null>(null);

  useEffect(() => {
    void apiGet<{ projects: ProjectOption[] }>("/agency/projects").then((res) =>
      setProjects(res.projects.map((p) => ({ id: p.id, title: p.title })))
    );
  }, []);

  useEffect(() => {
    if (projectId) {
      setLoadingChecked(true);
      setSyncError(null);
      void getProjectWorkspace(projectId)
        .then((res) => {
          setChecked(res.workspace.checklist);
          setWorkspaceFields(res.workspace.fields);
        })
        .catch((err) => {
          setChecked({});
          setSyncError(err instanceof ApiError ? err.message : "Não foi possível carregar o checklist do projeto.");
        })
        .finally(() => setLoadingChecked(false));
      return;
    }
    setChecked(readLocalChecked());
    setSyncError(null);
  }, [projectId, phaseId]);

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
        setSyncError(null);
        void patchProjectWorkspace(projectId, { taskId, done: value })
          .then((res) => setChecked(res.checked ?? {}))
          .catch((err) => {
            setSyncError(err instanceof ApiError ? err.message : "Falha ao salvar no projeto.");
          })
          .finally(() => setSavingTaskId(null));
      }
    },
    [persistMode, projectId]
  );

  const phaseProgress = useMemo(
    () => (phase ? launchOperationPhaseProgress(phase, checked) : { total: 0, done: 0, percent: 0 }),
    [phase, checked]
  );

  const overallProgress = useMemo(() => launchOperationProgress(checked), [checked]);

  function adminPathHref(adminPath: string) {
    const q = projectId ? `?project=${encodeURIComponent(projectId)}` : "";
    return `${ADMIN_BASE}/${adminPath}${q}`;
  }

  function onProjectChange(nextId: string) {
    const next = new URLSearchParams(searchParams);
    if (nextId) next.set("project", nextId);
    else next.delete("project");
    setSearchParams(next, { replace: true });
  }

  if (!phaseId || !phase) {
    const q = projectId ? `?project=${encodeURIComponent(projectId)}` : "";
    return <Navigate to={`${ADMIN_BASE}/operacao/fase-1${q}`} replace />;
  }

  const currentAdminPath = `operacao/${phaseId}`;
  const formulaCtx = findFormulaOperationNavContext(currentAdminPath);
  const devCtx = findDevelopmentOperationNavContext(currentAdminPath);
  const prevPhase = adjacentLaunchOperationPhase(phaseId, "prev");
  const nextPhase = adjacentLaunchOperationPhase(phaseId, "next");

  return (
    <div className="space-y-6">
      <header className="agency-admin-page-head">
        <p
          className={`text-xs font-semibold uppercase tracking-wide ${
            formulaCtx
              ? "text-amber-700 dark:text-amber-200"
              : devCtx
                ? "text-sky-600 dark:text-sky-300"
                : "text-[var(--app-text-muted)]"
          }`}
        >
          {formulaCtx ? (
            <>
              {formulaCtx.pillarLabel} · {formulaCtx.sectionLabel} · {formulaCtx.itemLabel}
            </>
          ) : devCtx ? (
            <>
              {devCtx.pillarLabel} · {devCtx.sectionLabel} · {devCtx.itemLabel}
            </>
          ) : (
            "Operação · Fórmula de Lançamento"
          )}
        </p>
        <h1>
          <span className="mr-2" aria-hidden>
            {phase.emoji}
          </span>
          {phase.title}
        </h1>
        <p>{phase.subtitle}</p>
      </header>

      <LaunchOperationPillarsOverview checked={checked} />

      {projectId ? (
        <WorkspaceProjectionsPanel
          fields={workspaceFields}
          title="Copy do lançamento (sincronizada)"
          targetIds={[...LAUNCH_PROJECTION_TARGETS]}
          compact
        />
      ) : null}

      <LaunchOperationPhasePillarFocus phase={phase} />

      <div className="panel space-y-3 p-4 sm:p-5">
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-[var(--app-text)]">Projeto (checklist salvo na nuvem)</span>
          <select
            className="input w-full max-w-xl"
            value={projectId}
            onChange={(e) => onProjectChange(e.target.value)}
          >
            <option value="">Modo rascunho — só neste navegador</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        {projectId ? (
          <p className="text-xs text-[var(--app-text-muted)]">
            Progresso geral do lançamento:{" "}
            <strong className="text-[var(--app-text)]">
              {overallProgress.done}/{overallProgress.total} ({overallProgress.percent}%)
            </strong>
          </p>
        ) : (
          <p className="text-xs text-[var(--app-text-muted)]">
            Selecione um projeto para registrar o checklist no banco (visível para toda a equipe admin).
          </p>
        )}
        {syncError ? <p className="text-sm text-red-500">{syncError}</p> : null}
        {loadingChecked ? <p className="text-xs text-[var(--app-text-muted)]">Carregando checklist…</p> : null}
      </div>

      <div className="panel p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="text-[var(--app-text-muted)]">
            Checklist desta fase:{" "}
            <strong className="text-[var(--app-text)]">
              {phaseProgress.done}/{phaseProgress.total}
            </strong>{" "}
            ({phaseProgress.percent}%)
            {savingTaskId ? <span className="ml-2 text-xs">Salvando…</span> : null}
          </span>
          <div className="h-2 min-w-[8rem] flex-1 max-w-xs overflow-hidden rounded-full bg-[var(--app-hover)]">
            <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${phaseProgress.percent}%` }} />
          </div>
        </div>
      </div>

      <PhaseChecklist phase={phase} checked={checked} disabled={loadingChecked} savingTaskId={savingTaskId} onToggle={toggle} />

      {phase.relatedAdminPaths && phase.relatedAdminPaths.length > 0 ? (
        <div className="panel p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-[var(--app-text)]">Atalhos no portal</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {phase.relatedAdminPaths.map((link) => (
              <li key={link.pathSuffix}>
                <Link to={`${ADMIN_BASE}/${link.pathSuffix}`} className="btn-secondary inline-flex text-xs sm:text-sm">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <nav className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--app-border)] pt-4">
        {prevPhase ? (
          <Link to={adminPathHref(`operacao/${prevPhase.id}`)} className="btn-secondary inline-flex items-center gap-1 text-sm">
            <ChevronLeft className="h-4 w-4" aria-hidden />
            {prevPhase.navLabel}
          </Link>
        ) : (
          <Link to={`${ADMIN_BASE}/projetos`} className="text-sm text-brand-primary hover:underline">
            ← Projetos
          </Link>
        )}
        {nextPhase ? (
          <Link to={adminPathHref(`operacao/${nextPhase.id}`)} className="btn-primary inline-flex items-center gap-1 text-sm">
            {nextPhase.navLabel}
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : (
          <span className="text-sm text-[var(--app-text-muted)]">Última fase da jornada FL</span>
        )}
      </nav>
    </div>
  );
}

function PhaseChecklist({
  phase,
  checked,
  disabled,
  savingTaskId,
  onToggle
}: {
  phase: LaunchOperationPhase;
  checked: Record<string, boolean>;
  disabled: boolean;
  savingTaskId: string | null;
  onToggle: (taskId: string, value: boolean) => void;
}) {
  return (
    <div className="space-y-5">
      {phase.sections.map((section, sectionIndex) => (
        <section key={section.heading} className="panel p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h2 className="text-base font-semibold text-[var(--app-text)]">{section.heading}</h2>
            <span className="text-xs text-[var(--app-text-muted)]">
              Pilar líder:{" "}
              <strong className="text-[var(--app-text)]">
                {LAUNCH_OPERATION_PILLARS[section.primaryPillar].shortLabel}
              </strong>
            </span>
          </div>
          <ul className="mt-3 space-y-2">
            {section.items.map((item, itemIndex) => {
              const taskId = launchOperationTaskId(phase.id, sectionIndex, itemIndex);
              const isChecked = Boolean(checked[taskId]);
              const isSaving = savingTaskId === taskId;
              return (
                <li key={taskId}>
                  <label className="agency-op-check flex cursor-pointer gap-3 rounded-lg border border-transparent px-2 py-2 hover:border-[var(--app-border)] hover:bg-[var(--app-hover)]/40">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 shrink-0 accent-sky-600"
                      checked={isChecked}
                      disabled={disabled || isSaving}
                      onChange={(e) => onToggle(taskId, e.target.checked)}
                    />
                    <span className="min-w-0 flex-1 space-y-1.5">
                      <span
                        className={`block text-sm leading-relaxed ${isChecked ? "text-[var(--app-text-muted)] line-through" : "text-[var(--app-text)]"}`}
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
      ))}
    </div>
  );
}
