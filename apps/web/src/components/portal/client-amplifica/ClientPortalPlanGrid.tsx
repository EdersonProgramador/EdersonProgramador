import { CheckCircle2 } from "lucide-react";
import {
  agencyClientPortalPlans,
  formatBRL,
  type AgencyClientPortalPlan,
  type PackageTierId
} from "@ederson-agencia/shared";

type ClientPortalPlanGridProps = {
  selectedTier: PackageTierId;
  onSelect: (tier: PackageTierId) => void;
  plans?: AgencyClientPortalPlan[];
};

export function ClientPortalPlanGrid({ selectedTier, onSelect, plans }: ClientPortalPlanGridProps) {
  const cards = plans ?? agencyClientPortalPlans();

  return (
    <div className="acp-plan-grid">
      {cards.map((plan) => {
        const selected = selectedTier === plan.tierId;
        return (
          <article
            key={plan.tierId}
            className={`acp-plan${selected ? " acp-plan--selected" : ""}${plan.featured ? " acp-plan--featured" : ""}`}
          >
            <div className="acp-plan__head">
              <div>
                <h3 className="acp-plan__name">{plan.name}</h3>
                <p className="acp-plan__price">R$ {plan.priceLabel}</p>
                <p className="acp-plan__sub">{plan.sub}</p>
              </div>
              {plan.featured ? <span className="acp-plan__badge">Recomendado</span> : null}
              {selected ? <span className="acp-plan__badge acp-plan__badge--current">Selecionado</span> : null}
            </div>
            <ul className="acp-plan__features">
              {plan.features.map((feature) => (
                <li key={feature}>
                  <CheckCircle2 className="acp-plan__check" aria-hidden />
                  {feature}
                </li>
              ))}
            </ul>
            <p className="acp-plan__entry text-xs text-[var(--acp-muted)]">
              Entrada de referência: {formatBRL(plan.entryValueCents)}
            </p>
            <button
              type="button"
              className={selected ? "btn-secondary w-full" : "btn-primary w-full"}
              onClick={() => onSelect(plan.tierId)}
            >
              {selected ? "Pacote selecionado" : "Selecionar pacote"}
            </button>
          </article>
        );
      })}
    </div>
  );
}