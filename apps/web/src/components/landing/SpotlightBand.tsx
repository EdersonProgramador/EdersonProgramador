import type { CSSProperties, ReactNode } from "react";

type SpotlightBandProps = {
  id?: string;
  moodTrack?: string;
  children: ReactNode;
  className?: string;
};

/** Faixa elevada (padrão Stripe/Webflow): contraste claro vs hero escuro. */
export function SpotlightBand({ id, moodTrack, children, className = "" }: SpotlightBandProps) {
  return (
    <section
      id={id}
      data-mood-track={moodTrack}
      className={`pro-spotlight section-mood-desire landing-section-y relative border-y border-white/[0.1] ${id ? "section-scroll-anchor" : ""} ${className}`}
      style={
        {
          ["--mood-accent" as string]: "#7dd3fc",
          ["--mood-label" as string]: "rgba(186, 230, 253, 0.95)"
        } as CSSProperties
      }
    >
      <div className="pointer-events-none absolute inset-0 landing-section-grid opacity-[0.12]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,rgba(56,189,248,0.14),transparent_58%)]" aria-hidden />
      <div className="landing-container relative z-[1]">{children}</div>
    </section>
  );
}
