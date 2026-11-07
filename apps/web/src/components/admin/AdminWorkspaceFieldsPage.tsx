import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import {
  type BrandingFieldValue,
  type BrandingSectionDef,
  type BrandingWorkspaceData,
  parseBrandingWorkspaceJson
} from "@ederson-agencia/shared";
import { ApiError, apiGet } from "../../api";
import { getProjectWorkspace, patchProjectWorkspace } from "../../api/project-workspace-api";
import { BrandingFieldEditor } from "./BrandingFieldEditor";

const LOCAL_STORAGE_KEY = "ederson-agencia.project-workspace.v1";

type ProjectOption = { id: string; title: string };

type Props = {
  sections: readonly BrandingSectionDef[];
  progress?: { done: number; total: number; percent: number };
  header: React.ReactNode;
  sidePanel?: ReactNode;
  renderAnalytics?: (data: BrandingWorkspaceData, projectId: string) => ReactNode;
  computeProgress?: (data: BrandingWorkspaceData) => { done: number; total: number; percent: number };
};

function readLocalData(): BrandingWorkspaceData {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { fields?: BrandingWorkspaceData };
    return parsed.fields ?? parseBrandingWorkspaceJson(parsed);
  } catch {
    return {};
  }
}

function writeLocalData(data: BrandingWorkspaceData) {
  try {
    const prev = localStorage.getItem(LOCAL_STORAGE_KEY);
    let checklist: Record<string, boolean> = {};
    if (prev) {
      const p = JSON.parse(prev) as { checklist?: Record<string, boolean> };
      checklist = p.checklist ?? {};
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ fields: data, checklist }));
  } catch {
    /* ignore */
  }
}

export function AdminWorkspaceFieldsPage({
  sections,
  progress: progressProp,
  header,
  sidePanel,
  renderAnalytics,
  computeProgress
}: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get("project") ?? "";
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [data, setData] = useState<BrandingWorkspaceData>({});
  const [loading, setLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [savingField, setSavingField] = useState<string | null>(null);

  useEffect(() => {
    void apiGet<{ projects: ProjectOption[] }>("/agency/projects").then((res) =>
      setProjects(res.projects.map((p) => ({ id: p.id, title: p.title })))
    );
  }, []);

  useEffect(() => {
    if (projectId) {
      setLoading(true);
      void getProjectWorkspace(projectId)
        .then((res) => setData(res.workspace.fields))
        .catch((err) => {
          setData({});
          setSyncError(err instanceof ApiError ? err.message : "Erro ao carregar dados.");
        })
        .finally(() => setLoading(false));
      return;
    }
    setData(readLocalData());
  }, [projectId]);

  const setField = useCallback(
    (fieldId: string, value: BrandingFieldValue | null) => {
      setData((prev) => {
        const next = { ...prev };
        if (value === null) delete next[fieldId];
        else next[fieldId] = value;
        if (!projectId) writeLocalData(next);
        return next;
      });
      if (projectId) {
        setSavingField(fieldId);
        void patchProjectWorkspace(projectId, { fieldId, value })
          .catch((err) => setSyncError(err instanceof ApiError ? err.message : "Falha ao salvar."))
          .finally(() => setSavingField(null));
      }
    },
    [projectId]
  );

  function onProjectChange(nextId: string) {
    const next = new URLSearchParams(searchParams);
    if (nextId) next.set("project", nextId);
    else next.delete("project");
    setSearchParams(next, { replace: true });
  }

  return (
    <div className="space-y-6">
      {header}

      <div className="panel space-y-3 p-4 sm:p-5">
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-[var(--app-text)]">Projeto / cliente</span>
          <select className="input w-full max-w-xl" value={projectId} onChange={(e) => onProjectChange(e.target.value)}>
            <option value="">Rascunho local (sem cliente)</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        {(() => {
          const progress = progressProp ?? (computeProgress ? computeProgress(data) : undefined);
          return progress ? (
            <p className="text-xs text-[var(--app-text-muted)]">
              Campos: {progress.done}/{progress.total} ({progress.percent}%)
            </p>
          ) : null;
        })()}
        {loading ? <p className="text-xs text-[var(--app-text-muted)]">Carregando…</p> : null}
        {syncError ? <p className="text-sm text-red-500">{syncError}</p> : null}
      </div>

      {sidePanel}
      {renderAnalytics ? renderAnalytics(data, projectId) : null}

      {sections.map((section) => (
        <section key={section.id} className="panel space-y-4 p-4 sm:p-5">
          <div>
            <h2 className="text-lg font-semibold text-[var(--app-text)]">{section.title}</h2>
            {section.intro ? <p className="mt-1 text-sm text-[var(--app-text-muted)]">{section.intro}</p> : null}
          </div>
          <div className="space-y-6">
            {section.fields.map((field) => (
              <div key={field.id} className="agency-branding-field-block">
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold text-[var(--app-text)]">{field.label}</h3>
                  {savingField === field.id ? <span className="text-xs text-[var(--app-text-muted)]">Salvando…</span> : null}
                </div>
                {field.description ? <p className="mb-2 text-xs text-[var(--app-text-muted)]">{field.description}</p> : null}
                <BrandingFieldEditor
                  field={field}
                  value={data[field.id]}
                  projectId={projectId || null}
                  disabled={loading}
                  onChange={(value) => setField(field.id, value)}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
