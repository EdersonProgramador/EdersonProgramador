import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AGENCY_APP_BASE, parsePackageTier, type PackageTierId } from "@ederson-agencia/shared";
import { ApiError, apiGet, apiPost } from "../../api";
import { AgencyAdminModal } from "./AgencyAdminModal";

type AgencyUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  company?: string | null;
};

type CreateProjectModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
};

export function CreateProjectModal({ open, onClose, onCreated }: CreateProjectModalProps) {
  const [clients, setClients] = useState<AgencyUserRow[]>([]);
  const [freelancers, setFreelancers] = useState<AgencyUserRow[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [clientId, setClientId] = useState("");
  const [freelancerId, setFreelancerId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [packageTier, setPackageTier] = useState<PackageTierId>("professional");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setDescription("");
    setClientId("");
    setFreelancerId("");
    setPackageTier("professional");
    setError(null);
    setCreatedProjectId(null);
    setBusy(false);
    setLoadingAccounts(true);
    void Promise.all([
      apiGet<{ users: AgencyUserRow[] }>("/agency/users?role=CLIENT"),
      apiGet<{ users: AgencyUserRow[] }>("/agency/users?role=FREELANCER")
    ])
      .then(([c, f]) => {
        setClients(c.users);
        setFreelancers(f.users);
      })
      .catch(() => {
        setClients([]);
        setFreelancers([]);
        setError("Não foi possível carregar clientes e freelancers.");
      })
      .finally(() => setLoadingAccounts(false));
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        clientId,
        title: title.trim(),
        packageTier
      };
      if (description.trim()) body.description = description.trim();
      if (freelancerId) body.freelancerId = freelancerId;
      const res = await apiPost<{ project: { id: string } }>("/agency/projects", body);
      setCreatedProjectId(res.project.id);
      await onCreated();
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Não foi possível criar o projeto.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  const success = Boolean(createdProjectId);

  return (
    <AgencyAdminModal
      open={open}
      title={success ? "Projeto criado" : "Novo projeto"}
      description={
        success
          ? "Fases e entregáveis foram gerados conforme o pacote."
          : "Crie um projeto manualmente para um cliente já cadastrado."
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
            <button
              type="submit"
              form="create-project-form"
              className="btn-primary text-sm"
              disabled={busy || loadingAccounts || clients.length === 0}
            >
              {busy ? "Criando…" : "Criar projeto"}
            </button>
          </div>
        )
      }
    >
      {success ? null : loadingAccounts ? (
        <p className="text-sm text-[var(--app-text-muted)]">Carregando contas…</p>
      ) : clients.length === 0 ? (
        <p className="text-sm text-[var(--app-text-muted)]">
          Nenhuma conta CLIENT cadastrada. Peça ao cliente para se registrar em{" "}
          <strong className="text-[var(--app-text)]">/cadastro</strong> ou crie a conta manualmente.
        </p>
      ) : (
        <form id="create-project-form" className="space-y-4" onSubmit={(e) => void submit(e)}>
          {error ? <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">{error}</p> : null}
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-[var(--app-text)]">Cliente</span>
            <select
              className="input w-full"
              required
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              disabled={busy}
            >
              <option value="">Selecione…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.email}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-[var(--app-text)]">Freelancer (opcional)</span>
            <select
              className="input w-full"
              value={freelancerId}
              onChange={(e) => setFreelancerId(e.target.value)}
              disabled={busy}
            >
              <option value="">Nenhum</option>
              {freelancers.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} — {f.email}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-[var(--app-text)]">Título</span>
            <input
              className="input w-full"
              required
              minLength={3}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={busy}
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-[var(--app-text)]">Descrição (opcional)</span>
            <textarea
              className="input min-h-20 w-full"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
