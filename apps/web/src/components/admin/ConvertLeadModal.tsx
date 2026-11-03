import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AGENCY_APP_BASE,
  packageTierLabel,
  parsePackageTier,
  type PackageTierId
} from "@ederson-agencia/shared";
import { ApiError, apiPost } from "../../api";
import { AgencyAdminModal } from "./AgencyAdminModal";

type LeadForConvert = {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  packageTier?: string | null;
};

type ConvertLeadModalProps = {
  lead: LeadForConvert | null;
  onClose: () => void;
  onConverted: () => void | Promise<void>;
};

export function ConvertLeadModal({ lead, onClose, onConverted }: ConvertLeadModalProps) {
  const [clientEmail, setClientEmail] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [packageTier, setPackageTier] = useState<PackageTierId>("professional");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (!lead) return;
    setClientEmail(lead.email);
    setProjectTitle(`App do Zero ao Lançamento — ${lead.company?.trim() || lead.name}`);
    setPackageTier(parsePackageTier(lead.packageTier) ?? "professional");
    setError(null);
    setCreatedProjectId(null);
    setBusy(false);
  }, [lead]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!lead) return;
    setBusy(true);
    setError(null);
    try {
      const res = await apiPost<{ project: { id: string } }>(`/agency/leads/${lead.id}/convert`, {
        clientEmail: clientEmail.trim(),
        projectTitle: projectTitle.trim(),
        packageTier
      });
      setCreatedProjectId(res.project.id);
      await onConverted();
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Não foi possível converter o lead.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  const success = Boolean(createdProjectId);

  return (
    <AgencyAdminModal
      open={Boolean(lead)}
      title={success ? "Projeto criado" : "Converter lead em projeto"}
      description={
        success
          ? "O lead foi marcado como WON e vinculado ao novo projeto."
          : "O cliente precisa ter conta CLIENT na plataforma (ex.: cadastro em /cadastro ou convite manual)."
      }
      onClose={onClose}
      footer={
        success ? (
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className="btn-secondary text-sm" onClick={onClose}>
              Fechar
            </button>
            {createdProjectId ? (
              <Link
                to={`${AGENCY_APP_BASE}/projetos/${createdProjectId}`}
                className="btn-primary inline-flex text-sm"
                onClick={onClose}
              >
                Abrir projeto
              </Link>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className="btn-secondary text-sm" disabled={busy} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" form="convert-lead-form" className="btn-primary text-sm" disabled={busy}>
              {busy ? "Convertendo…" : "Criar projeto"}
            </button>
          </div>
        )
      }
    >
      {success ? (
        <p className="text-sm text-[var(--app-text-muted)]">
          Pacote: <strong className="text-[var(--app-text)]">{packageTierLabel(packageTier)}</strong>
        </p>
      ) : (
        <form id="convert-lead-form" className="space-y-4" onSubmit={(e) => void submit(e)}>
          {error ? <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">{error}</p> : null}
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-[var(--app-text)]">E-mail da conta CLIENT</span>
            <input
              className="input w-full"
              type="email"
              required
              autoComplete="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              disabled={busy}
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-[var(--app-text)]">Título do projeto</span>
            <input
              className="input w-full"
              required
              minLength={3}
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              disabled={busy}
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-[var(--app-text)]">Pacote</span>
            <select
              className="input w-full"
              value={packageTier}
              onChange={(e) => {
                const t = parsePackageTier(e.target.value);
                if (t) setPackageTier(t);
              }}
              disabled={busy}
            >
              <option value="essential">Essencial</option>
              <option value="professional">Profissional</option>
              <option value="advanced">Avançado</option>
            </select>
          </label>
        </form>
      )}
    </AgencyAdminModal>
  );
}
