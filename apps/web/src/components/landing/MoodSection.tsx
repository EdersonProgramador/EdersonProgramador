import type { ReactNode } from "react";
import type { PageMood } from "../../hooks/usePageMood";

type MoodSectionProps = {
  mood: PageMood;
  id?: string;
  className?: string;
  children: ReactNode;
  /** Altura mínima opcional (ex.: hero) */
  minHeight?: boolean;
};

export function MoodSection({ mood, id, className = "", children, minHeight }: MoodSectionProps) {
  return (
    <section
      id={id}
      data-mood-track={mood}
      className={`section-ambient section-ambient--${mood} ${moodClass(mood)} relative overflow-hidden ${minHeight ? "flex min-h-screen flex-col justify-center" : ""} ${className}`}
    >
      <div className="section-ambient-bg pointer-events-none absolute inset-0" aria-hidden />
      <div className="section-ambient-wash pointer-events-none absolute inset-0" aria-hidden />
      <div className="section-ambient-mesh pointer-events-none absolute inset-0" aria-hidden />
      <div className="section-ambient-orb pointer-events-none absolute -left-20 top-[12%] h-[min(420px,55vw)] w-[min(420px,55vw)] rounded-full blur-[90px]" aria-hidden />
      <div className="section-ambient-orb section-ambient-orb--b pointer-events-none absolute -right-16 bottom-[8%] h-[min(380px,50vw)] w-[min(380px,50vw)] rounded-full blur-[100px]" aria-hidden />
      <div className="section-ambient-edge pointer-events-none absolute inset-x-0 top-0 h-px" aria-hidden />
      <div className="section-ambient-edge section-ambient-edge--bottom pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-60" aria-hidden />
      <div className="relative z-[1]">{children}</div>
    </section>
  );
}

function moodClass(mood: PageMood): string {
  const map: Record<PageMood, string> = {
    trust: "section-mood-trust",
    energy: "section-mood-energy",
    desire: "section-mood-desire",
    spectrum: "section-mood-spectrum",
    logic: "section-mood-logic",
    vault: "section-mood-vault",
    value: "section-mood-value",
    launch: "section-mood-launch",
    calm: "section-mood-calm",
    commit: "section-mood-commit",
    legal: "section-mood-legal"
  };
  return map[mood];
}
