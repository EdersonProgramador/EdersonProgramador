import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { DEV_CODE_STUDIO_FIELD_ID, type BrandingWorkspaceData } from "@ederson-agencia/shared";
import { ApiError } from "../api";
import { getProjectWorkspace } from "../api/project-workspace-api";
import { ADMIN_BASE } from "../components/admin/AdminOperationsLayout";
import { DevelopmentCodeStudio } from "../components/admin/DevelopmentCodeStudio";

/** IDE em tela cheia (sem menu lateral da operação) — abre em nova aba a partir do studio. */
export function AdminCodeStudioFullPage() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("project") ?? "";
  const q = projectId ? `?project=${encodeURIComponent(projectId)}` : "";

  const [fields, setFields] = useState<BrandingWorkspaceData>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const studioRaw = typeof fields[DEV_CODE_STUDIO_FIELD_ID] === "string" ? fields[DEV_CODE_STUDIO_FIELD_ID] : undefined;

  return (
    <div className="dev-code-studio-fullpage fixed inset-0 z-[100] flex flex-col bg-[var(--app-bg-solid)]">
      <header className="dev-code-studio-fullpage__bar flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[var(--app-border)] px-3 py-2">
        <div className="flex min-w-0 flex-wrap items-center gap-3 text-xs text-[var(--app-text-muted)]">
          {loading ? <span>Carregando…</span> : null}
          {error ? <span className="text-red-500">{error}</span> : null}
          {saving ? <span>Salvando…</span> : null}
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
          storedRaw={studioRaw}
          onStoredChange={(raw) => setFields((prev) => ({ ...prev, [DEV_CODE_STUDIO_FIELD_ID]: raw }))}
          onError={setError}
          onSavingChange={setSaving}
        />
      </div>
    </div>
  );
}
