import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AGENCY_APP_BASE,
  AGENCY_FUNNEL_COPY,
  formatBRL,
  parsePackageTier,
  type PackageTierId
} from "@ederson-agencia/shared";
import { apiGet, apiPost } from "../../api";
import { ClientDeliveryProgress } from "./ClientDeliveryProgress";
import { ClientNotificationsBanner } from "./ClientNotificationsBanner";

type ContractSummary = {
  tierLabel: string;
  totalFormatted: string;
  entryFormatted: string;
  phasesSummary: string;
  clauses: string[];
};

type FunnelConfigPublic = {
  live: {
    title: string;
    subtitle: string | null;
    scheduledAt: string | null;
    streamUrl: string | null;
    replayUrl: string | null;
  } | null;
  contract: { version: string; intro: string | null; clauses: string[] };
  checkout: { title: string | null; body: string | null; pixKey: string | null };
};

type NotificationRow = {
  id: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

type FunnelState = {
  step: "register" | "live" | "package" | "contract" | "checkout" | "delivery";
  liveOk: boolean;
  canSelectPackage: boolean;
  config: FunnelConfigPublic;
  lead: { source: string | null; liveAttended: boolean; packageTier: string | null } | null;
  pendingContractProject: { id: string; packageTier: string } | null;
  awaitingCheckoutProject: { id: string; packageTier: string; entryValueCents?: number } | null;
  activeProject: { id: string } | null;
  tiers: {
    id: PackageTierId;
    name: string;
    tagline: string;
    totalValueCents: number;
    entryValueCents: number;
    bullets: string[];
    contractSummary: ContractSummary;
  }[];
  deliveryProgress: {
    projectId: string;
    phases: {
      id: string;
      phaseKey: string;
      label: string;
      status: string;
      sortOrder: number;
      deliverablesDone: number;
      deliverablesTotal: number;
    }[];
  } | null;
  unreadNotificationCount: number;
  notifications: NotificationRow[];
};

function funnelStepKey(step: FunnelState["step"]) {
  return step === "register" ? "live" : step;
}

function formatLiveWhen(iso: string | null) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "full",
      timeStyle: "short"
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function ClientFunnelPanel() {
  const ui = AGENCY_FUNNEL_COPY.client;
  const [state, setState] = useState<FunnelState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tier, setTier] = useState<PackageTierId>("professional");
  const [attendedConfirm, setAttendedConfirm] = useState(false);
  const [acceptedName, setAcceptedName] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [checkoutAck, setCheckoutAck] = useState(false);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    const res = await apiGet<FunnelState>("/agency/client/funnel");
    setState(res);
    const fromLead = parsePackageTier(res.lead?.packageTier);
    setTier((prev) => {
      if (fromLead) return fromLead;
      if (res.tiers.length && !res.tiers.some((t) => t.id === prev)) return res.tiers[0]!.id;
      return prev;
    });
  }, []);

  useEffect(() => {
    void reload().catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar funil."));
  }, [reload]);

  async function confirmLive() {
    setBusy(true);
    setError(null);
    try {
      await apiPost("/agency/client/confirm-live", { attendedLiveConfirm: true as const });
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível confirmar.");
    } finally {
      setBusy(false);
    }
  }

  async function hire() {
    setBusy(true);
    setError(null);
    try {
      await apiPost("/agency/client/hire", { packageTier: tier });
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível continuar.");
    } finally {
      setBusy(false);
    }
  }

  async function sign(projectId: string) {
    if (!acceptTerms || acceptedName.trim().length < 3) {
      setError("Informe seu nome completo e aceite os termos.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await apiPost(`/agency/projects/${projectId}/sign-contract`, {
        acceptedName: acceptedName.trim(),
        acceptTerms: true as const
      });
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao assinar.");
    } finally {
      setBusy(false);
    }
  }

  async function completeCheckout(projectId: string) {
    if (!checkoutAck) {
      setError("Marque a confirmação de pagamento para continuar.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await apiPost(`/agency/projects/${projectId}/complete-checkout`, {
        acknowledgePayment: true as const
      });
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no checkout.");
    } finally {
      setBusy(false);
    }
  }

  if (!state) {
    return <p className="text-[var(--app-text-muted)]">Carregando funil…</p>;
  }

  const currentStep = funnelStepKey(state.step);
  const pendingId = state.pendingContractProject?.id;
  const checkoutId = state.awaitingCheckoutProject?.id;
  const pendingTier = parsePackageTier(state.pendingContractProject?.packageTier) ?? tier;
  const checkoutTier = parsePackageTier(state.awaitingCheckoutProject?.packageTier) ?? tier;
  const summary =
    state.tiers.find((t) => t.id === pendingTier)?.contractSummary ??
    state.tiers.find((t) => t.id === tier)?.contractSummary;
  const checkoutPkg = state.tiers.find((t) => t.id === checkoutTier);
  const contractClauses = state.config.contract.clauses?.length
    ? state.config.contract.clauses
    : summary?.clauses ?? [];
  const canConfirmLive =
    Boolean(state.lead) &&
    (state.lead?.source === "seed_launch" || state.config.live) &&
    attendedConfirm &&
    !state.liveOk;

  return (
    <div className="space-y-6">
      <ClientNotificationsBanner
        initial={state.notifications}
        unreadCount={state.unreadNotificationCount}
      />

      <section className="panel space-y-6 p-6">
        <div>
          <h2 className="text-xl font-semibold text-[var(--app-text)]">{ui.title}</h2>
          <p className="mt-1 text-sm text-[var(--app-text-muted)]">{ui.subtitle}</p>
          <ol className="mt-4 flex flex-wrap gap-2 text-xs">
            {AGENCY_FUNNEL_COPY.steps.map((s) => (
              <li
                key={s.key}
                className={`rounded-full px-3 py-1 ${
                  currentStep === s.key
                    ? "bg-sky-500/20 text-sky-700 dark:text-sky-200"
                    : "bg-[var(--app-hover)] text-[var(--app-text-muted)]"
                }`}
              >
                {s.label}
              </li>
            ))}
          </ol>
        </div>

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        {!state.lead ? (
          <div className="space-y-2 text-sm text-[var(--app-text-muted)]">
            <p>Não encontramos sua inscrição vinculada a esta conta.</p>
            <Link to="/lancamento" className="text-brand-primary hover:underline">
              Inscreva-se no lançamento com o mesmo e-mail do login →
            </Link>
          </div>
        ) : null}

        {(state.step === "live" || state.step === "register") && state.lead ? (
          <div className="space-y-4">
            {state.config.live ? (
              <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4 text-sm">
                <p className="font-semibold text-[var(--app-text)]">{state.config.live.title}</p>
                {state.config.live.subtitle ? (
                  <p className="mt-1 text-[var(--app-text-muted)]">{state.config.live.subtitle}</p>
                ) : null}
                {formatLiveWhen(state.config.live.scheduledAt) ? (
                  <p className="mt-2 text-xs text-[var(--app-text-subtle)]">
                    {formatLiveWhen(state.config.live.scheduledAt)}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-3">
                  {state.config.live.streamUrl ? (
                    <a
                      href={state.config.live.streamUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-primary hover:underline"
                    >
                      Entrar na live
                    </a>
                  ) : null}
                  {state.config.live.replayUrl ? (
                    <a
                      href={state.config.live.replayUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-primary hover:underline"
                    >
                      Ver replay
                    </a>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--app-text-muted)]">{ui.liveRequired}</p>
            )}
            {!state.liveOk ? (
              <label className="flex cursor-pointer gap-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-sky-500"
                  checked={attendedConfirm}
                  onChange={(e) => setAttendedConfirm(e.target.checked)}
                />
                Confirmo que participei (ou participarei) da aula ao vivo deste funil.
              </label>
            ) : (
              <p className="text-sm text-green-600 dark:text-green-400">Participação na live confirmada.</p>
            )}
            {canConfirmLive ? (
              <button type="button" className="btn-primary" disabled={busy} onClick={() => void confirmLive()}>
                Confirmar participação na live
              </button>
            ) : null}
          </div>
        ) : null}

        {state.step === "package" && state.canSelectPackage ? (
          <div className="space-y-4">
            <p className="text-sm font-medium">{ui.selectPackage}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {state.tiers.map((pkg) => (
                <button
                  key={pkg.id}
                  type="button"
                  className={`rounded-xl border p-4 text-left text-sm transition ${
                    tier === pkg.id
                      ? "border-sky-500 bg-sky-500/10"
                      : "border-[var(--app-border)] hover:border-sky-500/40"
                  }`}
                  onClick={() => setTier(pkg.id)}
                >
                  <p className="font-semibold">{pkg.name}</p>
                  <p className="mt-1 text-[var(--app-text-muted)]">{pkg.tagline}</p>
                  <p className="mt-2 text-xs font-medium">
                    {formatBRL(pkg.totalValueCents)} · entrada {formatBRL(pkg.entryValueCents)}
                  </p>
                </button>
              ))}
            </div>
            <button type="button" className="btn-primary" disabled={busy || !state.tiers.length} onClick={() => void hire()}>
              {ui.hireCta}
            </button>
          </div>
        ) : null}

        {state.step === "contract" && pendingId && summary ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">{ui.signTitle}</h3>
              <p className="text-sm text-[var(--app-text-muted)]">{ui.signSubtitle}</p>
              {state.config.contract.intro ? (
                <p className="mt-2 text-sm text-[var(--app-text-muted)]">{state.config.contract.intro}</p>
              ) : null}
            </div>
            <dl className="space-y-2 rounded-xl border border-[var(--app-border)] p-4 text-sm">
              <div>
                <dt className="text-[var(--app-text-subtle)]">Pacote</dt>
                <dd className="font-medium">{summary.tierLabel}</dd>
              </div>
              <div>
                <dt className="text-[var(--app-text-subtle)]">Investimento</dt>
                <dd>
                  {summary.totalFormatted} · entrada {summary.entryFormatted}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--app-text-subtle)]">Jornada</dt>
                <dd>{summary.phasesSummary}</dd>
              </div>
            </dl>
            <ul className="list-inside list-disc space-y-1 text-xs text-[var(--app-text-muted)]">
              {contractClauses.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <input
              className="input"
              placeholder={ui.signFieldLabel}
              value={acceptedName}
              onChange={(e) => setAcceptedName(e.target.value)}
            />
            <label className="flex cursor-pointer gap-3 text-xs">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-sky-500"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              />
              Li e aceito o contrato de prestação de serviços (versão {state.config.contract.version}).
            </label>
            <button type="button" className="btn-primary w-full sm:w-auto" disabled={busy} onClick={() => void sign(pendingId)}>
              {ui.signCta}
            </button>
          </div>
        ) : null}

        {state.step === "checkout" && checkoutId ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">{state.config.checkout.title?.trim() || ui.checkoutTitle}</h3>
              <p className="text-sm text-[var(--app-text-muted)]">
                {state.config.checkout.body?.trim() ||
                  "Efetue o pagamento da entrada para liberar a jornada de desenvolvimento."}
              </p>
            </div>
            {checkoutPkg ? (
              <p className="text-sm">
                Entrada: <strong>{formatBRL(checkoutPkg.entryValueCents)}</strong> ({checkoutPkg.name})
              </p>
            ) : null}
            {state.config.checkout.pixKey ? (
              <div className="rounded-xl border border-[var(--app-border)] p-4 text-sm">
                <p className="text-xs uppercase text-[var(--app-text-subtle)]">Chave PIX</p>
                <p className="mt-1 font-mono text-[var(--app-text)]">{state.config.checkout.pixKey}</p>
              </div>
            ) : null}
            <label className="flex cursor-pointer gap-3 text-xs">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-sky-500"
                checked={checkoutAck}
                onChange={(e) => setCheckoutAck(e.target.checked)}
              />
              {ui.checkoutAck}
            </label>
            <button
              type="button"
              className="btn-primary w-full sm:w-auto"
              disabled={busy}
              onClick={() => void completeCheckout(checkoutId)}
            >
              {ui.checkoutCta}
            </button>
          </div>
        ) : null}

        {state.step === "delivery" && state.activeProject ? (
          <div>
            <p className="text-sm text-green-600 dark:text-green-400">{ui.signedSuccess}</p>
            <Link
              to={`${AGENCY_APP_BASE}/projetos/${state.activeProject.id}`}
              className="btn-primary mt-4 inline-flex text-sm"
            >
              {ui.goToProject}
            </Link>
          </div>
        ) : null}
      </section>

      {state.deliveryProgress && state.step === "delivery" ? (
        <ClientDeliveryProgress projectId={state.deliveryProgress.projectId} phases={state.deliveryProgress.phases} />
      ) : null}
    </div>
  );
}
