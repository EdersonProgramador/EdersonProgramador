import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { DEV_CODE_STUDIO_FIELD_ID, type BrandingWorkspaceData } from "@ederson-agencia/shared";
import { ApiError, apiGet } from "../api";
import { getProjectWorkspace } from "../api/project-workspace-api";
import { ADMIN_BASE } from "../components/admin/AdminOperationsLayout";
import { DevelopmentCodeStudio } from "../components/admin/DevelopmentCodeStudio";

type ProjectOption = { id: string; title: string };

/** IDE em tela cheia (sem menu lateral da operação) — abre em nova aba a partir do studio. */
export function AdminCodeStudioFullPage() {
  const [searchParams, setSearchParams] = useSearchParams();
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

  function onProjectChange(nextId: string) {
    const next = new URLSearchParams(searchParams);
    if (nextId) next.set("project", nextId);
    else next.delete("project");
    setSearchParams(next, { replace: true });
  }

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
    if (projectId) void loadFields(projectId);
    else setFields({});
  }, [projectId, loadFields]);

  const studioRaw =
    projectId && loading
      ? undefined
      : typeof fields[DEV_CODE_STUDIO_FIELD_ID] === "string"
        ? fields[DEV_CODE_STUDIO_FIELD_ID]
        : undefined;

  return (
    <div className="dev-code-studio-fullpage fixed inset-0 z-[100] flex flex-col bg-[var(--app-bg-solid)]">
      <header className="dev-code-studio-fullpage__bar flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[var(--app-border)] px-3 py-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2 text-xs">
          <label className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-[var(--app-text-muted)]">Projeto</span>
            <select
              className="input max-w-[14rem] min-w-[10rem] text-xs"
              value={projectId}
              onChange={(e) => onProjectChange(e.target.value)}
              aria-label="Projeto para salvar no banco"
            >
              <option value="">Rascunho local (navegador)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </label>
          {projectId ? (
            <span className="text-[var(--app-text-muted)]">Workspace salvo no banco</span>
          ) : (
            <span className="text-amber-700 dark:text-amber-300">Vincule um projeto para persistir pastas e arquivos no banco</span>
          )}
          {loading ? <span className="text-[var(--app-text-muted)]">Carregando…</span> : null}
          {error ? <span className="text-red-500">{error}</span> : null}
          {saving ? <span className="text-[var(--app-text-muted)]">Salvando…</span> : null}
        </div>
        <Link
          to={`${ADMIN_BASE}/operacao/desenvolvimento/editor${q}`}
          className="shrink-0 rounded-md border border-[var(--app-border)] bg-[var(--app-panel)] px-2 py-1 text-xs text-[var(--app-text)] hover:bg-[var(--app-hover)]"
        >
          Voltar à operação
        </Link>
      </header>

      <div className="dev-code-studio-shell dev-code-studio-shell--fill min-h-0 flex-1 p-2 sm:p-3">
        <DevelopmentCodeStudio
          key={projectId || "local"}
          projectId={projectId || undefined}
          workspaceReady={!projectId || !loading}
          storedRaw={studioRaw}
          onStoredChange={(raw) => setFields((prev) => ({ ...prev, [DEV_CODE_STUDIO_FIELD_ID]: raw }))}
          onError={setError}
          onSavingChange={setSaving}
        />
      </div>
    </div>
  );
}
