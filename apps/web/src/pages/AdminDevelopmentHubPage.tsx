import { useCallback, useEffect, useState } from "react";
import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import {
  DEVELOPMENT_OPERATION_NAV,
  devTechStackCategoryByAdminSegment,
  findDevelopmentOperationNavContext,
  type BrandingWorkspaceData
} from "@ederson-agencia/shared";
import { ApiError, apiGet } from "../api";
import { getProjectWorkspace } from "../api/project-workspace-api";
import { ADMIN_BASE } from "../components/admin/AdminOperationsLayout";
import { DevelopmentStackPicker } from "../components/admin/DevelopmentStackPicker";
import { AdminPillarStatsHubPage } from "./AdminPillarStatsHubPage";

type ProjectOption = { id: string; title: string };

function hubViewFromPath(pathname: string): string | null {
  const marker = "/admin/operacao/desenvolvimento/";
  const idx = pathname.indexOf(marker);
  if (idx === -1) return null;
  return pathname.slice(idx + marker.length).split("/")[0] ?? null;
}

function isStackView(view: string | null): boolean {
  return view === "stack" || (view?.startsWith("stack-") ?? false);
}

export function AdminDevelopmentHubPage() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = hubViewFromPath(location.pathname);
  const projectId = searchParams.get("project") ?? "";
  const q = projectId ? `?project=${encodeURIComponent(projectId)}` : "";

  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [fields, setFields] = useState<BrandingWorkspaceData>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void apiGet<{ projects: ProjectOption[] }>("/agency/projects").then((res) =>
      setProjects(res.projects.map((p) => ({ id: p.id, title: p.title })))
    );
  }, []);

  const loadFields = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const ws = await getProjectWorkspace(id);
      setFields(ws.workspace.fields);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao carregar projeto.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (projectId && (view === "estatistica" || isStackView(view))) void loadFields(projectId);
    else setFields({});
  }, [projectId, view, loadFields]);

  function onProjectChange(nextId: string) {
    const next = new URLSearchParams(searchParams);
    if (nextId) next.set("project", nextId);
    else next.delete("project");
    setSearchParams(next, { replace: true });
  }

  if (view === "infra") {
    return <Navigate to={`${ADMIN_BASE}/operacao/fase-3${q}`} replace />;
  }

  const stackCategory = view ? devTechStackCategoryByAdminSegment(view) : undefined;
  const adminPath = view ? `operacao/desenvolvimento/${view}` : "";
  const navCtx = adminPath ? findDevelopmentOperationNavContext(adminPath) : null;
  const navItem = DEVELOPMENT_OPERATION_NAV.flatMap((s) => s.items).find((i) => i.adminPath === adminPath);

  if (isStackView(view) && stackCategory && navItem) {
    return (
      <div className="space-y-6">
        <header className="agency-admin-page-head">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-300">
            {navCtx ? (
              <>
                {navCtx.pillarLabel} · {navCtx.sectionLabel} · {navCtx.itemLabel}
              </>
            ) : (
              "Desenvolvimento"
            )}
          </p>
          <h1>{stackCategory.title}</h1>
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
          {saving ? <p className="text-xs text-[var(--app-text-muted)]">Salvando…</p> : null}
        </div>

        {!projectId ? (
          <p className="text-sm text-[var(--app-text-muted)]">Selecione um projeto para registrar a stack.</p>
        ) : (
          <DevelopmentStackPicker
            key={`${projectId}-${stackCategory.id}`}
            projectId={projectId}
            category={stackCategory}
            fields={fields}
            onFieldsChange={setFields}
            onError={setError}
            onSavingChange={setSaving}
          />
        )}
      </div>
    );
  }

  if (view !== "estatistica" || !navItem) {
    return <Navigate to={`${ADMIN_BASE}/operacao/desenvolvimento/stack${q}`} replace />;
  }

  return (
    <div className="space-y-6">
      <header className="agency-admin-page-head">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-300">
          {navCtx ? (
            <>
              {navCtx.pillarLabel} · {navCtx.sectionLabel} · {navCtx.itemLabel}
            </>
          ) : (
            "Desenvolvimento"
          )}
        </p>
        <h1>{navItem.label}</h1>
        <p>{navItem.description}</p>
      </header>
      <AdminPillarStatsHubPage pillar="development" />
    </div>
  );
}
