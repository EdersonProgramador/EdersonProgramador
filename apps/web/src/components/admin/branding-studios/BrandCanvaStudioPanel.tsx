import {
  BRANDING_PALETTE_FIELD_ID,
  CANVA_CONNECT_DOCS_URL,
  CANVA_CREATE_LINKS,
  formatPaletteForCanvaClipboard,
  parseBrandingPaletteField,
  type BrandingWorkspaceData,
  type CanvaIntegrationStatus
} from "@ederson-agencia/shared";
import { ExternalLink, Copy, Check, Link2, Unlink, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../../../api";
import { disconnectCanva, getCanvaStatus, startCanvaOAuth, syncCanvaBrand } from "../../../api/canva-api";

type Props = {
  fields: BrandingWorkspaceData;
  projectId?: string;
};

export function BrandCanvaStudioPanel({ fields, projectId }: Props) {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<CanvaIntegrationStatus | null>(null);
  const [redirectUri, setRedirectUri] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const palette = parseBrandingPaletteField(fields[BRANDING_PALETTE_FIELD_ID]);
  const swatches = palette.swatches.filter((s) => s.hex.trim());

  const loadStatus = useCallback(() => {
    if (!projectId) {
      setStatus(null);
      return;
    }
    void getCanvaStatus(projectId)
      .then((res) => {
        setStatus(res.status);
        setRedirectUri(res.redirectUri);
      })
      .catch(() => setStatus({ configured: false, connected: false }));
  }, [projectId]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  async function copyPalette() {
    const text = formatPaletteForCanvaClipboard(swatches);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  async function onConnect() {
    if (!projectId) return;
    setBusy(true);
    setError(null);
    try {
      const { authorizeUrl } = await startCanvaOAuth(projectId);
      window.location.href = authorizeUrl;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao iniciar OAuth Canva.");
      setBusy(false);
    }
  }

  async function onDisconnect() {
    if (!projectId) return;
    setBusy(true);
    setError(null);
    try {
      await disconnectCanva(projectId);
      loadStatus();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao desconectar.");
    } finally {
      setBusy(false);
    }
  }

  async function onSyncBrand() {
    if (!projectId) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await syncCanvaBrand(projectId);
      setMessage(res.message);
      if (res.paletteClipboard) {
        await navigator.clipboard.writeText(res.paletteClipboard);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
      loadStatus();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao sincronizar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel space-y-4 p-4 sm:p-5">
      <div>
        <h2 className="text-base font-semibold text-[var(--app-text)]">Canva — produção visual</h2>
        <p className="mt-1 text-sm text-[var(--app-text-muted)]">
          Conecte com OAuth (PKCE) para usar a conta do cliente no Connect, ou abra templates e cadastre a paleta no{" "}
          <a href="https://www.canva.com/brand/" target="_blank" rel="noreferrer" className="text-violet-600 underline dark:text-violet-300">
            Brand Kit
          </a>
          .
        </p>
      </div>

      {projectId ? (
        <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-3 text-sm">
          <p className="font-medium text-[var(--app-text)]">
            Canva Connect:{" "}
            {status?.connected ? (
              <span className="text-emerald-600 dark:text-emerald-400">
                conectado{status.profileName ? ` (${status.profileName})` : ""}
              </span>
            ) : status?.configured ? (
              <span className="text-amber-700 dark:text-amber-300">não conectado</span>
            ) : (
              <span className="text-[var(--app-text-muted)]">API sem CANVA_CLIENT_ID / SECRET</span>
            )}
          </p>
          {redirectUri ? (
            <p className="mt-1 font-mono text-[10px] text-[var(--app-text-subtle)]">Redirect: {redirectUri}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {status?.configured && !status.connected ? (
              <button type="button" className="btn-primary text-sm" disabled={busy} onClick={() => void onConnect()}>
                <Link2 className="mr-1 inline h-4 w-4" />
                Conectar Canva
              </button>
            ) : null}
            {status?.connected ? (
              <>
                <button type="button" className="btn-secondary text-sm" disabled={busy} onClick={() => void onSyncBrand()}>
                  <RefreshCw className="mr-1 inline h-4 w-4" />
                  Sincronizar paleta
                </button>
                <button type="button" className="btn-secondary text-sm" disabled={busy} onClick={() => void onDisconnect()}>
                  <Unlink className="mr-1 inline h-4 w-4" />
                  Desconectar
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : (
        <p className="text-sm text-amber-700 dark:text-amber-300">Selecione um projeto para OAuth Canva.</p>
      )}

      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      {message ? <p className="text-xs text-[var(--app-text-muted)]">{message}</p> : null}

      {swatches.length ? (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn-secondary text-sm" onClick={() => void copyPalette()}>
            {copied ? <Check className="mr-1 inline h-4 w-4" /> : <Copy className="mr-1 inline h-4 w-4" />}
            {copied ? "Copiado" : "Copiar paleta (nome + HEX)"}
          </button>
          <div className="flex gap-1">
            {swatches.map((s) => (
              <span key={s.id} className="h-8 w-8 rounded border border-[var(--app-border)]" style={{ backgroundColor: s.hex }} title={s.name} />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-amber-700 dark:text-amber-300">Preencha o studio de paleta antes de sincronizar.</p>
      )}

      <ul className="grid gap-2 sm:grid-cols-2">
        {CANVA_CREATE_LINKS.map((link) => (
          <li key={link.id}>
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="flex h-full flex-col rounded-lg border border-[var(--app-border)] px-3 py-2.5 text-sm transition hover:border-violet-400 hover:bg-[var(--app-hover)]"
            >
              <span className="flex items-center gap-1 font-medium text-[var(--app-text)]">
                {link.label}
                <ExternalLink className="h-3.5 w-3.5 text-[var(--app-text-muted)]" />
              </span>
              <span className="mt-0.5 text-xs text-[var(--app-text-muted)]">{link.description}</span>
            </a>
          </li>
        ))}
      </ul>

      <p className="text-xs text-[var(--app-text-muted)]">
        Registre o redirect URI no{" "}
        <a href={CANVA_CONNECT_DOCS_URL} target="_blank" rel="noreferrer" className="underline">
          Canva Developer Portal
        </a>{" "}
        (variáveis <code className="text-[10px]">CANVA_CLIENT_ID</code>, <code className="text-[10px]">CANVA_CLIENT_SECRET</code> na API).
      </p>
    </div>
  );
}
