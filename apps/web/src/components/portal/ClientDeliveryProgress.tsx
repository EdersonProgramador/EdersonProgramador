import { Link } from "react-router-dom";
import { AGENCY_APP_BASE, JOURNEY_PHASES } from "@ederson-agencia/shared";

type PhaseRow = {
  id: string;
  phaseKey: string;
  label: string;
  status: string;
  sortOrder: number;
  deliverablesDone: number;
  deliverablesTotal: number;
};

const statusLabel: Record<string, string> = {
  PENDING: "Aguardando",
  IN_PROGRESS: "Em andamento",
  WAITING_APPROVAL: "Sua aprovação",
  APPROVED: "Aprovada",
  DONE: "Concluída"
};

export function ClientDeliveryProgress({
  projectId,
  phases
}: {
  projectId: string;
  phases: PhaseRow[];
}) {
  const ordered = [...phases].sort((a, b) => a.sortOrder - b.sortOrder);
  const overallDone = ordered.filter((p) => ["APPROVED", "DONE"].includes(p.status)).length;
  const overallPct = ordered.length ? Math.round((overallDone / ordered.length) * 100) : 0;

  return (
    <section className="panel space-y-4 p-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-[var(--app-text)]">Jornada de desenvolvimento</h2>
          <p className="text-sm text-[var(--app-text-muted)]">Progresso sincronizado com a equipe (admin/freelancer).</p>
        </div>
        <Link to={`${AGENCY_APP_BASE}/projetos/${projectId}`} className="text-sm text-brand-primary hover:underline">
          Ver entregáveis →
        </Link>
      </div>
      <div>
        <div className="flex justify-between text-xs text-[var(--app-text-muted)]">
          <span>Progresso geral</span>
          <span>{overallPct}%</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--app-hover)]">
          <div className="h-full bg-sky-500 transition-all" style={{ width: `${overallPct}%` }} />
        </div>
      </div>
      <ol className="space-y-3">
        {ordered.map((phase) => {
          const meta = JOURNEY_PHASES.find((p) => p.key === phase.phaseKey);
          const pct =
            phase.deliverablesTotal > 0
              ? Math.round((phase.deliverablesDone / phase.deliverablesTotal) * 100)
              : phase.status === "APPROVED" || phase.status === "DONE"
                ? 100
                : phase.status === "IN_PROGRESS"
                  ? 35
                  : 0;
          return (
            <li key={phase.id} className="rounded-xl border border-[var(--app-border)] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-medium">{meta?.shortLabel ?? phase.label}</span>
                <span className="text-xs text-[var(--app-text-muted)]">{statusLabel[phase.status] ?? phase.status}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--app-hover)]">
                <div className="h-full bg-emerald-500/90 transition-all" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-1 text-xs text-[var(--app-text-muted)]">
                Entregáveis {phase.deliverablesDone}/{phase.deliverablesTotal}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
