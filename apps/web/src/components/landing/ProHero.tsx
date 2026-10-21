import { ArrowRight, ChevronDown } from "lucide-react";
import type { PortfolioProductionItem } from "@ederson-agencia/shared";
import { MARKETING_COPY } from "@ederson-agencia/shared";
import { BrandLogo } from "../brand/BrandLogo";
import { BrandIdentityBar } from "./BrandIdentityBar";
import { HeroStats } from "./HeroStats";

type ProHeroProps = {
  production: PortfolioProductionItem[];
};

const copy = MARKETING_COPY;

export function ProHero({ production }: ProHeroProps) {
  const featured = production.slice(0, 2);

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
          <div className="flex min-w-0 flex-col gap-4 md:max-w-[34rem] md:gap-5 lg:max-w-[36rem] xl:max-w-none">
            <div className="inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md">
              <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-sky-400" />
              <span className="font-mono text-[10px] uppercase leading-snug tracking-wider text-white/75 sm:text-[11px]">
                {copy.aida.attention.eyebrow}
              </span>
            </div>

            <h1 className="hero-title max-w-[16ch] text-balance sm:max-w-[20ch] md:max-w-[18ch] lg:max-w-[16ch]">
              <span className="hero-title-gradient">{copy.aida.attention.title}</span>
            </h1>

            <p className="max-w-[36rem] text-base leading-[1.55] text-white/70 sm:text-[1.05rem] lg:max-w-[32rem] lg:text-lg lg:leading-relaxed">
              {copy.aida.attention.subtitle}
            </p>

            <div className="flex flex-col gap-2.5 pt-0.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <a href="#reuniao" className="btn-primary btn-glow group w-full px-5 py-3 text-xs sm:w-auto sm:px-6 sm:py-3.5 sm:text-sm">
                {copy.aida.attention.ctaPrimary}
                <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
              </a>
              <a href="#processo" className="btn-secondary w-full px-5 py-3 text-xs sm:w-auto sm:px-6 sm:py-3.5 sm:text-sm">
                {copy.aida.attention.ctaSecondary}
              </a>
            </div>
          </div>

          <div className="pro-mockup-shell w-full min-w-0 md:mx-0 md:max-w-none md:self-center lg:sticky lg:top-[calc(var(--hero-nav-offset,5.75rem)+0.75rem)]">
            <div className="pro-mockup-ring rounded-2xl p-[1px]">
              <div className="pro-mockup overflow-hidden rounded-[15px]">
                <div className="flex items-center gap-2 border-b border-white/10 bg-black/40 px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                  <BrandLogo variant="mark" size="sm" className="ml-1 scale-75 opacity-90" />
                  <span className="truncate font-mono text-[10px] text-white/40">{copy.domainLabel}</span>
                </div>
                <div className="space-y-2.5 bg-gradient-to-b from-[#0f172a] to-[#070b14] p-4 sm:p-5">
                  <p className="text-[11px] font-medium uppercase tracking-widest text-sky-300/80">Em produção</p>
                  {featured.map((site) => (
                    <a
                      key={site.url}
                      href={site.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-xl border border-white/10 bg-white/[0.04] p-3.5 transition hover:border-sky-400/40 hover:bg-white/[0.06] sm:p-4"
                    >
                      <p className="font-display font-semibold text-white">{site.name}</p>
                      <p className="mt-1 text-xs text-sky-200/70">{site.url.replace("https://", "")}</p>
                    </a>
                  ))}
                  <div className="rounded-xl border border-dashed border-white/15 p-4 text-center text-xs text-white/45">
                    Seu produto aqui — MVP → escala
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <HeroStats />

        <BrandIdentityBar />
      </div>

      <div className="landing-container relative z-[1] mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-white/10 pt-5 md:mt-9 md:justify-start md:gap-x-8 md:pt-6">
        <span className="text-[11px] uppercase tracking-widest text-white/35">Confiança em produção</span>
        {production.map((site) => (
          <a
            key={site.url}
            href={site.url}
            target="_blank"
            rel="noreferrer"
            className="font-display text-sm font-semibold text-white/55 transition hover:text-sky-300"
          >
            {site.name}
          </a>
        ))}
      </div>

      <a
        href="#interesse"
        className="landing-container relative z-[1] mt-6 flex flex-col items-center gap-1.5 text-white/40 transition hover:text-sky-300 md:mt-8 md:items-start"
      >
        <span className="font-mono text-[10px] uppercase tracking-widest">Explorar</span>
        <ChevronDown className="h-5 w-5 animate-float" />
      </a>
    </section>
  );
}
