import { Check, Gift } from "lucide-react";
import { LAUNCH_FUNNEL_COPY, MARKETING_COPY } from "@ederson-agencia/shared";
import { useLeadCaptureOptional } from "./lead-capture-context";
import type { LeadCapturePackageTier } from "./lead-capture-context";

const copy = MARKETING_COPY;
const funnel = LAUNCH_FUNNEL_COPY;

const ANCHOR_PRICE: Record<string, string> = {
  essential: "R$ 7.900",
  professional: "R$ 19.900",
  advanced: "R$ 36.900"
};

const TIER_SLOT_KEY: Record<string, keyof typeof funnel.pricingFunnel.packageSlots> = {
  essential: "essential",
  professional: "professional",
  advanced: "advanced"
};

export function OfferPackages() {
  const capture = useLeadCaptureOptional();

  function onSelectTier(tierId: string) {
    const tier = tierId as LeadCapturePackageTier;
    if (capture && (tier === "essential" || tier === "professional" || tier === "advanced")) {
      capture.openCapture({ packageTier: tier });
    }
  }

  return (
    <div className="offer-packages offer-packages--black-november mt-10">
      <p className="offer-packages__promo text-center text-sm font-black uppercase tracking-wide">{funnel.pricingFunnel.promoBadge}</p>
      <p className="mt-2 text-center text-xs text-white/45">{funnel.pricingFunnel.installmentNote}</p>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {copy.packages.tiers.map((tier, index) => {
          const recommended = "recommended" in tier && tier.recommended === true;
          const anchor = ANCHOR_PRICE[tier.id] ?? tier.price;
          return (
            <article
              key={tier.id}
              className={`funnel-benefit-card ui-card--pricing flex h-full flex-col ${
                recommended ? "border-emerald-500/50 ring-1 ring-emerald-500/30" : ""
              }`}
            >
              <span className="funnel-lote-badge funnel-lote-badge--black-november">{funnel.scarcity.label}</span>
              <p className="funnel-slots funnel-slots--led mt-3">
                <span className="funnel-slots__text">
                  {funnel.pricingFunnel.packageSlots[TIER_SLOT_KEY[tier.id] ?? "essential"]} vagas disponíveis em{" "}
                  {funnel.scarcity.slotsDeadline}
                </span>
              </p>
              <h3 className="mt-4 font-display text-xl font-black uppercase text-white">{tier.name}</h3>
              <p className="mt-1 text-sm font-medium text-white/55">{tier.tagline}</p>
              <p className="funnel-price-strike mt-5">Consultoria avulsa a partir de {anchor}</p>
              <p className="funnel-price-now">{tier.price}</p>
              <p className="mt-1 text-xs text-white/45">{tier.priceNote}</p>
              <ul className="mt-5 flex-1 space-y-2 border-t border-white/10 pt-5">
                {tier.deliverables.slice(0, 7).map((line) => (
                  <li key={line} className="flex gap-2 text-sm text-white/65">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex gap-2 rounded-xl border border-dashed border-white/15 p-3 text-sm text-white/55">
                <Gift className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
                <p>
                  <span className="font-semibold text-white">Bônus: </span>
                  {tier.bonus}
                </p>
              </div>
              {capture ? (
                <button
                  type="button"
                  className="btn-primary btn-primary--urgent mt-6 w-full text-sm font-black uppercase"
                  onClick={() => onSelectTier(tier.id)}
                >
                  {recommended ? "QUERO COMEÇAR HOJE" : "QUERO FAZER PARTE"}
                </button>
              ) : (
                <a href={`#formulario?pacote=${tier.id}`} className="btn-primary btn-primary--urgent mt-6 w-full">
                  Solicitar proposta
                </a>
              )}
            </article>
          );
        })}
      </div>
      <p className="mt-8 text-center text-xs text-white/40">{funnel.pricingFunnel.secure}</p>
    </div>
  );
}
