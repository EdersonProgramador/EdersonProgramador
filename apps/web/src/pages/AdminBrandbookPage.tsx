import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { pdf } from "@react-pdf/renderer";
import {
  buildBrandbookOutline,
  buildBrandbookPdfModel,
  brandingWorkspaceProgress,
  findBrandingOperationNavContext,
  parseBrandingWorkspaceJson,
  type BrandingWorkspaceData
} from "@ederson-agencia/shared";
import { ApiError, apiGet } from "../api";
import { getProjectWorkspace } from "../api/project-workspace-api";
import { ADMIN_BASE } from "../components/admin/AdminOperationsLayout";
import { BrandbookPdfDocument } from "../components/admin/branding-studios/BrandbookPdfDocument";
import { resolveBrandbookImageDataUrls } from "../components/admin/branding-studios/brandbook-assets";
import { BrandCanvaStudioPanel } from "../components/admin/branding-studios/BrandCanvaStudioPanel";
import { Download, FileText } from "lucide-react";

type ProjectOption = { id: string; title: string };

const LOCAL_STORAGE_KEY = "ederson-agencia.project-workspace.v1";

function readLocalFields(): BrandingWorkspaceData {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { fields?: BrandingWorkspaceData };
    return parsed.fields ?? parseBrandingWorkspaceJson(parsed);
  } catch {
    return {};
  }
}

export function AdminBrandbookPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get("project") ?? "";
  const canvaFlash = searchParams.get("canva");

  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [data, setData] = useState<BrandingWorkspaceData>({});
  const [projectTitle, setProjectTitle] = useState("Projeto");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const navCtx = findBrandingOperationNavContext("operacao/branding/brandbook");
  const progress = brandingWorkspaceProgress(data);
  const sections = buildBrandbookOutline(data);
  const projectQ = projectId ? `?project=${encodeURIComponent(projectId)}` : "";

  const pdfModel = useMemo(() => {
    const generatedAt = new Date().toLocaleString("pt-BR");
    return buildBrandbookPdfModel(projectTitle, data, generatedAt);
  }, [projectTitle, data]);

  useEffect(() => {
    void apiGet<{ projects: ProjectOption[] }>("/agency/projects").then((res) =>
      setProjects(res.projects.map((p) => ({ id: p.id, title: p.title })))
    );
  }, []);

  useEffect(() => {
    if (!projectId) {
      setData(readLocalFields());
      setProjectTitle("Rascunho local");
      return;
    }
    setLoading(true);
    setError(null);
    void getProjectWorkspace(projectId)
      .then((res) => {
        setData(res.workspace.fields);
        const p = projects.find((x) => x.id === projectId);
        setProjectTitle(p?.title ?? res.projectTitle ?? "Projeto");
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Erro ao carregar.");
        setData({});
      })
      .finally(() => setLoading(false));
  }, [projectId, projects]);

  useEffect(() => {
    if (projectId && projects.length) {
      const p = projects.find((x) => x.id === projectId);
      if (p) setProjectTitle(p.title);
    }
  }, [projectId, projects]);

  function onProjectChange(nextId: string) {
    const next = new URLSearchParams(searchParams);
    if (nextId) next.set("project", nextId);
    else next.delete("project");
    next.delete("canva");
    setSearchParams(next, { replace: true });
  }

  async function downloadPdf() {
    setDownloading(true);
    try {
      const [logoImages, moodboardImages] = await Promise.all([
        resolveBrandbookImageDataUrls(pdfModel.logoAssetUrls),
        resolveBrandbookImageDataUrls(pdfModel.moodboardAssetUrls)
      ]);
      const blob = await pdf(
        <BrandbookPdfDocument {...pdfModel} logoImages={logoImages} moodboardImages={moodboardImages} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `brandbook-${projectTitle.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

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
        <h1>Brandbook PDF</h1>
        <p>Relatório executivo da marca com dados capturados no workspace — pronto para cliente e equipe.</p>
      </header>

      {canvaFlash === "connected" ? (
        <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-800 dark:text-emerald-200">
          Conta Canva conectada com sucesso a este projeto.
        </p>
      ) : null}
      {canvaFlash === "error" ? (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          Não foi possível concluir o OAuth Canva. Tente conectar novamente.
        </p>
      ) : null}

      <div className="panel space-y-3 p-4 sm:p-5">
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-[var(--app-text)]">Projeto / cliente</span>
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
          Cobertura do workspace: {progress.done}/{progress.total} ({progress.percent}%)
        </p>
        {loading ? <p className="text-xs text-[var(--app-text-muted)]">Carregando…</p> : null}
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-primary text-sm" disabled={downloading} onClick={() => void downloadPdf()}>
            <Download className="mr-1 inline h-4 w-4" />
            {downloading ? "Gerando…" : "Baixar PDF"}
          </button>
          <Link to={`${ADMIN_BASE}/operacao/branding/identidade${projectQ}`} className="btn-secondary text-sm">
            Editar identidade
          </Link>
        </div>
      </div>

      <div className="panel space-y-3 p-4 sm:p-5">
        <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--app-text)]">
          <FileText className="h-5 w-5 text-violet-600" />
          Prévia do conteúdo
        </h2>
        {pdfModel.tagline ? <p className="text-sm italic text-violet-700 dark:text-violet-300">{pdfModel.tagline}</p> : null}
        {sections.length === 0 ? (
          <p className="text-sm text-[var(--app-text-muted)]">Preencha diagnóstico, plataforma e identidade para gerar seções no PDF.</p>
        ) : (
          <ul className="space-y-4">
            {sections.map((sec) => (
              <li key={sec.title}>
                <h3 className="text-sm font-semibold text-violet-700 dark:text-violet-300">{sec.title}</h3>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-[var(--app-text)]">
                  {sec.lines.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
        {pdfModel.logoAssetUrls.length || pdfModel.moodboardAssetUrls.length ? (
          <p className="text-xs text-[var(--app-text-muted)]">
            O PDF inclui página de paleta
            {pdfModel.logoAssetUrls.length ? ", logos" : ""}
            {pdfModel.moodboardAssetUrls.length ? " e moodboard" : ""} quando os arquivos estão acessíveis.
          </p>
        ) : null}
      </div>

      <BrandCanvaStudioPanel
        fields={data}
        projectId={projectId || undefined}
        onWorkspaceUpdated={() => {
          if (!projectId) return;
          void getProjectWorkspace(projectId).then((res) => setData(res.workspace.fields));
        }}
      />
    </div>
  );
}
