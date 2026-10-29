import { Check, Gift } from "lucide-react";
import { MARKETING_COPY } from "@ederson-agencia/shared";

const copy = MARKETING_COPY;

export function OfferPackages() {
  return (
    <div className="mt-14 grid gap-6 lg:grid-cols-3">
      {copy.packages.tiers.map((tier) => {
        const recommended = "recommended" in tier && tier.recommended === true;
        return (
          <article
            key={tier.id}
            className={`panel-glow relative flex h-full flex-col p-6 sm:p-8 ${
              recommended ? "ring-2 ring-sky-400/50" : ""
            }`}
          >
            {recommended ? (
              <span className="absolute -top-3 left-6 rounded-full bg-sky-500 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-950">
                {tier.badge}
              </span>
            ) : (
              <span className="section-label">{tier.badge}</span>
            )}
            <h3 className="mt-2 font-display text-xl font-bold text-[var(--app-text)]">{tier.name}</h3>
            <p className="mt-1 text-sm font-medium text-[var(--app-text-muted)]">{tier.tagline}</p>
            <p className="mt-4 font-display text-2xl font-bold text-blue-glow">{tier.price}</p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--app-text-subtle)]">{tier.priceNote}</p>
            <p className="mt-4 text-sm leading-relaxed text-[var(--app-text-muted)]">{tier.audience}</p>
            <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-[var(--app-text-subtle)]">Entregáveis</p>
            <ul className="mt-3 flex-1 space-y-2">
              {tier.deliverables.map((line) => (
                <li key={line} className="flex gap-2 text-sm text-[var(--app-text-muted)]">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" aria-hidden />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-panel)] p-3 text-sm text-[var(--app-text-muted)]">
              <Gift className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" aria-hidden />
              <p>
                <span className="font-medium text-[var(--app-text)]">Bônus: </span>
                {tier.bonus}
              </p>
            </div>
            <p className="mt-4 border-t border-[var(--app-border)] pt-4 text-xs leading-relaxed text-[var(--app-text-subtle)]">
              {tier.timeline}
            </p>
            <a href={`#formulario?pacote=${tier.id}`} className="btn-primary mt-6 w-full">
              Solicitar proposta — {tier.name}
            </a>
          </article>
        );
      })}
    </div>
  );
}
