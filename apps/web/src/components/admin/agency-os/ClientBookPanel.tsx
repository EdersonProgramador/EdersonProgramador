import type { BookClient } from "./types";

export function ClientBookPanel({
  clients,
  selectedProjectId,
  busy,
  onSelect,
  onBootstrap
}: {
  clients: BookClient[];
  selectedProjectId: string;
  busy: boolean;
  onSelect: (projectId: string) => void;
  onBootstrap: (projectId: string) => void;
}) {
  return (
    <section className="agency-os-panel">
      <header className="agency-os-panel__head">
        <h2>Multi-client book</h2>
        <p>Carteira inteira em um lugar — onboard e agentes por cliente.</p>
      </header>
      {clients.length === 0 ? (
        <p className="text-sm text-[var(--app-text-muted)]">Nenhum projeto/cliente ainda.</p>
      ) : (
        <ul className="agency-os-book">
          {clients.map((c) => {
            const active = c.projectId === selectedProjectId;
            return (
              <li key={c.projectId}>
                <button
                  type="button"
                  className={`agency-os-client${active ? " is-active" : ""}`}
                  onClick={() => onSelect(c.projectId)}
                >
                  <span className="agency-os-client__top">
                    <strong>{c.clientName}</strong>
                    <span className={`agency-os-pill agency-os-pill--${c.scorecard.health}`}>
                      {c.scorecard.health === "ready"
                        ? "Pronto"
                        : c.scorecard.health === "partial"
                          ? "Parcial"
                          : "Bootstrap"}
                    </span>
                  </span>
                  <span className="agency-os-client__meta">
                    {c.title} · {c.packageTier}
                    {c.leadStatus ? ` · lead ${c.leadStatus}` : ""}
                  </span>
                  <span className="agency-os-client__stats">
                    <span>{c.agentsDeployed} agentes</span>
                    <span>{c.pendingApprovals} aprovações</span>
                  </span>
                </button>
                {c.scorecard.health !== "ready" ? (
                  <button
                    type="button"
                    className="btn-secondary agency-os-client__boot"
                    disabled={busy}
                    onClick={() => onBootstrap(c.projectId)}
                  >
                    Implantar agentes especialistas
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
