import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { BarChart3, Brain, Cloud, Code2, Monitor } from "lucide-react";
import { BRAND_IDENTITY } from "@ederson-agencia/shared";

type PillarId = (typeof BRAND_IDENTITY.servicePillars)[number]["id"];

type PillarTheme = {
  Icon: LucideIcon;
  tone: `brand-pillar--${PillarId}`;
  iconAnim: string;
};

const valueTagAccents = ["#38bdf8", "#34d399", "#a78bfa", "#fbbf24"] as const;

const pillarThemes: Record<PillarId, PillarTheme> = {
  systems: { Icon: Code2, tone: "brand-pillar--systems", iconAnim: "brand-pillar__icon--pulse" },
  ai: { Icon: Brain, tone: "brand-pillar--ai", iconAnim: "brand-pillar__icon--glow" },
  automation: { Icon: Cloud, tone: "brand-pillar--automation", iconAnim: "brand-pillar__icon--float" },
  platforms: { Icon: Monitor, tone: "brand-pillar--platforms", iconAnim: "brand-pillar__icon--pulse" },
  projects: { Icon: BarChart3, tone: "brand-pillar--projects", iconAnim: "brand-pillar__icon--rise" }
};

export function BrandIdentityBar() {
  return (
    <div className="brand-identity-bar mt-8 border-y border-white/10 md:mt-10 xl:mt-12">
      <ul className="flex gap-2 overflow-x-auto py-3 [scrollbar-width:none] md:grid md:grid-cols-5 md:gap-3 md:overflow-visible md:py-4 xl:gap-4 xl:py-5 2xl:gap-5 [&::-webkit-scrollbar]:hidden">
        {BRAND_IDENTITY.servicePillars.map((pillar, index) => {
          const theme = pillarThemes[pillar.id];
          const Icon = theme?.Icon ?? Code2;
          const tone = theme?.tone ?? "brand-pillar--systems";
          const iconAnim = theme?.iconAnim ?? "brand-pillar__icon--pulse";

          return (
            <li
              key={pillar.id}
              className={`brand-pillar ${tone} flex min-w-[9.5rem] shrink-0 flex-col items-center gap-2 rounded-xl border px-3 py-3 text-center md:min-w-0 xl:gap-2.5 xl:px-4 xl:py-4 2xl:py-5`}
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <span className={`brand-pillar__icon ${iconAnim}`}>
                <Icon className="brand-pillar__svg h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="brand-pillar__label text-[10px] font-semibold uppercase leading-snug tracking-wide sm:text-[11px] xl:text-xs xl:leading-snug 2xl:text-[0.8125rem]">
                {pillar.label}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-white/[0.06] py-3 md:justify-between xl:gap-x-8 xl:py-4 2xl:py-5">
        <p className="brand-identity-bar__slogan text-center text-[11px] uppercase tracking-[0.2em] text-brand-primary/90 md:text-left xl:text-xs xl:tracking-[0.22em]">
          {BRAND_IDENTITY.sloganSecondary}
        </p>
        <ul className="brand-value-tags flex flex-wrap justify-center gap-2" aria-label="Valores da marca">
          {BRAND_IDENTITY.values.map((value, index) => (
            <li key={value}>
              <span
                className="brand-value-tag rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider xl:px-3 xl:py-1.5 xl:text-[11px]"
                style={
                  {
                    animationDelay: `${index * 2}s`,
                    "--value-accent": valueTagAccents[index] ?? valueTagAccents[0]
                  } as CSSProperties
                }
              >
                {value}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
