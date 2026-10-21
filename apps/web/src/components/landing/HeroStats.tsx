import { useMemo, useSyncExternalStore } from "react";
import { MARKETING_COPY } from "@ederson-agencia/shared";
import { useInView } from "../../hooks/useInView";
import { parseStatValue, useCountUp } from "../../hooks/useCountUp";

const copy = MARKETING_COPY;

const statTones = ["hero-stat--sky", "hero-stat--violet", "hero-stat--indigo", "hero-stat--emerald"] as const;

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function AnimatedStatValue({ value, active }: { value: string; active: boolean }) {
  const parsed = useMemo(() => parseStatValue(value), [value]);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);
  const shouldAnimate = active && parsed !== null && !reducedMotion;
  const count = useCountUp(parsed?.target ?? 0, shouldAnimate, parsed?.target === 0 ? 650 : 1200);

  if (!parsed) {
    return <span className="hero-stat__value-inner">{value}</span>;
  }

  const display = reducedMotion || active ? parsed.prefix + (reducedMotion ? parsed.target : count) + parsed.suffix : `${parsed.prefix}0${parsed.suffix}`;

  return (
    <span className={`hero-stat__value-inner ${shouldAnimate || (active && reducedMotion) ? "is-live" : ""}`}>
      {display}
    </span>
  );
}

type HeroStatItemProps = {
  stat: (typeof copy.stats)[number];
  index: number;
  tone: string;
};

function HeroStatItem({ stat, index, tone }: HeroStatItemProps) {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.35, rootMargin: "0px 0px -5% 0px" });
  const className = `hero-stat glass-metric group ${tone}`;
  const style = { animationDelay: `${index * 100}ms` };
  const ariaLabel = `${stat.value} — ${stat.label}. ${stat.emphasis ?? ""}`;

  const content = (
    <>
      <p className="hero-stat__value font-display text-xl font-bold sm:text-2xl lg:text-[1.65rem]">
        <AnimatedStatValue value={stat.value} active={inView} />
      </p>
      <p className="hero-stat__label mt-1 text-[10px] font-medium leading-snug sm:text-[11px]">{stat.label}</p>
      {stat.emphasis ? (
        <p className="hero-stat__emphasis mt-1.5 text-[9px] leading-snug sm:text-[10px]">{stat.emphasis}</p>
      ) : null}
    </>
  );

  if (stat.href) {
    return (
      <a
        ref={ref}
        href={stat.href}
        role="listitem"
        aria-label={ariaLabel}
        className={`${className} hero-stat--interactive block no-underline`}
        style={style}
      >
        {content}
      </a>
    );
  }

  return (
    <div ref={ref} role="listitem" aria-label={ariaLabel} className={className} style={style}>
      {content}
    </div>
  );
}

export function HeroStats() {
  return (
    <div
      className="hero-stats mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5 md:mt-9 lg:mt-10 xl:mt-11 xl:gap-4 2xl:gap-5"
      role="list"
      aria-label="Indicadores de entrega e confiança"
    >
      {copy.stats.map((stat, index) => (
        <HeroStatItem key={stat.label} stat={stat} index={index} tone={statTones[index] ?? statTones[0]} />
      ))}
    </div>
  );
}
