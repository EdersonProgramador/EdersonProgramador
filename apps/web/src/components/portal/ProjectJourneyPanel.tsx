import {
  DELIVERABLE_STATUS_LABELS,
  JOURNEY_PHASES,
  PACKAGE_TIER_CONFIG,
  PHASE_STATUS_LABELS,
  currentPhaseIndex,
  formatBRL,
  nextUpgradeTier,
  packageTierLabel,
  parsePackageTier,
  projectProgressPercent,
  type PackageTierId
} from "@ederson-agencia/shared";
import { Check, Circle } from "lucide-react";

export type JourneyDeliverable = {
  id: string;
  label: string;
  status: string;
  feedbackNote?: string | null;
  completedAt?: string | null;
};

export type JourneyPhase = {
  id: string;
  phaseKey: string;
  label: string;
  sortOrder: number;
  daysPlanned: number;
  status: string;
  notes?: string | null;
  deliverables: JourneyDeliverable[];
};

export type JourneyProject = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  paymentStatus: string;
  packageTier: string;
  totalValueCents: number;
  entryValueCents: number;
  phases: JourneyPhase[];
  upgradeRequests?: Array<{
    id: string;
    fromTier: string;
    toTier: string;
    status: string;
    clientMessage?: string | null;
    adminNote?: string | null;
    createdAt: string;
  }>;
};

type Role = "ADMIN" | "CLIENT" | "FREELANCER";

type ProjectJourneyPanelProps = {
  project: JourneyProject;
  role: Role;
  onPhaseStatus: (phaseId: string, status: string) => Promise<void>;
  onDeliverableStatus: (deliverableId: string, status: string, feedbackNote?: string) => Promise<void>;
  onRequestUpgrade?: (toTier: PackageTierId, message?: string) => Promise<void>;
  onReviewUpgrade?: (requestId: string, status: "APPROVED" | "REJECTED", adminNote?: string) => Promise<void>;
};

function phaseMeta(phaseKey: string) {
  return JOURNEY_PHASES.find((p) => p.key === phaseKey);
}

export function ProjectJourneyPanel({
  project,
  role,
  onPhaseStatus,
  onDeliverableStatus,
  onRequestUpgrade,
  onReviewUpgrade
}: ProjectJourneyPanelProps) {
  const tier = parsePackageTier(project.packageTier) ?? "professional";
  const tierCfg = PACKAGE_TIER_CONFIG[tier];
  const allDeliverables = project.phases.flatMap((p) => p.deliverables);
  const progress = projectProgressPercent(project.phases, allDeliverables);
  const activeIndex = currentPhaseIndex(project.phases);
  const upgradeTarget = nextUpgradeTier(tier);
  const pendingUpgrade = project.upgradeRequests?.find((r) => r.status === "PENDING");

  const canEditDeliverables = role === "ADMIN" || role === "FREELANCER";
  const canAdvancePhase = role === "ADMIN" || role === "FREELANCER";
  const canApprovePhase = role === "CLIENT";

  return (
    <div className="space-y-8">
      <header className="panel space-y-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">
              Pacote {tierCfg.name} · {tierCfg.tagline}
            </p>
            <h1 className="text-2xl font-bold text-[var(--app-text)]">{project.title}</h1>
            {project.description ? (
              <p className="mt-2 text-sm text-[var(--app-text-muted)]">{project.description}</p>
            ) : null}
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold text-[var(--app-text)]">{formatBRL(project.totalValueCents)}</p>
            <p className="text-[var(--app-text-muted)]">
              Entrada {formatBRL(project.entryValueCents)} · {project.paymentStatus}
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="font-medium text-[var(--app-text)]">Progresso geral</span>
            <span className="text-[var(--app-text-muted)]">{progress}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--app-hover)]">
            <div
              className="h-full rounded-full bg-sky-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--app-text-subtle)]">
            Etapa atual:{" "}
            <span className="font-medium text-[var(--app-text-muted)]">
              {project.phases[activeIndex]?.label ?? "—"}
            </span>
          </p>
        </div>

        <ol className="flex flex-wrap gap-2" aria-label="Etapas do projeto">
          {project.phases.map((phase, index) => {
            const meta = phaseMeta(phase.phaseKey);
            const isCurrent = index === activeIndex;
            const isDone = phase.status === "DONE" || phase.status === "APPROVED";
            return (
              <li
                key={phase.id}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${
                  isCurrent
                    ? "border-sky-500/50 bg-sky-500/10 text-sky-700 dark:text-sky-200"
                    : isDone
                      ? "border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                      : "border-[var(--app-border)] text-[var(--app-text-subtle)]"
                }`}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                {meta?.shortLabel ?? phase.phaseKey}
              </li>
            );
          })}
        </ol>
      </header>

      {role === "CLIENT" && upgradeTarget && onRequestUpgrade ? (
        <section className="panel p-6">
          <h2 className="text-lg font-semibold text-[var(--app-text)]">Upgrade de pacote</h2>
          <p className="mt-2 text-sm text-[var(--app-text-muted)]">
            Precisa de mais escopo? Solicite migração para o pacote{" "}
            <strong>{PACKAGE_TIER_CONFIG[upgradeTarget].name}</strong>. A proposta será revisada antes de qualquer
            cobrança adicional.
          </p>
          {pendingUpgrade ? (
            <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-[var(--app-text-muted)]">
              Solicitação em análise ({packageTierLabel(parsePackageTier(pendingUpgrade.toTier) ?? "professional")}).
            </p>
          ) : (
            <button
              type="button"
              className="btn-primary mt-4"
              onClick={() => {
                const message = window.prompt("Descreva o que você precisa no upgrade (opcional):") ?? undefined;
                void onRequestUpgrade(upgradeTarget, message || undefined);
              }}
            >
              Solicitar upgrade para {PACKAGE_TIER_CONFIG[upgradeTarget].name}
            </button>
          )}
        </section>
      ) : null}

      {role === "ADMIN" && pendingUpgrade && onReviewUpgrade ? (
        <section className="panel border-amber-500/30 p-6">
          <h2 className="text-lg font-semibold text-[var(--app-text)]">Upgrade pendente</h2>
          <p className="mt-2 text-sm text-[var(--app-text-muted)]">
            Cliente solicitou {packageTierLabel(parsePackageTier(pendingUpgrade.fromTier) ?? "essential")} →{" "}
            {packageTierLabel(parsePackageTier(pendingUpgrade.toTier) ?? "professional")}
          </p>
          {pendingUpgrade.clientMessage ? (
            <p className="mt-2 text-sm italic text-[var(--app-text-muted)]">“{pendingUpgrade.clientMessage}”</p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                const note = window.prompt("Observação para o cliente (opcional):") ?? undefined;
                void onReviewUpgrade(pendingUpgrade.id, "APPROVED", note || undefined);
              }}
            >
              Aprovar upgrade
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                const note = window.prompt("Motivo da recusa (opcional):") ?? undefined;
                void onReviewUpgrade(pendingUpgrade.id, "REJECTED", note || undefined);
              }}
            >
              Recusar
            </button>
          </div>
        </section>
      ) : null}

      <div className="space-y-6">
        {project.phases.map((phase, index) => {
          const meta = phaseMeta(phase.phaseKey);
          const phaseProgress = projectProgressPercent([phase], phase.deliverables);
          return (
            <article key={phase.id} className="panel overflow-hidden">
              <div className="border-b border-[var(--app-border)] p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-[var(--app-text-subtle)]">
                      Etapa {String(index + 1).padStart(2, "0")}
                      {meta ? ` · ${meta.shortLabel}` : ""}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-[var(--app-text)]">{phase.label}</h3>
                    <p className="mt-1 text-sm text-[var(--app-text-muted)]">
                      {PHASE_STATUS_LABELS[phase.status] ?? phase.status}
                      {phase.notes ? ` · ${phase.notes}` : ""}
                    </p>
                  </div>
                  <div className="min-w-[140px]">
                    <div className="flex justify-between text-xs text-[var(--app-text-subtle)]">
                      <span>Entregáveis</span>
                      <span>{phaseProgress}%</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--app-hover)]">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${phaseProgress}%` }} />
                    </div>
                  </div>
                </div>

                {(canAdvancePhase || canApprovePhase) && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {canAdvancePhase ? (
                      <select
                        className="input max-w-xs text-sm"
                        value={phase.status}
                        onChange={(e) => void onPhaseStatus(phase.id, e.target.value)}
                      >
                        {["PENDING", "IN_PROGRESS", "WAITING_APPROVAL", "APPROVED", "DONE"].map((status) => (
                          <option key={status} value={status}>
                            {PHASE_STATUS_LABELS[status] ?? status}
                          </option>
                        ))}
                      </select>
                    ) : null}
                    {canApprovePhase && phase.status === "WAITING_APPROVAL" ? (
                      <button
                        type="button"
                        className="btn-primary text-sm"
                        onClick={() => void onPhaseStatus(phase.id, "APPROVED")}
                      >
                        Aprovar esta etapa
                      </button>
                    ) : null}
                  </div>
                )}
              </div>

              <ul className="divide-y divide-[var(--app-border)]">
                {phase.deliverables.map((item) => (
                  <li key={item.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 sm:px-6">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[var(--app-text)]">{item.label}</p>
                      <p className="mt-0.5 text-xs text-[var(--app-text-subtle)]">
                        {DELIVERABLE_STATUS_LABELS[item.status] ?? item.status}
                        {item.completedAt
                          ? ` · ${new Date(item.completedAt).toLocaleDateString("pt-BR")}`
                          : ""}
                      </p>
                      {item.feedbackNote ? (
                        <p className="mt-2 text-xs text-[var(--app-text-muted)]">{item.feedbackNote}</p>
                      ) : null}
                    </div>
                    {canEditDeliverables ? (
                      <select
                        className="input max-w-[180px] text-xs"
                        value={item.status}
                        onChange={(e) => {
                          const note =
                            e.target.value === "DONE"
                              ? window.prompt("Feedback da entrega (opcional):") ?? undefined
                              : undefined;
                          void onDeliverableStatus(item.id, e.target.value, note);
                        }}
                      >
                        {["PENDING", "IN_PROGRESS", "DONE"].map((status) => (
                          <option key={status} value={status}>
                            {DELIVERABLE_STATUS_LABELS[status] ?? status}
                          </option>
                        ))}
                      </select>
                    ) : item.status === "DONE" ? (
                      <Check className="h-5 w-5 shrink-0 text-emerald-500" aria-label="Entregue" />
                    ) : (
                      <Circle className="h-5 w-5 shrink-0 text-[var(--app-text-subtle)]" aria-label="Pendente" />
                    )}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </div>
  );
}
