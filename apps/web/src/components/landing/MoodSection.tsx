import type { CSSProperties, ReactNode } from "react";
import type { PageMood } from "../../hooks/usePageMood";
import { MOOD_PALETTE } from "./mood-palette";

type MoodSectionProps = {
  mood: PageMood;
  id?: string;
  className?: string;
  children: ReactNode;
  minHeight?: boolean;
};

export function MoodSection({ mood, id, className = "", children, minHeight }: MoodSectionProps) {
  const palette = MOOD_PALETTE[mood];

  const sectionStyle: CSSProperties = {
    ["--section-base" as string]: palette.base,
    ["--mood-accent" as string]: palette.accent,
    ["--mood-label" as string]: palette.label,
    ["--mood-glow" as string]: palette.glow,
    ["--mood-edge" as string]: `${palette.accent}66`,
    backgroundColor: palette.base,
    backgroundImage: `${palette.wash}, ${palette.gradient}`,
    backgroundSize: "100% 100%, 100% 100%",
    backgroundRepeat: "no-repeat"
  };

  return (
    <section
      id={id}
      data-mood-track={mood}
      data-mood={mood}
      style={sectionStyle}
      className={`section-ambient section-mood-${mood} border-t border-white/[0.06] first:border-t-0 ${id ? "section-scroll-anchor" : ""} ${minHeight ? "flex min-h-screen flex-col justify-center" : ""} relative overflow-hidden ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 landing-section-grid opacity-[0.22]" aria-hidden />
      <div
        className="pointer-events-none absolute -left-1/4 top-1/4 h-[min(480px,60vw)] w-[min(480px,60vw)] rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${palette.glow}, transparent 68%)` }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" aria-hidden />
      <div className="relative z-[1] w-full">{children}</div>
    </section>
  );
}
