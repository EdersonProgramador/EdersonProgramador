import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BRAND_IDENTITY, DEV_CODE_STUDIO_FIELD_ID, type BrandingWorkspaceData } from "@ederson-agencia/shared";
import { Briefcase, Code2 } from "lucide-react";
import { ApiError, apiGet } from "../api";
import { getProjectWorkspace } from "../api/project-workspace-api";
import { ADMIN_BASE } from "../components/admin/AdminOperationsLayout";
import { DevelopmentCodeStudio } from "../components/admin/DevelopmentCodeStudio";
import { mergeProjectWorkspaceFields, stripStudioFieldWhileLoading } from "../lib/dev-code-studio-workspace-fields";
import { applySiteTheme } from "../stores/themeStore";
import "../styles/dev-code-studio.css";

type ProjectOption = { id: string; title: string };

const CRM_PRIMARY = "#4f46e5";

/** IDE em tela cheia — visual alinhado ao CRM (Poppins / indigo / branco). */
export function AdminCodeStudioFullPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get("project") ?? "";

  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [fields, setFields] = useState<BrandingWorkspaceData>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    applySiteTheme("day");
    document.body.classList.add("crm-studio-active");
    try {
      const key = "dev-code-studio-editor-theme";
      const current = localStorage.getItem(key);
      if (!current || current === "auto" || current === "vs-dark" || current === "dracula") {
        localStorage.setItem(key, "vs");
      }
    } catch {
      /* ignore */
    }
    return () => {
      document.body.classList.remove("crm-studio-active");
    };
  }, []);

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
    setFields((prev) => stripStudioFieldWhileLoading(prev));
    try {
      const ws = await getProjectWorkspace(id);
      setFields((prev) => mergeProjectWorkspaceFields(prev, ws.workspace.fields));
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
    <div className="dev-code-studio-fullpage dev-code-studio-fullpage--crm fixed inset-0 z-[100] flex flex-col">
      <header className="dev-code-studio-fullpage__crm-top">
        <div className="dev-code-studio-fullpage__crm-brand">
          <div className="dev-code-studio-fullpage__crm-mark" style={{ backgroundColor: CRM_PRIMARY }} aria-hidden>
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="dev-code-studio-fullpage__crm-name">{BRAND_IDENTITY.primarySystem.name}</p>
            <p className="dev-code-studio-fullpage__crm-eyebrow">
              <Code2 className="h-3.5 w-3.5" aria-hidden />
              Code Studio
            </p>
          </div>
        </div>

        <div className="dev-code-studio-fullpage__crm-tools">
          <label className="dev-code-studio-fullpage__crm-field">
            <span>Projeto</span>
            <select
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
          <p className="dev-code-studio-fullpage__crm-hint">
            {projectId
              ? "Workspace salvo no banco"
              : "Vincule um projeto para persistir pastas e arquivos"}
            {loading ? " · Carregando…" : ""}
            {saving ? " · Salvando…" : ""}
            {error ? ` · ${error}` : ""}
          </p>
        </div>

        <a href={`${ADMIN_BASE}/?view=dashboard`} className="dev-code-studio-fullpage__crm-back">
          Voltar ao sistema
        </a>
      </header>

      <div className="dev-code-studio-shell dev-code-studio-shell--fill dev-code-studio-shell--crm min-h-0 flex-1">
        <DevelopmentCodeStudio
          key={projectId || "local"}
          projectId={projectId || undefined}
          workspaceReady={!projectId || !loading}
          storedRaw={studioRaw}
          onStoredChange={(raw) => setFields((prev) => ({ ...prev, [DEV_CODE_STUDIO_FIELD_ID]: raw }))}
          onError={setError}
          onSavingChange={setSaving}
          uiVariant="crm"
        />
      </div>
    </div>
  );
}
