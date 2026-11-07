import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { pdf } from "@react-pdf/renderer";
import {
  buildLaunchPlanOutline,
  buildLaunchPlanPdfModel,
  findFormulaOperationNavContext,
  launchOperationProgress,
  parseBrandingWorkspaceJson,
  type BrandingWorkspaceData
} from "@ederson-agencia/shared";
import { ApiError, apiGet } from "../api";
import { getProjectWorkspace } from "../api/project-workspace-api";
import { ADMIN_BASE } from "../components/admin/AdminOperationsLayout";
import { LaunchPlanPdfDocument } from "../components/admin/branding-studios/LaunchPlanPdfDocument";
import { WorkspaceBarChart } from "../components/admin/WorkspaceBarChart";
import { Download, FileText } from "lucide-react";

type ProjectOption = { id: string; title: string };

const LOCAL_KEY = "ederson-agencia.project-workspace.v1";

function readLocal(): { fields: BrandingWorkspaceData; checklist: Record<string, boolean> } {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return { fields: {}, checklist: {} };
    const parsed = JSON.parse(raw) as { fields?: BrandingWorkspaceData; checklist?: Record<string, boolean> };
    return {
      fields: parsed.fields ?? parseBrandingWorkspaceJson(parsed),
      checklist: parsed.checklist ?? {}
    };
  } catch {
    return { fields: {}, checklist: {} };
  }
}

export function AdminLaunchPlanPdfPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get("project") ?? "";

  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [fields, setFields] = useState<BrandingWorkspaceData>({});
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [projectTitle, setProjectTitle] = useState("Projeto");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const navCtx = findFormulaOperationNavContext("operacao/formula-lancamento/plano-pdf");
  const projectQ = projectId ? `?project=${encodeURIComponent(projectId)}` : "";
  const generatedAt = useMemo(() => new Date().toLocaleString("pt-BR"), []);

  const pdfModel = useMemo(
    () => buildLaunchPlanPdfModel(projectTitle, fields, checklist, generatedAt),
    [projectTitle, fields, checklist, generatedAt]
  );
  const outline = useMemo(() => buildLaunchPlanOutline(fields, checklist), [fields, checklist]);
  const flProgress = launchOperationProgress(checklist);

  useEffect(() => {
    void apiGet<{ projects: ProjectOption[] }>("/agency/projects").then((res) =>
      setProjects(res.projects.map((p) => ({ id: p.id, title: p.title })))
    );
  }, []);

  useEffect(() => {
    if (!projectId) {
      const local = readLocal();
      setFields(local.fields);
      setChecklist(local.checklist);
      setProjectTitle("Rascunho local");
      return;
    }
    setLoading(true);
    void getProjectWorkspace(projectId)
      .then((res) => {
        setFields(res.workspace.fields);
        setChecklist(res.workspace.checklist ?? {});
        setProjectTitle(res.projectTitle ?? projects.find((p) => p.id === projectId)?.title ?? "Projeto");
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Erro ao carregar.");
      })
      .finally(() => setLoading(false));
  }, [projectId, projects]);

  function onProjectChange(nextId: string) {
    const next = new URLSearchParams(searchParams);
    if (nextId) next.set("project", nextId);
    else next.delete("project");
    setSearchParams(next, { replace: true });
  }

  async function downloadPdf() {
    setDownloading(true);
    try {
      const blob = await pdf(<LaunchPlanPdfDocument {...pdfModel} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `plano-lancamento-${projectTitle.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="agency-admin-page-head">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-200">
          {navCtx ? (
            <>
              {navCtx.pillarLabel} · {navCtx.sectionLabel} · {navCtx.itemLabel}
            </>
          ) : (
            "Fórmula de Lançamento"
          )}
        </p>
        <h1>Plano de Lançamento (PDF)</h1>
        <p>Consolida oferta, marketing, simulador e progresso do checklist FL.</p>
      </header>

      <div className="panel space-y-3 p-4 sm:p-5">
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-[var(--app-text)]">Projeto</span>
          <select className="input w-full max-w-xl" value={projectId} onChange={(e) => onProjectChange(e.target.value)}>
            <option value="">Rascunho local</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs text-[var(--app-text-muted)]">
          Checklist FL: {flProgress.done}/{flProgress.total} ({flProgress.percent}%)
        </p>
        {loading ? <p className="text-xs text-[var(--app-text-muted)]">Carregando…</p> : null}
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-primary text-sm" disabled={downloading} onClick={() => void downloadPdf()}>
            <Download className="mr-1 inline h-4 w-4" />
            {downloading ? "Gerando…" : "Baixar PDF"}
          </button>
          <Link to={`${ADMIN_BASE}/operacao/formula-lancamento/simulador${projectQ}`} className="btn-secondary text-sm">
            Editar simulador
          </Link>
          <Link to={`${ADMIN_BASE}/operacao/produto-oferta${projectQ}`} className="btn-secondary text-sm">
            Produto & oferta
          </Link>
        </div>
      </div>

      <WorkspaceBarChart title="Faturamento projetado (simulador)" bars={pdfModel.scenariosChart} />

      <div className="panel space-y-3 p-4 sm:p-5">
        <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--app-text)]">
          <FileText className="h-5 w-5 text-amber-600" />
          Prévia
        </h2>
        {outline.length === 0 ? (
          <p className="text-sm text-[var(--app-text-muted)]">Preencha produto, marketing e simulador para enriquecer o PDF.</p>
        ) : (
          <ul className="space-y-4">
            {outline.map((sec) => (
              <li key={sec.title}>
                <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">{sec.title}</h3>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                  {sec.lines.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
