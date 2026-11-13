import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { AGENCY_APP_BASE, findMarketingOperationNavContext } from "@ederson-agencia/shared";
import { ApiError, apiGet } from "../../api";
import { getProjectWorkspace } from "../../api/project-workspace-api";
import {
  WorkspaceProjectionsPanel,
  MARKETING_PROJECTION_TARGETS
} from "./WorkspaceProjectionsPanel";
import type { BrandingWorkspaceData } from "@ederson-agencia/shared";

type ProjectOption = { id: string; title: string };

export function useAdminProjectScope() {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get("project")?.trim() ?? "";
  const projectQuery = useMemo(
    () => (projectId ? `?project=${encodeURIComponent(projectId)}` : ""),
    [projectId]
  );

  function onProjectChange(nextId: string) {
    const next = new URLSearchParams(searchParams);
    if (nextId) next.set("project", nextId);
    else next.delete("project");
    setSearchParams(next, { replace: true });
  }

  function withProjectQuery(path: string) {
    if (!projectQuery) return path;
    return path.includes("?") ? `${path}&project=${encodeURIComponent(projectId)}` : `${path}${projectQuery}`;
  }

  return { projectId, projectQuery, onProjectChange, withProjectQuery };
}

export function AdminProjectScopeBar({
  projectId,
  onProjectChange,
  loading,
  error
}: {
  projectId: string;
  onProjectChange: (id: string) => void;
  loading?: boolean;
  error?: string | null;
}) {
  const [projects, setProjects] = useState<ProjectOption[]>([]);

  useEffect(() => {
    void apiGet<{ projects: { id: string; title: string }[] }>("/agency/projects").then((res) =>
      setProjects(res.projects.map((p) => ({ id: p.id, title: p.title })))
    );
  }, []);

  return (
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
      {loading ? <p className="text-xs text-[var(--app-text-muted)]">Carregando workspace…</p> : null}
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
}

function marketingAdminPathFromLocation(pathname: string): string {
  const marker = `${AGENCY_APP_BASE}/admin/`;
  const idx = pathname.indexOf(marker);
  if (idx === -1) return "";
  return pathname.slice(idx + marker.length).split("?")[0] ?? "";
}

export function AdminMarketingPlatformShell({
  children,
  showProjections = false
}: {
  children: ReactNode;
  showProjections?: boolean;
}) {
  const location = useLocation();
  const adminPath = marketingAdminPathFromLocation(location.pathname);
  const navCtx = adminPath ? findMarketingOperationNavContext(adminPath) : null;
  const scope = useAdminProjectScope();
  const [fields, setFields] = useState<BrandingWorkspaceData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scope.projectId) {
      setFields({});
      setError(null);
      return;
    }
    setLoading(true);
    void getProjectWorkspace(scope.projectId)
      .then((res) => {
        setFields(res.workspace.fields);
        setError(null);
      })
      .catch((err) => {
        setFields({});
        setError(err instanceof ApiError ? err.message : "Erro ao carregar projeto.");
      })
      .finally(() => setLoading(false));
  }, [scope.projectId]);

  return (
    <div className="space-y-6">
      {navCtx ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-300">
          {navCtx.pillarLabel} · {navCtx.sectionLabel} · {navCtx.itemLabel}
        </p>
      ) : null}
      <AdminProjectScopeBar
        projectId={scope.projectId}
        onProjectChange={scope.onProjectChange}
        loading={loading}
        error={error}
      />
      {!scope.projectId ? (
        <p className="text-sm text-[var(--app-text-muted)]">
          Selecione um projeto para vincular planejamento, workspace de lançamento e execução de marketing.
        </p>
      ) : null}
      {scope.projectId && showProjections && !loading ? (
        <WorkspaceProjectionsPanel fields={fields} title="Dados do projeto (marketing)" targetIds={[...MARKETING_PROJECTION_TARGETS]} />
      ) : null}
      {children}
    </div>
  );
}
