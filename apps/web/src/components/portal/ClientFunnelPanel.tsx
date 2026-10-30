import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AGENCY_APP_BASE,
  AGENCY_CONTRACT_VERSION,
  AGENCY_FUNNEL_COPY,
  composeAgencyContractDocument,
  contractKindForTier,
  contractSummaryForTier,
  formatBRL,
  isPartnershipTier,
  normalizePartyDetails,
  validatePartyDetails,
  type AgencyContractPartyDetails,
  PACKAGE_TIER_CONFIG,
  PACKAGE_TIER_IDS,
  parsePackageTier,
  type PackageTierId
} from "@ederson-agencia/shared";
import { ApiError, apiGet, apiPost } from "../../api";
import { useAgencySession } from "../../stores/authStore";
import { ClientDeliveryProgress } from "./ClientDeliveryProgress";
import { ClientNotificationsBanner } from "./ClientNotificationsBanner";
import {
  ClientFunnelContractPartyForm,
  createInitialPartyDetails
} from "./ClientFunnelContractPartyForm";
import { ClientFunnelContractPreview } from "./ClientFunnelContractPreview";
import { ClientFunnelStepper, funnelStepIndex, FunnelStepPanel, streamEmbedUrl } from "./funnel-ui";

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
  clientContractProfile: {
    name: string;
    email: string;
    company: string | null;
    phone: string | null;
  } | null;
};

function funnelStepKey(step: FunnelState["step"]) {
  return step === "register" ? "live" : step;
}

/** Etapa do painel alinhada ao stepper após cada confirmação (API + fallback local). */
function resolveDisplayStep(state: FunnelState): FunnelState["step"] {
  const base = state.step === "register" ? "live" : state.step;
  if (!state.liveOk || base !== "live") return base;
  if (state.activeProject) return "delivery";
  if (state.awaitingCheckoutProject) return "checkout";
  if (state.pendingContractProject) return "contract";
  return "package";
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
    clientContractProfile?: FunnelState["clientContractProfile"];
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
    notifications: raw.notifications ?? [],
    clientContractProfile: raw.clientContractProfile ?? null
  };
}

function formatFunnelApiError(message: string, ui: (typeof AGENCY_FUNNEL_COPY)["client"]) {
  if (/inscrição não encontrada/i.test(message)) {
    return ui.staleLeadLinkError;
  }
  return message;
}

function formatSignContractError(message: string) {
  if (message === "Required" || message === "Invalid input") {
    return "Preencha todos os campos obrigatórios do contratante (CPF/CNPJ, RG, endereço completo) e aceite os termos.";
  }
  if (/acceptedName|partyDetails/i.test(message)) {
    return "Atualize a página e preencha o formulário completo do contratante. Se persistir, a API em produção pode estar desatualizada.";
  }
  return message;
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
  const [partyDetails, setPartyDetails] = useState<AgencyContractPartyDetails | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [checkoutAck, setCheckoutAck] = useState(false);
  const [busy, setBusy] = useState(false);
  const [stepSuccess, setStepSuccess] = useState<string | null>(null);
  const stepPanelRef = useRef<HTMLDivElement>(null);
  const prevStepRef = useRef<string | null>(null);

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

  useEffect(() => {
    if (!state) return;
    const displayStep = resolveDisplayStep(state);
    const stepKey = funnelStepKey(displayStep);
    if (prevStepRef.current !== null && prevStepRef.current !== stepKey) {
      stepPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    prevStepRef.current = stepKey;
  }, [state]);

  useEffect(() => {
    if (!state || resolveDisplayStep(state) !== "contract") return;
    const profile = state.clientContractProfile;
    const email = profile?.email ?? agencyUser?.email ?? "";
    const name = profile?.name ?? agencyUser?.name ?? "";
    const phone = profile?.phone ?? agencyUser?.phone ?? "";
    setPartyDetails((prev) => {
      if (prev && prev.email === email) return prev;
      return createInitialPartyDetails(email, name, phone);
    });
  }, [state, agencyUser?.email, agencyUser?.name, agencyUser?.phone]);

  async function confirmLive() {
    setBusy(true);
    setError(null);
    setStepSuccess(null);
    try {
      await reload();
      try {
        await apiPost("/agency/client/funnel/sync-lead", {});
      } catch {
        /* rota ausente em API antiga — confirm-live fará ensure na versão nova */
      }
      await apiPost("/agency/client/confirm-live", { attendedLiveConfirm: true as const });
      setStepSuccess(ui.stepCompleteLive);
      await reload();
    } catch (err) {
      const raw = err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Não foi possível confirmar.";
      setError(formatFunnelApiError(raw, ui));
    } finally {
      setBusy(false);
    }
  }

  async function hire() {
    setBusy(true);
    setError(null);
    setStepSuccess(null);
    try {
      await apiPost("/agency/client/hire", { packageTier: tier });
      setStepSuccess(ui.stepCompletePackage);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível continuar.");
    } finally {
      setBusy(false);
    }
  }

  async function sign(projectId: string) {
    if (!partyDetails) {
      setError("Carregue os dados do contratante.");
      return;
    }
    const normalizedParty = normalizePartyDetails(partyDetails);
    const partyError = validatePartyDetails(normalizedParty);
    if (!acceptTerms) {
      setError("Marque que leu e aceita a minuta do contrato.");
      return;
    }
    if (partyError) {
      setError(partyError);
      return;
    }
    setBusy(true);
    setError(null);
    setStepSuccess(null);
    try {
      await apiPost(`/agency/projects/${projectId}/sign-contract`, {
        acceptTerms: true as const,
        partyDetails: normalizedParty
      });
      setStepSuccess(ui.stepCompleteContract);
      await reload();
    } catch (err) {
      const raw = err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Falha ao assinar.";
      setError(formatSignContractError(raw));
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
    setStepSuccess(null);
    try {
      await apiPost(`/agency/projects/${projectId}/complete-checkout`, {
        acknowledgePayment: true as const
      });
      setStepSuccess(ui.stepCompleteCheckout);
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

  const displayStep = resolveDisplayStep(state);
  const currentStep = funnelStepKey(displayStep);
  const pendingId = state.pendingContractProject?.id;
  const checkoutId = state.awaitingCheckoutProject?.id;
  const pendingTier = parsePackageTier(state.pendingContractProject?.packageTier) ?? tier;
  const checkoutTier = parsePackageTier(state.awaitingCheckoutProject?.packageTier) ?? tier;
  const summary =
    state.tiers.find((t) => t.id === pendingTier)?.contractSummary ??
    state.tiers.find((t) => t.id === tier)?.contractSummary;
  const checkoutPkg = state.tiers.find((t) => t.id === checkoutTier);
  const pendingPkg = state.tiers.find((t) => t.id === pendingTier);
  const funnelConfig = state.config;
  const contractClauses = funnelConfig.contract.clauses.length
    ? funnelConfig.contract.clauses
    : summary?.clauses ?? [];
  const showLiveConfirm = attendedConfirm && !state.liveOk;
  const currentIdx = funnelStepIndex(currentStep);
  const stepEyebrow = (n: number) => `Etapa ${n} de ${AGENCY_FUNNEL_COPY.steps.length}`;

  const liveEmbed =
    funnelConfig.live?.streamUrl ? streamEmbedUrl(funnelConfig.live.streamUrl) : null;
  const replayEmbed =
    funnelConfig.live?.replayUrl ? streamEmbedUrl(funnelConfig.live.replayUrl) : null;

  const contractPreview =
    summary && pendingPkg && partyDetails
      ? composeAgencyContractDocument({
          contractKind: contractKindForTier(pendingTier),
          packageTier: pendingTier,
          partyDetails,
          packageLabel: summary.tierLabel,
          totalValueCents: pendingPkg.totalValueCents,
          entryValueCents: pendingPkg.entryValueCents,
          phasesSummary: summary.phasesSummary,
          contractVersion: funnelConfig.contract.version,
          intro: funnelConfig.contract.intro,
          clauses: contractClauses
        })
      : null;

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

        {stepSuccess ? (
          <p className="mb-4 rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-800 dark:text-emerald-200">
            {stepSuccess}
          </p>
        ) : null}

        {currentIdx > 0 ? (
          <p className="mb-4 text-xs text-[var(--app-text-muted)]">
            Concluídas:{" "}
            {AGENCY_FUNNEL_COPY.steps
              .slice(0, currentIdx)
              .map((s) => s.label)
              .join(" → ")}
          </p>
        ) : null}

        {error ? (
          <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-600 dark:text-red-300">
            {error}
          </p>
        ) : null}

        <div ref={stepPanelRef} className="scroll-mt-28">
        {displayStep === "live" ? (
          <FunnelStepPanel eyebrow={stepEyebrow(1)} title={ui.stepLiveTitle} description={ui.stepLiveDesc}>
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
            {showLiveConfirm ? (
              <button type="button" className="btn-primary w-full sm:w-auto" disabled={busy} onClick={() => void confirmLive()}>
                {ui.liveConfirmCta}
              </button>
            ) : null}
            {!state.liveOk && attendedConfirm && !funnelConfig.live && state.lead?.source !== "seed_launch" ? (
              <p className="text-xs text-[var(--app-text-muted)]">
                Se a confirmação falhar, aguarde o admin publicar a live ou marcar sua participação.
              </p>
            ) : null}
          </FunnelStepPanel>
        ) : null}

        {displayStep === "package" && state.canSelectPackage ? (
          <FunnelStepPanel eyebrow={stepEyebrow(2)} title={ui.stepPackageTitle} description={ui.stepPackageDesc}>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {state.tiers.map((pkg) => {
                const selected = tier === pkg.id;
                const featured = pkg.id === "professional";
                const partnership = isPartnershipTier(pkg.id);
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    className={`relative flex flex-col rounded-2xl border p-5 text-left transition ${
                      selected
                        ? "border-sky-500 ring-2 ring-sky-500/40"
                        : "border-[var(--app-border)] hover:border-sky-500/50"
                    } ${partnership ? "bg-gradient-to-b from-amber-500/10 to-transparent" : featured ? "bg-gradient-to-b from-violet-500/10 to-transparent" : "bg-[var(--app-hover)]/30"}`}
                    onClick={() => setTier(pkg.id)}
                  >
                    {featured ? (
                      <span className="absolute -top-2.5 right-4 rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        Recomendado
                      </span>
                    ) : null}
                    {partnership ? (
                      <span className="absolute -top-2.5 right-4 rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        Parceria
                      </span>
                    ) : null}
                    <p className="text-lg font-semibold">{pkg.name}</p>
                    <p className="mt-2 flex-1 text-sm text-[var(--app-text-muted)]">{pkg.tagline}</p>
                    {partnership ? (
                      <>
                        <p className="mt-4 text-sm font-semibold text-[var(--app-text)]">Divisão de receitas</p>
                        <p className="font-display text-xl font-bold text-[var(--app-text)]">
                          Setup {formatBRL(pkg.entryValueCents)}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="mt-4 font-display text-2xl font-bold text-[var(--app-text)]">
                          {formatBRL(pkg.totalValueCents)}
                        </p>
                        <p className="text-xs text-[var(--app-text-subtle)]">Entrada {formatBRL(pkg.entryValueCents)}</p>
                      </>
                    )}
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

        {displayStep === "package" && state.liveOk && !state.canSelectPackage ? (
          <FunnelStepPanel eyebrow={stepEyebrow(2)} title="Pacote em andamento" description="Você já possui um projeto aberto neste funil. Continue na etapa indicada acima ou fale com a equipe.">
            <p className="text-sm text-[var(--app-text-muted)]">Etapa atual: {currentStep}.</p>
          </FunnelStepPanel>
        ) : null}

        {displayStep === "contract" && pendingId && summary ? (
          <FunnelStepPanel eyebrow={stepEyebrow(3)} title={ui.stepContractTitle} description={ui.stepContractDesc}>
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
            {contractPreview ? (
              <ClientFunnelContractPreview document={contractPreview} title={ui.signContractPreviewTitle} />
            ) : null}
            {partyDetails ? (
              <ClientFunnelContractPartyForm details={partyDetails} onChange={setPartyDetails} />
            ) : null}
            <label className="flex cursor-pointer gap-3 rounded-lg border border-[var(--app-border)] p-3 text-xs">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-sky-500"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              />
              Li e aceito a minuta acima (
              {contractKindForTier(pendingTier) === "partnership"
                ? "Contrato de Parceria Comercial"
                : "Contrato de Prestação de Serviços"}{" "}
              · versão {funnelConfig.contract.version}).
            </label>
            <button type="button" className="btn-primary w-full sm:w-auto" disabled={busy} onClick={() => void sign(pendingId)}>
              {ui.signCta}
            </button>
          </FunnelStepPanel>
        ) : null}

        {displayStep === "checkout" && checkoutId ? (
          <FunnelStepPanel
            eyebrow={stepEyebrow(4)}
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

        {displayStep === "delivery" && state.activeProject ? (
          <FunnelStepPanel eyebrow={stepEyebrow(5)} title="Projeto liberado" description={ui.signedSuccess}>
            <Link
              to={`${AGENCY_APP_BASE}/projetos/${state.activeProject.id}`}
              className="btn-primary inline-flex w-full justify-center sm:w-auto"
            >
              {ui.goToProject}
            </Link>
          </FunnelStepPanel>
        ) : null}
        </div>
      </section>

      {state.deliveryProgress && displayStep === "delivery" ? (
        <ClientDeliveryProgress projectId={state.deliveryProgress.projectId} phases={state.deliveryProgress.phases} />
      ) : null}
    </div>
  );
}
