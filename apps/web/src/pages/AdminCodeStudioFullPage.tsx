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
    <div className="fixed inset-0 z-[100] flex flex-col bg-[var(--app-bg-solid)]">
      <div className="relative flex min-h-0 flex-1 flex-col gap-2 p-2 sm:p-3">
        <div className="absolute right-3 top-3 z-10 flex flex-wrap items-center gap-3 text-xs">
          {loading ? <span className="text-[var(--app-text-muted)]">Carregando…</span> : null}
          {error ? <span className="text-red-500">{error}</span> : null}
          {saving ? <span className="text-[var(--app-text-muted)]">Salvando…</span> : null}
          <Link
            to={`${ADMIN_BASE}/operacao/desenvolvimento/editor${q}`}
            className="rounded-md border border-[var(--app-border)] bg-[var(--app-panel)] px-2 py-1 text-[var(--app-text)] hover:bg-[var(--app-hover)]"
          >
            Voltar à operação
          </Link>
        </div>

        <div className="flex min-h-0 flex-1 flex-col pt-8 [&_.dev-code-studio]:h-full [&_.dev-code-studio]:min-h-0 [&_.dev-code-studio]:flex-1 [&_.dev-code-studio]:max-h-none">
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
    </div>
  );
}
