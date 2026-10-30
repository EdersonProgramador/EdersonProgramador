import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AGENCY_APP_BASE,
  AGENCY_FUNNEL_COPY,
  PACKAGE_TIER_CONFIG,
  packageTierLabel,
  parsePackageTier,
  type PackageTierId
} from "@ederson-agencia/shared";
import { apiGet, apiPost } from "../../api";

type ContractSummary = {
  tierLabel: string;
  totalFormatted: string;
  entryFormatted: string;
  phasesSummary: string;
  clauses: string[];
};

type FunnelState = {
  step: "register" | "live" | "package" | "contract" | "delivery";
  liveOk: boolean;
  canSelectPackage: boolean;
  lead: { source: string | null; liveAttended: boolean; packageTier: string | null } | null;
  pendingContractProject: { id: string; packageTier: string } | null;
  activeProject: { id: string } | null;
  tiers: { id: PackageTierId; contractSummary: ContractSummary }[];
};

export function ClientFunnelPanel() {
  const ui = AGENCY_FUNNEL_COPY.client;
  const [state, setState] = useState<FunnelState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tier, setTier] = useState<PackageTierId>("professional");
  const [attendedConfirm, setAttendedConfirm] = useState(false);
  const [acceptedName, setAcceptedName] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    const res = await apiGet<FunnelState>("/agency/client/funnel");
    setState(res);
    const fromLead = parsePackageTier(res.lead?.packageTier);
    if (fromLead) setTier(fromLead);
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

  if (!state) {
    return <p className="text-[var(--app-text-muted)]">Carregando funil…</p>;
  }

  const pendingId = state.pendingContractProject?.id;
  const pendingTier = parsePackageTier(state.pendingContractProject?.packageTier) ?? tier;
  const summary =
    state.tiers.find((t) => t.id === pendingTier)?.contractSummary ??
    state.tiers.find((t) => t.id === tier)?.contractSummary;

  return (
    <section className="panel space-y-6 p-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--app-text)]">{ui.title}</h2>
        <p className="mt-1 text-sm text-[var(--app-text-muted)]">{ui.subtitle}</p>
        <ol className="mt-4 flex flex-wrap gap-2 text-xs">
          {AGENCY_FUNNEL_COPY.steps.map((s) => (
            <li
              key={s.key}
              className={`rounded-full px-3 py-1 ${
                state.step === s.key || (s.key === "account" && state.step === "register")
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

      {state.step === "live" ? (
        <div className="space-y-4">
          <p className="text-sm text-[var(--app-text-muted)]">{ui.liveRequired}</p>
          {state.lead?.source === "seed_launch" ? (
            <label className="flex cursor-pointer gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-sky-500"
                checked={attendedConfirm}
                onChange={(e) => setAttendedConfirm(e.target.checked)}
              />
              Confirmo que assisti à aula ao vivo deste lançamento.
            </label>
          ) : null}
        </div>
      ) : null}

      {state.step === "package" && state.canSelectPackage ? (
        <div className="space-y-4">
          <p className="text-sm font-medium">{ui.selectPackage}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {(["essential", "professional", "advanced"] as const).map((id) => (
              <button
                key={id}
                type="button"
                className={`rounded-xl border p-4 text-left text-sm transition ${
                  tier === id
                    ? "border-sky-500 bg-sky-500/10"
                    : "border-[var(--app-border)] hover:border-sky-500/40"
                }`}
                onClick={() => setTier(id)}
              >
                <p className="font-semibold">{packageTierLabel(id)}</p>
                <p className="mt-1 text-[var(--app-text-muted)]">{PACKAGE_TIER_CONFIG[id].tagline}</p>
              </button>
            ))}
          </div>
          <button type="button" className="btn-primary" disabled={busy} onClick={() => void hire()}>
            {ui.hireCta}
          </button>
        </div>
      ) : null}

      {state.step === "live" && attendedConfirm && !state.liveOk ? (
        <button type="button" className="btn-primary" disabled={busy} onClick={() => void confirmLive()}>
          Confirmar participação na live
        </button>
      ) : null}

      {state.step === "contract" && pendingId && summary ? (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">{ui.signTitle}</h3>
            <p className="text-sm text-[var(--app-text-muted)]">{ui.signSubtitle}</p>
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
            {summary.clauses.map((c) => (
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
            Li e aceito o contrato de prestação de serviços (versão digital app-zero-v1).
          </label>
          <button type="button" className="btn-primary w-full sm:w-auto" disabled={busy} onClick={() => void sign(pendingId)}>
            {ui.signCta}
          </button>
        </div>
      ) : null}
    </section>
  );
}
