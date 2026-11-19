import {
  AGENCY_AGENT_TEMPLATES,
  getAgencyAgentTemplate,
  type AgencyAgentTemplateId
} from "@ederson-agencia/shared";
import type { AgentRow, BookClient } from "./types";

export function ClientAgentsPanel({
  selected,
  agents,
  busy,
  onRun,
  onRunProposalPack
}: {
  selected: BookClient | null;
  agents: AgentRow[];
  busy: boolean;
  onRun: (agentId: string) => void;
  onRunProposalPack: () => void;
}) {
  const deployed = selected
    ? agents.filter((a) => a.deployments.some((d) => d.projectId === selected.projectId && d.status === "ACTIVE"))
    : [];

  const byDomain = AGENCY_AGENT_TEMPLATES.reduce<Record<string, typeof AGENCY_AGENT_TEMPLATES[number][]>>(
    (acc, tpl) => {
      (acc[tpl.domain] ??= []).push(tpl);
      return acc;
    },
    {}
  );

  return (
    <section className="agency-os-panel">
      <header className="agency-os-panel__head">
        <h2>Agentes por cliente</h2>
        <p>
          {selected
            ? `${selected.clientName} — especialistas produzem branding, proposta e campanhas.`
            : "Selecione um cliente no book."}
        </p>
      </header>

      {selected ? (
        <div className="mb-3 flex flex-wrap gap-2">
          <button type="button" className="btn-primary" disabled={busy} onClick={onRunProposalPack}>
            Gerar proposta completa (pacote da página)
          </button>
        </div>
      ) : null}

      {!selected ? null : deployed.length === 0 ? (
        <p className="text-sm text-[var(--app-text-muted)]">
          Nenhum agente neste cliente. Use “Implantar agentes especialistas” no book.
        </p>
      ) : (
        <ul className="agency-os-agent-list">
          {deployed.map((agent) => {
            const tpl = getAgencyAgentTemplate(agent.templateId);
            return (
              <li key={agent.id} className="agency-os-agent-row">
                <div>
                  <p className="font-semibold text-[var(--app-text)]">{agent.name}</p>
                  <p className="text-xs text-[var(--app-text-muted)]">
                    {tpl?.domain} · {tpl?.role}
                    {tpl?.skills?.length ? ` · ${tpl.skills.length} skills` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={busy}
                  onClick={() => onRun(agent.id)}
                >
                  Gerar
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="agency-os-domains mt-4">
        <h3 className="admin-agents-section-title">Catálogo de especialistas</h3>
        <div className="agency-os-domain-grid">
          {Object.entries(byDomain).map(([domain, templates]) => (
            <div key={domain} className="agency-os-domain">
              <p className="agency-os-domain__title">{domain}</p>
              <ul>
                {templates.map((t) => (
                  <li key={t.id}>
                    <strong>{t.label}</strong>
                    <span>{t.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function findProposalAgentId(agents: AgentRow[], projectId: string): string | null {
  const hit = agents.find(
    (a) =>
      a.templateId === ("proposal_architect" satisfies AgencyAgentTemplateId) &&
      a.deployments.some((d) => d.projectId === projectId)
  );
  return hit?.id ?? null;
}
