import { ArrowRight } from "lucide-react";
import { MARKETING_COPY } from "@ederson-agencia/shared";

const copy = MARKETING_COPY;

export function CtaBand() {
  return (
    <section
      data-mood-track="launch"
      className="cta-band relative overflow-hidden px-4 py-14 sm:py-16 md:px-8 md:py-20 lg:py-24"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_100%_50%,rgba(255,255,255,0.08),transparent_55%)]" aria-hidden />
      <div className="landing-container relative z-[1] flex flex-col items-stretch justify-between gap-6 sm:gap-8 md:flex-row md:items-center">
        <div className="min-w-0 max-w-xl">
          <p className="section-label">{copy.aida.action.label}</p>
          <h2 className="pro-headline mt-3 text-[1.65rem] leading-tight sm:text-3xl md:text-4xl">{copy.aida.action.title}</h2>
          <p className="mt-3 text-sm text-white/65 sm:text-base">{copy.aida.action.subtitle}</p>
          <p className="mt-3 text-sm font-medium text-sky-200/90 sm:text-base">{copy.aida.action.urgencyNote}</p>
        </div>
        <a href="#contato" className="btn-primary btn-glow w-full shrink-0 sm:w-auto">
          {copy.aida.attention.ctaPrimary}
          <ArrowRight className="ml-2 h-4 w-4" />
        </a>
      </div>
    </section>
  );
}
