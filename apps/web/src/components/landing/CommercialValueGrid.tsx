import { Check } from "lucide-react";
import { LAUNCH_FUNNEL_COPY, MARKETING_COPY } from "@ederson-agencia/shared";

export function CommercialValueGrid() {
  const highlights = MARKETING_COPY.aida.interest.highlights;
  const pillars = LAUNCH_FUNNEL_COPY.bmc.pillars.slice(0, 3);

  return (
    <div className="ui-value-grid">
      {highlights.map((item) => (
        <article key={item} className="ui-card ui-card--body">
          <div className="flex gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500">
              <Check className="h-4 w-4" aria-hidden />
            </span>
            <p className="text-sm leading-relaxed text-[var(--app-text)]">{item}</p>
          </div>
        </article>
      ))}
      {pillars.map((p) => (
        <article key={p.step} className="ui-card ui-card--body hidden lg:block">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--app-text-muted)]">{p.step}</p>
          <h3 className="mt-2 font-display text-base font-semibold text-[var(--app-text)]">{p.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--app-text-muted)]">{p.text}</p>
        </article>
      ))}
    </div>
  );
}
