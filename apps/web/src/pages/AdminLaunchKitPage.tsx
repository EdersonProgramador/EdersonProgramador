import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  findOperationNavByAdminPath,
  INTEGRATION_SECRET_FIELDS,
  operationPhaseNavLabel,
  type BrandingFieldValue,
  type BrandingWorkspaceData,
  type LaunchKitExport
} from "@ederson-agencia/shared";
import { ApiError, apiGet, apiPost } from "../api";
import { getProjectWorkspace, patchProjectWorkspace } from "../api/project-workspace-api";
import { ADMIN_BASE } from "../components/admin/AdminOperationsLayout";
import { BrandingFieldEditor } from "../components/admin/BrandingFieldEditor";

type ProjectOption = { id: string; title: string };

type LaunchKitResponse = {
  export: LaunchKitExport;
  templates: {
    context: Record<string, string>;
    rendered: { id: string; label: string; channel: string; content: string }[];
  };
  leadlovers: unknown;
  hotmart: unknown;
};

export function AdminLaunchKitPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get("project") ?? "";
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [fields, setFields] = useState<BrandingWorkspaceData>({});
  const [kit, setKit] = useState<LaunchKitResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [emailTo, setEmailTo] = useState("");
  const [emailTemplate, setEmailTemplate] = useState<"email-ppl-confirm" | "email-cpl1-invite" | "email-cart-open">(
    "email-ppl-confirm"
  );

  const navCtx = findOperationNavByAdminPath("operacao/launch-kit");

  useEffect(() => {
    void apiGet<{ projects: ProjectOption[] }>("/agency/projects").then((res) =>
      setProjects(res.projects.map((p) => ({ id: p.id, title: p.title })))
    );
  }, []);

  const loadKit = useCallback(async (id: string) => {
    setLoading(true);
    setSyncError(null);
    try {
      const [ws, lk] = await Promise.all([getProjectWorkspace(id), apiGet<LaunchKitResponse>(`/agency/projects/${id}/launch-kit`)]);
      setFields(ws.workspace.fields);
      setKit(lk);
    } catch (err) {
      setSyncError(err instanceof ApiError ? err.message : "Erro ao carregar kit.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (projectId) void loadKit(projectId);
    else {
      setKit(null);
      setFields({});
    }
  }, [projectId, loadKit]);

  function onProjectChange(nextId: string) {
    const next = new URLSearchParams(searchParams);
    if (nextId) next.set("project", nextId);
    else next.delete("project");
    setSearchParams(next, { replace: true });
  }

  const setField = useCallback(
    (fieldId: string, value: BrandingFieldValue | null) => {
      if (!projectId) return;
      setSavingField(fieldId);
      void patchProjectWorkspace(projectId, { fieldId, value })
        .then(() => loadKit(projectId))
        .catch((err) => setSyncError(err instanceof ApiError ? err.message : "Falha ao salvar."))
        .finally(() => setSavingField(null));
    },
    [projectId, loadKit]
  );

  const exportJson = useMemo(() => (kit ? JSON.stringify(kit.export, null, 2) : ""), [kit]);

  function downloadExport() {
    if (!exportJson) return;
    const blob = new Blob([exportJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `launch-kit-${projectId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function publishLaunchPage() {
    if (!projectId) return;
    setSyncMsg(null);
    setSyncError(null);
    try {
      const res = await apiPost<{ publicUrl: string; slug: string }>(
        `/agency/projects/${projectId}/launch-page/publish`,
        {}
      );
      setPublicUrl(res.publicUrl);
      setSyncMsg(`LP publicada: ${res.publicUrl}`);
    } catch (err) {
      setSyncError(err instanceof ApiError ? err.message : "Falha ao publicar LP.");
    }
  }

  async function pushHotmart() {
    if (!projectId) return;
    setSyncMsg(null);
    setSyncError(null);
    try {
      const res = await apiPost<{ mode: string; message?: string }>(`/agency/projects/${projectId}/sync/hotmart`, {});
      setSyncMsg(res.mode === "pushed" ? "Produto enviado à Hotmart." : res.message ?? "Hotmart dry-run.");
    } catch (err) {
      setSyncError(err instanceof ApiError ? err.message : "Falha Hotmart.");
    }
  }

  async function sendTestEmail(templateOverride?: typeof emailTemplate) {
    if (!projectId || !emailTo.trim()) return;
    const templateId = templateOverride ?? emailTemplate;
    setSyncMsg(null);
    setSyncError(null);
    try {
      const res = await apiPost<{ sent: boolean; subject?: string; preview?: { subject: string } }>(
        `/agency/projects/${projectId}/launch-kit/send-email`,
        { templateId, to: emailTo.trim() }
      );
      setSyncMsg(
        res.sent
          ? `E-mail enviado: ${res.subject ?? ""}`
          : `Resend off — preview: ${res.preview?.subject ?? emailTemplate}`
      );
    } catch (err) {
      setSyncError(err instanceof ApiError ? err.message : "Falha ao enviar e-mail.");
    }
  }

  async function pushLeadlovers() {
    if (!projectId) return;
    setSyncMsg(null);
    setSyncError(null);
    try {
      const res = await apiPost<{ mode: string; message?: string }>(`/agency/projects/${projectId}/sync/leadlovers`, {});
      setSyncMsg(res.mode === "pushed" ? "Blueprint enviado ao Leadlovers." : res.message ?? "Dry-run concluído.");
    } catch (err) {
      setSyncError(err instanceof ApiError ? err.message : "Falha no sync.");
    }
  }

  return (
    <div className="space-y-6">
      <header className="agency-admin-page-head">
        <p className="text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-300">
          {navCtx ? (
            <>
              {navCtx.pillar.pillarLabel} · {operationPhaseNavLabel(navCtx.phase)}
            </>
          ) : (
            "Marketing"
          )}
        </p>
        <h1>Kit LP & e-mail</h1>
        <p>Templates gerados a partir do workspace (Branding + Produto). Copie para LPs, RD, Leadlovers ou front-end.</p>
      </header>

      <div className="panel space-y-3 p-4 sm:p-5">
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-[var(--app-text)]">Projeto</span>
          <select className="input w-full max-w-xl" value={projectId} onChange={(e) => onProjectChange(e.target.value)}>
            <option value="">Selecione…</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        {loading ? <p className="text-xs text-[var(--app-text-muted)]">Atualizando…</p> : null}
        {syncError ? <p className="text-sm text-red-500">{syncError}</p> : null}
        {syncMsg ? <p className="text-sm text-emerald-600">{syncMsg}</p> : null}
      </div>

      {projectId && kit ? (
        <>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-primary text-sm" onClick={() => void publishLaunchPage()}>
              Publicar LP de captação
            </button>
            <button type="button" className="btn-secondary text-sm" onClick={downloadExport}>
              Baixar launch-kit.json
            </button>
            <button type="button" className="btn-secondary text-sm" onClick={() => void pushLeadlovers()}>
              Sync Leadlovers
            </button>
            <button type="button" className="btn-secondary text-sm" onClick={() => void pushHotmart()}>
              Sync Hotmart
            </button>
            <a
              className="btn-ghost text-sm"
              href={`${ADMIN_BASE}/operacao/produto-oferta?project=${encodeURIComponent(projectId)}`}
            >
              Editar produto & checkout
            </a>
          </div>
          {publicUrl ? (
            <p className="text-sm">
              URL pública:{" "}
              <a href={publicUrl} className="text-brand-primary hover:underline" target="_blank" rel="noreferrer">
                {publicUrl}
              </a>
            </p>
          ) : null}

          <section className="panel space-y-3 p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-[var(--app-text)]">Enviar e-mail (Resend)</h2>
            <div className="flex flex-wrap gap-2">
              <select
                className="input max-w-xs text-sm"
                value={emailTemplate}
                onChange={(e) => setEmailTemplate(e.target.value as typeof emailTemplate)}
              >
                <option value="email-ppl-confirm">Confirmação PPL</option>
                <option value="email-cpl1-invite">Convite CPL 1</option>
                <option value="email-cart-open">Carrinho aberto</option>
              </select>
              <input
                className="input max-w-xs text-sm"
                type="email"
                placeholder="destino@teste.com"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
              />
              <button type="button" className="btn-secondary text-sm" onClick={() => void sendTestEmail()}>
                Enviar teste
              </button>
            </div>
            <p className="text-xs text-[var(--app-text-muted)]">Requer RESEND_API_KEY e MAIL_FROM na API.</p>
          </section>

          <section className="panel space-y-4 p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-[var(--app-text)]">Integrações & HMAC</h2>
            <p className="text-xs text-[var(--app-text-muted)]">
              Webhooks: envie header <code className="text-xs">X-Ederson-Signature: sha256=&lt;hex&gt;</code> com corpo JSON
              e segredo <code className="text-xs">integration:ingress:hmac-secret</code>.
            </p>
            {INTEGRATION_SECRET_FIELDS.map((field) => (
              <div key={field.id} className="agency-branding-field-block">
                <h3 className="mb-2 text-sm font-semibold">{field.label}</h3>
                {savingField === field.id ? (
                  <p className="text-xs text-[var(--app-text-muted)]">Salvando…</p>
                ) : null}
                <BrandingFieldEditor
                  field={field}
                  value={fields[field.id]}
                  projectId={projectId}
                  disabled={loading}
                  onChange={(value) => setField(field.id, value)}
                />
              </div>
            ))}
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--app-text)]">Templates</h2>
            {kit.templates.rendered.map((block) => (
              <div key={block.id} className="panel space-y-2 p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-[var(--app-text)]">
                    {block.label}{" "}
                    <span className="font-normal text-[var(--app-text-muted)]">({block.channel})</span>
                  </h3>
                  <div className="flex gap-1">
                    {block.channel === "email" ? (
                      <button
                        type="button"
                        className="btn-ghost text-xs"
                        onClick={() => void sendTestEmail(block.id as typeof emailTemplate)}
                        disabled={!emailTo.trim()}
                        title="Define template e envia se o campo destino estiver preenchido"
                      >
                        Enviar
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="btn-ghost text-xs"
                      onClick={() => void navigator.clipboard.writeText(block.content)}
                    >
                      Copiar
                    </button>
                  </div>
                </div>
                {block.channel === "lp" ? (
                  <div
                    className="prose prose-sm max-w-none rounded-lg border border-[var(--app-border)] bg-[var(--app-hover)]/30 p-4 dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: block.content }}
                  />
                ) : (
                  <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-[var(--app-hover)]/40 p-3 text-xs">
                    {block.content}
                  </pre>
                )}
              </div>
            ))}
          </section>
        </>
      ) : null}
    </div>
  );
}
