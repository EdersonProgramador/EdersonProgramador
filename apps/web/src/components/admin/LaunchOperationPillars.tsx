import {
  LAUNCH_OPERATION_PILLAR_ORDER,
  LAUNCH_OPERATION_PILLARS,
  launchOperationPillarProgress,
  type LaunchOperationPillarId,
  type LaunchOperationPhase
} from "@ederson-agencia/shared";

const PILLAR_CLASS: Record<LaunchOperationPillarId, string> = {
  branding: "agency-op-pillar--branding",
  "marketing-tech": "agency-op-pillar--tech",
  formula: "agency-op-pillar--formula"
};

export function LaunchOperationPillarsOverview({
  checked,
  compact
}: {
  checked: Record<string, boolean>;
  compact?: boolean;
}) {
  return (
    <div className={`agency-op-pillars${compact ? " agency-op-pillars--compact" : ""}`}>
      {LAUNCH_OPERATION_PILLAR_ORDER.map((id) => {
        const meta = LAUNCH_OPERATION_PILLARS[id];
        const prog = launchOperationPillarProgress(id, checked);
        return (
          <article key={id} className={`agency-op-pillar ${PILLAR_CLASS[id]}`}>
            <p className="agency-op-pillar__label">{meta.shortLabel}</p>
            <p className="agency-op-pillar__title">{meta.title}</p>
            {compact ? null : <p className="agency-op-pillar__desc">{meta.description}</p>}
            <p className="agency-op-pillar__stat">
              {prog.done}/{prog.total} · {prog.percent}%
            </p>
            <div className="agency-op-pillar__bar" aria-hidden>
              <div className="agency-op-pillar__bar-fill" style={{ width: `${prog.percent}%` }} />
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function LaunchOperationPillarBadges({ ids }: { ids: LaunchOperationPillarId[] }) {
  const unique = LAUNCH_OPERATION_PILLAR_ORDER.filter((id) => ids.includes(id));
  return (
    <span className="inline-flex flex-wrap gap-1">
      {unique.map((id) => (
        <span key={id} className={`agency-op-pillar-chip ${PILLAR_CLASS[id]}`}>
          {LAUNCH_OPERATION_PILLARS[id].shortLabel}
        </span>
      ))}
    </span>
  );
}

export function LaunchOperationPhasePillarFocus({ phase }: { phase: LaunchOperationPhase }) {
  return (
    <div className="panel space-y-2 p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--app-text-subtle)]">Encaixe desta fase</p>
      <LaunchOperationPillarBadges ids={[...phase.pillarFocus]} />
      <p className="text-sm leading-relaxed text-[var(--app-text-muted)]">{phase.pillarBridge}</p>
    </div>
  );
}
