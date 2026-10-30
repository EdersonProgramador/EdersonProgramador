import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AGENCY_APP_BASE,
  AGENCY_CONTRACT_VERSION,
  AGENCY_FUNNEL_COPY,
  contractSummaryForTier,
  formatBRL,
  PACKAGE_TIER_CONFIG,
  PACKAGE_TIER_IDS,
  parsePackageTier,
  type PackageTierId
} from "@ederson-agencia/shared";
import { ApiError, apiGet, apiPost } from "../../api";
import { useAgencySession } from "../../stores/authStore";
import { ClientDeliveryProgress } from "./ClientDeliveryProgress";
import { ClientNotificationsBanner } from "./ClientNotificationsBanner";
import { ClientFunnelStepper, FunnelStepPanel, streamEmbedUrl } from "./funnel-ui";

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

function defaultFunnelConfig(): FunnelConfigPublic {
  const summary = contractSummaryForTier("professional");
  return {
    live: null,
    contract: {
      version: AGENCY_CONTRACT_VERSION,
      intro: null,
      clauses: summary.clauses
    },
    checkout: { title: null, body: null, pixKey: null }
  };
}

function mergeFunnelConfig(partial?: Partial<FunnelConfigPublic> | null): FunnelConfigPublic {
  const base = defaultFunnelConfig();
  if (!partial) return base;
  return {
    live: partial.live ?? base.live,
    contract: {
      version: partial.contract?.version ?? base.contract.version,
      intro: partial.contract?.intro ?? base.contract.intro,
      clauses: partial.contract?.clauses?.length ? partial.contract.clauses : base.contract.clauses
    },
    checkout: {
      title: partial.checkout?.title ?? base.checkout.title,
      body: partial.checkout?.body ?? base.checkout.body,
      pixKey: partial.checkout?.pixKey ?? base.checkout.pixKey
    }
  };
}

type FunnelApiResponse = Partial<FunnelState> &
  Pick<FunnelState, "step" | "liveOk" | "canSelectPackage" | "lead"> & {
    config?: FunnelConfigPublic | null;
    tiers?: FunnelState["tiers"];
  };

function normalizeLegacyTier(
  row: Partial<FunnelState["tiers"][number]> & { id: PackageTierId; contractSummary: ContractSummary }
): FunnelState["tiers"][number] {
  const base = PACKAGE_TIER_CONFIG[row.id];
  return {
    id: row.id,
    name: row.name ?? base.name,
    tagline: row.tagline ?? base.tagline,
    totalValueCents: row.totalValueCents ?? base.totalValueCents,
    entryValueCents:
      row.entryValueCents ?? Math.round(base.totalValueCents * (base.entryPercent / 100)),
    bullets: row.bullets?.length ? row.bullets : [base.tagline],
    contractSummary: row.contractSummary
  };
}

function fallbackTiersFromCatalog(): FunnelState["tiers"] {
  return PACKAGE_TIER_IDS.map((id) => {
    const base = PACKAGE_TIER_CONFIG[id];
    return {
      id,
      name: base.name,
      tagline: base.tagline,
      totalValueCents: base.totalValueCents,
      entryValueCents: Math.round(base.totalValueCents * (base.entryPercent / 100)),
      bullets: [base.tagline],
      contractSummary: contractSummaryForTier(id)
    };
  });
}

async function normalizeClientFunnelState(raw: FunnelApiResponse): Promise<FunnelState> {
  let config = mergeFunnelConfig(raw.config);
  if (!raw.config) {
    try {
      const pub = await apiGet<FunnelConfigPublic>("/public/agency-funnel");
      config = mergeFunnelConfig(pub);
    } catch {
      // API antiga ou rota indisponível — defaults locais
    }
  }

  const tiersRaw = raw.tiers ?? [];
  const tiers =
    tiersRaw.length > 0
      ? tiersRaw.map((t) => normalizeLegacyTier(t as FunnelState["tiers"][number]))
      : fallbackTiersFromCatalog();

  return {
    step: raw.step,
    liveOk: raw.liveOk,
    canSelectPackage: raw.canSelectPackage,
    config,
    lead: raw.lead,
    pendingContractProject: raw.pendingContractProject ?? null,
    awaitingCheckoutProject: raw.awaitingCheckoutProject ?? null,
    activeProject: raw.activeProject ?? null,
    tiers,
    deliveryProgress: raw.deliveryProgress ?? null,
    unreadNotificationCount: raw.unreadNotificationCount ?? 0,
    notifications: raw.notifications ?? []
  };
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
  const agencyUser = useAgencySession()?.user;
  const [state, setState] = useState<FunnelState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tier, setTier] = useState<PackageTierId>("professional");
  const [attendedConfirm, setAttendedConfirm] = useState(false);
  const [acceptedName, setAcceptedName] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [checkoutAck, setCheckoutAck] = useState(false);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    const res = await apiGet<FunnelApiResponse>("/agency/client/funnel");
    const normalized = await normalizeClientFunnelState(res);
    setState(normalized);
    const fromLead = parsePackageTier(normalized.lead?.packageTier);
    setTier((prev) => {
      if (fromLead) return fromLead;
      if (normalized.tiers.length && !normalized.tiers.some((t) => t.id === prev)) {
        return normalized.tiers[0]!.id;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    if (agencyUser?.role !== "CLIENT") return;
    void reload().catch((err) =>
      setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Erro ao carregar funil.")
    );
  }, [reload, agencyUser?.role]);

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

  if (agencyUser?.role !== "CLIENT") {
    return null;
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
  const funnelConfig = state.config;
  const contractClauses = funnelConfig.contract.clauses.length
    ? funnelConfig.contract.clauses
    : summary?.clauses ?? [];
  const canConfirmLive =
    Boolean(state.lead) &&
    (state.lead?.source === "seed_launch" || funnelConfig.live) &&
    attendedConfirm &&
    !state.liveOk;

  const liveEmbed =
    funnelConfig.live?.streamUrl ? streamEmbedUrl(funnelConfig.live.streamUrl) : null;
  const replayEmbed =
    funnelConfig.live?.replayUrl ? streamEmbedUrl(funnelConfig.live.replayUrl) : null;

  async function copyPix() {
    const key = funnelConfig.checkout.pixKey?.trim();
    if (!key) return;
    try {
      await navigator.clipboard.writeText(key);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-6">
      <ClientNotificationsBanner
        initial={state.notifications}
        unreadCount={state.unreadNotificationCount}
      />

      <section className="panel overflow-hidden p-6 sm:p-8">
        <div className="mb-2">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--app-text)]">{ui.title}</h2>
          <p className="mt-2 text-sm text-[var(--app-text-muted)]">{ui.subtitle}</p>
        </div>

        <ClientFunnelStepper currentKey={currentStep} liveOk={state.liveOk} />

        {error ? (
          <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-600 dark:text-red-300">
            {error}
          </p>
        ) : null}

        {(state.step === "live" || state.step === "register") ? (
          <FunnelStepPanel eyebrow="Etapa 1" title={ui.stepLiveTitle} description={ui.stepLiveDesc}>
            {funnelConfig.live ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-[var(--app-border)] bg-black/20 p-4">
                  <p className="text-lg font-semibold">{funnelConfig.live.title}</p>
                  {funnelConfig.live.subtitle ? (
                    <p className="mt-1 text-sm text-[var(--app-text-muted)]">{funnelConfig.live.subtitle}</p>
                  ) : null}
                  {formatLiveWhen(funnelConfig.live.scheduledAt) ? (
                    <p className="mt-2 text-xs font-medium uppercase tracking-wide text-sky-600 dark:text-sky-400">
                      {formatLiveWhen(funnelConfig.live.scheduledAt)}
                    </p>
                  ) : null}
                </div>
                {liveEmbed ? (
                  <div className="aspect-video overflow-hidden rounded-xl border border-[var(--app-border)] shadow-lg">
                    <iframe
                      title="Live de apresentação"
                      src={liveEmbed}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : funnelConfig.live.streamUrl ? (
                  <a href={funnelConfig.live.streamUrl} target="_blank" rel="noreferrer" className="btn-primary inline-flex">
                    Abrir live em nova aba
                  </a>
                ) : null}
                {replayEmbed ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--app-text-subtle)]">Replay</p>
                    <div className="aspect-video overflow-hidden rounded-xl border border-[var(--app-border)]">
                      <iframe title="Replay" src={replayEmbed} className="h-full w-full" allowFullScreen />
                    </div>
                  </div>
                ) : funnelConfig.live.replayUrl ? (
                  <a href={funnelConfig.live.replayUrl} target="_blank" rel="noreferrer" className="btn-secondary inline-flex text-sm">
                    Ver replay
                  </a>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-[var(--app-text-muted)]">{ui.liveRequired}</p>
            )}
            {!state.liveOk ? (
              <label className="flex cursor-pointer gap-3 rounded-xl border border-dashed border-[var(--app-border)] p-4 text-sm">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-sky-500"
                  checked={attendedConfirm}
                  onChange={(e) => setAttendedConfirm(e.target.checked)}
                />
                Confirmo que assisti (ou vou assistir) à live de apresentação para avançar ao pacote.
              </label>
            ) : (
              <p className="rounded-lg bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Live confirmada — você pode escolher o pacote.
              </p>
            )}
            {canConfirmLive ? (
              <button type="button" className="btn-primary w-full sm:w-auto" disabled={busy} onClick={() => void confirmLive()}>
                Confirmar participação e continuar
              </button>
            ) : null}
          </FunnelStepPanel>
        ) : null}

        {state.step === "package" && state.canSelectPackage ? (
          <FunnelStepPanel eyebrow="Etapa 2" title={ui.stepPackageTitle} description={ui.stepPackageDesc}>
            <div className="grid gap-4 lg:grid-cols-3">
              {state.tiers.map((pkg) => {
                const selected = tier === pkg.id;
                const featured = pkg.id === "professional";
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    className={`relative flex flex-col rounded-2xl border p-5 text-left transition ${
                      selected
                        ? "border-sky-500 ring-2 ring-sky-500/40"
                        : "border-[var(--app-border)] hover:border-sky-500/50"
                    } ${featured ? "bg-gradient-to-b from-violet-500/10 to-transparent" : "bg-[var(--app-hover)]/30"}`}
                    onClick={() => setTier(pkg.id)}
                  >
                    {featured ? (
                      <span className="absolute -top-2.5 right-4 rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        Recomendado
                      </span>
                    ) : null}
                    <p className="text-lg font-semibold">{pkg.name}</p>
                    <p className="mt-2 flex-1 text-sm text-[var(--app-text-muted)]">{pkg.tagline}</p>
                    <p className="mt-4 font-display text-2xl font-bold text-[var(--app-text)]">
                      {formatBRL(pkg.totalValueCents)}
                    </p>
                    <p className="text-xs text-[var(--app-text-subtle)]">Entrada {formatBRL(pkg.entryValueCents)}</p>
                    <ul className="mt-3 space-y-1 text-xs text-[var(--app-text-muted)]">
                      {pkg.bullets.slice(0, 3).map((b) => (
                        <li key={b}>· {b}</li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              className="btn-primary mt-2 w-full sm:w-auto"
              disabled={busy || !state.tiers.length}
              onClick={() => void hire()}
            >
              {ui.hireCta}
            </button>
          </FunnelStepPanel>
        ) : null}

        {state.step === "contract" && pendingId && summary ? (
          <FunnelStepPanel eyebrow="Etapa 3" title={ui.stepContractTitle} description={ui.stepContractDesc}>
            {funnelConfig.contract.intro ? (
              <p className="text-sm text-[var(--app-text-muted)]">{funnelConfig.contract.intro}</p>
            ) : null}
            <p className="text-sm text-[var(--app-text-muted)]">{ui.signSubtitle}</p>
            <dl className="grid gap-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-hover)]/40 p-5 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase text-[var(--app-text-subtle)]">Pacote</dt>
                <dd className="mt-1 font-semibold">{summary.tierLabel}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-[var(--app-text-subtle)]">Investimento</dt>
                <dd className="mt-1 font-semibold">
                  {summary.totalFormatted}
                  <span className="block text-xs font-normal text-[var(--app-text-muted)]">
                    Entrada {summary.entryFormatted}
                  </span>
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-xs uppercase text-[var(--app-text-subtle)]">Jornada</dt>
                <dd className="mt-1 text-[var(--app-text-muted)]">{summary.phasesSummary}</dd>
              </div>
            </dl>
            <ul className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-[var(--app-border)] p-4 text-xs leading-relaxed text-[var(--app-text-muted)]">
              {contractClauses.map((c) => (
                <li key={c} className="flex gap-2">
                  <span className="text-sky-500">•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
            <input
              className="input"
              placeholder={ui.signFieldLabel}
              value={acceptedName}
              onChange={(e) => setAcceptedName(e.target.value)}
            />
            <label className="flex cursor-pointer gap-3 rounded-lg border border-[var(--app-border)] p-3 text-xs">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-sky-500"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              />
              Li e aceito o contrato (versão {funnelConfig.contract.version}).
            </label>
            <button type="button" className="btn-primary w-full sm:w-auto" disabled={busy} onClick={() => void sign(pendingId)}>
              {ui.signCta}
            </button>
          </FunnelStepPanel>
        ) : null}

        {state.step === "checkout" && checkoutId ? (
          <FunnelStepPanel
            eyebrow="Etapa 4"
            title={funnelConfig.checkout.title?.trim() || ui.stepCheckoutTitle}
            description={funnelConfig.checkout.body?.trim() || ui.stepCheckoutDesc}
          >
            {checkoutPkg ? (
              <div className="rounded-xl bg-gradient-to-br from-sky-500/15 to-violet-500/10 p-6 text-center">
                <p className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">Valor da entrada</p>
                <p className="mt-2 font-display text-4xl font-bold text-[var(--app-text)]">
                  {formatBRL(checkoutPkg.entryValueCents)}
                </p>
                <p className="mt-1 text-sm text-[var(--app-text-muted)]">{checkoutPkg.name}</p>
              </div>
            ) : null}
            {funnelConfig.checkout.pixKey ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--app-border)] p-4">
                <div>
                  <p className="text-xs uppercase text-[var(--app-text-subtle)]">PIX</p>
                  <p className="mt-1 font-mono text-sm text-[var(--app-text)]">{funnelConfig.checkout.pixKey}</p>
                </div>
                <button type="button" className="btn-secondary text-xs" onClick={() => void copyPix()}>
                  Copiar chave
                </button>
              </div>
            ) : null}
            <label className="flex cursor-pointer gap-3 rounded-lg border border-dashed border-[var(--app-border)] p-4 text-xs">
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
          </FunnelStepPanel>
        ) : null}

        {state.step === "delivery" && state.activeProject ? (
          <FunnelStepPanel eyebrow="Etapa 5" title="Projeto liberado" description={ui.signedSuccess}>
            <Link
              to={`${AGENCY_APP_BASE}/projetos/${state.activeProject.id}`}
              className="btn-primary inline-flex w-full justify-center sm:w-auto"
            >
              {ui.goToProject}
            </Link>
          </FunnelStepPanel>
        ) : null}
      </section>

      {state.deliveryProgress && state.step === "delivery" ? (
        <ClientDeliveryProgress projectId={state.deliveryProgress.projectId} phases={state.deliveryProgress.phases} />
      ) : null}
    </div>
  );
}
