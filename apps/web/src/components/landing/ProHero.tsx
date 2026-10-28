import { ArrowRight } from "lucide-react";
import type { PortfolioProductionItem } from "@ederson-agencia/shared";
import { MARKETING_COPY } from "@ederson-agencia/shared";
import { BrandLogo } from "../brand/BrandLogo";
import { HeroStats } from "./HeroStats";

type ProHeroProps = {
  production: PortfolioProductionItem[];
};

const copy = MARKETING_COPY;

export function ProHero({ production: _production }: ProHeroProps) {
  return (
    <section
      id="topo"
      data-mood-track="trust"
      className="pro-hero scroll-mt-0 relative overflow-hidden pb-10 pt-[calc(var(--hero-nav-offset,6rem)+0.75rem)] sm:pb-12 lg:pb-14"
    >
      <div className="mesh-hero pointer-events-none absolute inset-0" aria-hidden />
      <div className="mesh-hero-glow pointer-events-none absolute inset-0" aria-hidden />

      <div className="landing-container relative z-[1]">
        <div className="pro-hero-grid grid gap-x-6 gap-y-8 sm:gap-y-7 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:items-center md:gap-x-8 lg:gap-x-10">
          <div className="flex min-w-0 flex-col gap-4 md:max-w-[36rem] md:gap-5 lg:max-w-[40rem] xl:max-w-none">
            <div className="inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md">
              <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-sky-400" />
              <span className="font-mono text-[10px] uppercase leading-snug tracking-wider text-white/75 sm:text-[11px]">
                {copy.aida.attention.eyebrow}
              </span>
            </div>

            <h1 className="hero-title max-w-[22ch] text-balance sm:max-w-[28ch] md:max-w-[26ch] lg:max-w-[24ch]">
              <span className="hero-title-gradient">{copy.aida.attention.title}</span>
            </h1>

            <p className="max-w-[36rem] text-base leading-[1.55] text-white/70 sm:text-[1.05rem] lg:text-lg lg:leading-relaxed">
              {copy.aida.attention.subtitle}
            </p>

            <div className="flex flex-col gap-2.5 pt-0.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <a href="#contato" className="btn-primary btn-glow group w-full px-5 py-3 text-xs uppercase tracking-wide sm:w-auto sm:px-6 sm:py-3.5 sm:text-sm sm:normal-case sm:tracking-normal">
                {copy.aida.attention.ctaPrimary}
                <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
              </a>
              <a href="#processo" className="btn-secondary w-full px-5 py-3 text-xs sm:w-auto sm:px-6 sm:py-3.5 sm:text-sm">
                {copy.aida.attention.ctaSecondary}
              </a>
            </div>
            <p className="text-[10px] text-white/50 sm:text-xs">{copy.offer.productByline}</p>
          </div>

          <div className="pro-mockup-shell w-full min-w-0 md:mx-0 md:max-w-none md:self-center lg:sticky lg:top-[calc(var(--hero-nav-offset,5.75rem)+0.75rem)]">
            <div className="pro-mockup-ring rounded-2xl p-[1px]">
              <div className="pro-mockup pro-mockup--chrome surface-dark overflow-hidden rounded-[15px]">
                <div className="flex items-center gap-2 border-b border-white/10 bg-black/40 px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                  <BrandLogo variant="mark" size="sm" className="ml-1 scale-75 opacity-90" />
                  <span className="truncate font-mono text-[10px] text-white/40">{copy.domainLabel}</span>
                </div>
                <div className="flex min-h-[220px] flex-col justify-center space-y-3 bg-gradient-to-b from-[#0f172a] to-[#070b14] p-6 sm:min-h-[260px] sm:p-8">
                  <p className="text-[11px] font-medium uppercase tracking-widest text-sky-300/80">Próximo passo</p>
                  <p className="font-display text-xl font-semibold text-white sm:text-2xl">{copy.hero.mockupLabel}</p>
                  <p className="max-w-xs text-sm leading-relaxed text-sky-200/75">{copy.hero.mockupHint}</p>
                  <div className="rounded-xl border border-dashed border-white/15 p-4 text-center text-xs text-white/45">
                    Diagnóstico · escopo · desenvolvimento · implantação
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <HeroStats />
      </div>
    </section>
  );
}
