import type { ReactNode } from "react";

type FunnelSectionProps = {
  id?: string;
  className?: string;
  children: ReactNode;
  narrow?: boolean;
};

/** Seção do funil — fundo sólido, sem orbs/grids do MoodSection (texto legível). */
export function FunnelSection({ id, className = "", children, narrow }: FunnelSectionProps) {
  return (
    <section
      id={id}
      className={`funnel-section scroll-mt-[calc(var(--hero-nav-offset,5.5rem)+0.5rem)] border-t border-white/[0.06] bg-[#060606] py-14 sm:py-16 ${className}`}
    >
      <div className={`landing-container relative z-[1] ${narrow ? "max-w-3xl" : ""}`}>{children}</div>
    </section>
  );
}
