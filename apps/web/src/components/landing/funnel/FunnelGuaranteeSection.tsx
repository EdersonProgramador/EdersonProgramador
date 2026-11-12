import { LAUNCH_FUNNEL_COPY, MARKETING_COPY } from "@ederson-agencia/shared";
import { ShieldCheck } from "lucide-react";

const g = LAUNCH_FUNNEL_COPY.guarantee;

export function FunnelGuaranteeSection() {
  return (
    <section id="garantia" className="funnel-section border-t border-white/[0.06] bg-[#060606] py-14 sm:py-16">
      <div className="landing-container max-w-3xl text-center">
        <span className="inline-block rounded-full border border-emerald-500/40 px-4 py-1 text-xs font-black tracking-widest text-emerald-400">
          {g.badge}
        </span>
        <h2 className="mt-6 font-display text-2xl font-bold text-white sm:text-3xl">{g.title}</h2>
        <p className="mt-4 text-sm leading-relaxed text-white/60 sm:text-base">{g.body}</p>
        <p className="mt-4 text-xs text-white/45">{MARKETING_COPY.guarantee.legalNote}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {g.trust.map((label) => (
            <span key={label} className="funnel-topic-chip inline-flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" aria-hidden />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
