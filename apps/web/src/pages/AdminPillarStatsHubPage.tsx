import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  brandingWorkspaceProgress,
  projectWorkspaceSummary,
  type BrandingWorkspaceData
} from "@ederson-agencia/shared";
import { ApiError, apiGet } from "../api";
import { getProjectWorkspace } from "../api/project-workspace-api";
import { WorkspaceProjectionsPanel } from "../components/admin/WorkspaceProjectionsPanel";

type ProjectOption = { id: string; title: string };

type PillarKey = "branding" | "development" | "formula";

const PILLAR_SUMMARY_KEY: Record<PillarKey, "branding" | "development" | "formula"> = {
  branding: "branding",
  development: "development",
  formula: "formula"
};

type AdminPillarStatsHubPageProps = {
  pillar: PillarKey;
};

export function AdminPillarStatsHubPage({ pillar }: AdminPillarStatsHubPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get("project") ?? "";
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [fields, setFields] = useState<BrandingWorkspaceData>({});
  const [summary, setSummary] = useState<ReturnType<typeof projectWorkspaceSummary> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao carregar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (projectId) void load(projectId);
    else {
      setFields({});
      setSummary(null);
    }
  }, [projectId, load]);

  function onProjectChange(nextId: string) {
    const next = new URLSearchParams(searchParams);
    if (nextId) next.set("project", nextId);
    else next.delete("project");
    setSearchParams(next, { replace: true });
  }

  const key = PILLAR_SUMMARY_KEY[pillar];
  const pillarStats = summary?.[key];
  const brandingOnly =
    pillar === "branding" && !projectId ? null : pillar === "branding" ? brandingWorkspaceProgress(fields) : null;

  return (
    <>
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
      </div>

      {!projectId ? (
        <p className="text-sm text-[var(--app-text-muted)]">Selecione um projeto para ver estatísticas.</p>
      ) : null}

      {projectId && pillarStats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="panel p-4">
            <p className="text-xs text-[var(--app-text-muted)]">Este pilar</p>
            <p className="text-2xl font-bold text-[var(--app-text)]">{pillarStats.percent}%</p>
            <p className="text-xs text-[var(--app-text-subtle)]">
              {pillarStats.done}/{pillarStats.total} itens
            </p>
          </div>
          {summary ? (
            <>
              {(["branding", "marketing", "development", "formula"] as const)
                .filter((k) => k !== key)
                .map((k) => (
                  <div key={k} className="panel p-4">
                    <p className="text-xs text-[var(--app-text-muted)] capitalize">{k}</p>
                    <p className="text-2xl font-bold text-[var(--app-text)]">{summary[k].percent}%</p>
                    <p className="text-xs text-[var(--app-text-subtle)]">
                      {summary[k].done}/{summary[k].total}
                    </p>
                  </div>
                ))}
            </>
          ) : null}
        </div>
      ) : null}

      {pillar === "branding" && brandingOnly ? (
        <p className="text-sm text-[var(--app-text-muted)]">
          Campos de marca preenchidos (local/projeto): {brandingOnly.percent}% ({brandingOnly.done}/{brandingOnly.total})
        </p>
      ) : null}

      {projectId ? <WorkspaceProjectionsPanel fields={fields} title="Projeções do workspace" /> : null}
    </>
  );
}
