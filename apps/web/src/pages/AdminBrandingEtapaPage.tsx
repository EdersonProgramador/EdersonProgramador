import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import {
  adjacentBrandingEtapa,
  brandingEtapaProgress,
  brandingWorkspaceProgress,
  findBrandingOperationNavContext,
  PROJECT_WORKSPACE_FEED_RULES,
  resolveWorkspaceFeed,
  getBrandingEtapa,
  parseBrandingWorkspaceJson,
  type BrandingEtapaId,
  type BrandingFieldValue,
  type BrandingWorkspaceData
} from "@ederson-agencia/shared";
import { ApiError, apiGet } from "../api";
import { getProjectWorkspace, patchProjectWorkspace } from "../api/project-workspace-api";
import { ADMIN_BASE } from "../components/admin/AdminOperationsLayout";
import { BrandingFieldEditor } from "../components/admin/BrandingFieldEditor";
import { BrandCanvaStudioPanel } from "../components/admin/branding-studios/BrandCanvaStudioPanel";

const LOCAL_STORAGE_KEY = "ederson-agencia.project-workspace.v1";

type ProjectOption = { id: string; title: string };

function readLocalData(): BrandingWorkspaceData {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { fields?: BrandingWorkspaceData };
    if (parsed.fields) return parsed.fields;
    return parseBrandingWorkspaceJson(parsed);
  } catch {
    return {};
  }
}

function writeLocalData(data: BrandingWorkspaceData) {
  const prev = localStorage.getItem(LOCAL_STORAGE_KEY);
  let checklist: Record<string, boolean> = {};
  try {
    if (prev) {
      const p = JSON.parse(prev) as { checklist?: Record<string, boolean> };
      checklist = p.checklist ?? {};
    }
  } catch {
    /* ignore */
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ fields: data, checklist }));
}

export function AdminBrandingEtapaPage() {
  const { etapaId } = useParams<{ etapaId: string }>();
  const etapa = etapaId ? getBrandingEtapa(etapaId) : undefined;
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get("project") ?? "";

  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [data, setData] = useState<BrandingWorkspaceData>({});
  const [loading, setLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [savingField, setSavingField] = useState<string | null>(null);

  const adminPath = etapa ? `operacao/branding/${etapa.id}` : "";
  const navCtx = adminPath ? findBrandingOperationNavContext(adminPath) : null;

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
  }, [projectId, etapaId]);

  const persistMode = projectId ? "project" : "local";

  const setField = useCallback(
    (fieldId: string, value: BrandingFieldValue | null) => {
      setData((prev) => {
        const next = { ...prev };
        if (value === null) delete next[fieldId];
        else next[fieldId] = value;
        if (persistMode === "local") writeLocalData(next);
        return next;
      });
      if (persistMode === "project") {
        setSavingField(fieldId);
        void patchProjectWorkspace(projectId, { fieldId, value })
          .then((res) => setData(res.data ?? {}))
          .catch((err) => setSyncError(err instanceof ApiError ? err.message : "Falha ao salvar."))
          .finally(() => setSavingField(null));
      }
    },
    [persistMode, projectId]
  );

  const etapaProgress = useMemo(() => (etapa ? brandingEtapaProgress(etapa, data) : null), [etapa, data]);
  const overall = useMemo(() => brandingWorkspaceProgress(data), [data]);

  function onProjectChange(nextId: string) {
    const next = new URLSearchParams(searchParams);
    if (nextId) next.set("project", nextId);
    else next.delete("project");
    setSearchParams(next, { replace: true });
  }

  if (!etapaId || !etapa) {
    return <Navigate to={`${ADMIN_BASE}/operacao/branding/diagnostico`} replace />;
  }

  const prevEtapa = adjacentBrandingEtapa(etapa.id as BrandingEtapaId, "prev");
  const nextEtapa = adjacentBrandingEtapa(etapa.id as BrandingEtapaId, "next");
  const projectQ = projectId ? `?project=${encodeURIComponent(projectId)}` : "";

  return (
    <div className="space-y-6">
      <header className="agency-admin-page-head">
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-300">
          {navCtx ? (
            <>
              {navCtx.pillarLabel} · {navCtx.sectionLabel} · {navCtx.itemLabel}
            </>
          ) : (
            "Branding"
          )}
        </p>
        <h1>
          {etapa.emoji} {etapa.title}
        </h1>
        <p>{etapa.subtitle}</p>
      </header>

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
        <p className="text-xs text-[var(--app-text-muted)]">
          Esta etapa:{" "}
          <strong className="text-[var(--app-text)]">
            {etapaProgress?.done}/{etapaProgress?.total}
          </strong>{" "}
          campos ({etapaProgress?.percent}%)
          {projectId ? (
            <>
              {" "}
              · Branding geral: {overall.done}/{overall.total} ({overall.percent}%)
            </>
          ) : null}
        </p>
        {loading ? <p className="text-xs text-[var(--app-text-muted)]">Carregando dados do projeto…</p> : null}
        {syncError ? <p className="text-sm text-red-500">{syncError}</p> : null}
        {!projectId ? (
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Textos e formulários salvam localmente. Selecione um projeto para persistir no banco e enviar áudio/vídeo/arquivos.
          </p>
        ) : null}
      </div>

      {etapa.id === "identidade" ? <BrandCanvaStudioPanel fields={data} projectId={projectId || undefined} /> : null}

      {projectId && etapa.id === "plataforma" ? (
        <div className="panel space-y-2 p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-[var(--app-text)]">Projeções sincronizadas (piloto)</h2>
          <p className="text-xs text-[var(--app-text-muted)]">
            Valores derivados dos campos de Branding para Marketing, Dev e FL.
          </p>
          <ul className="space-y-1.5 text-sm">
            {PROJECT_WORKSPACE_FEED_RULES.slice(0, 5).map((rule) => {
              const resolved = resolveWorkspaceFeed(rule, data);
              return (
                <li key={rule.targetId} className="flex flex-wrap gap-x-2 gap-y-0.5">
                  <span className="text-[var(--app-text-muted)]">{rule.label}:</span>
                  <span className="font-medium text-[var(--app-text)]">
                    {resolved.value ?? "— pendente —"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {etapa.sections.map((section) => (
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
                  {savingField === field.id ? (
                    <span className="text-xs text-[var(--app-text-muted)]">Salvando…</span>
                  ) : null}
                </div>
                {field.description ? (
                  <p className="mb-2 text-xs text-[var(--app-text-muted)]">{field.description}</p>
                ) : null}
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

      <nav className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--app-border)] pt-4">
        {prevEtapa ? (
          <Link
            to={`${ADMIN_BASE}/operacao/branding/${prevEtapa.id}${projectQ}`}
            className="btn-secondary text-sm"
          >
            ← {prevEtapa.navLabel}
          </Link>
        ) : (
          <span />
        )}
        {nextEtapa ? (
          <Link
            to={`${ADMIN_BASE}/operacao/branding/${nextEtapa.id}${projectQ}`}
            className="btn-primary text-sm"
          >
            {nextEtapa.navLabel} →
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
