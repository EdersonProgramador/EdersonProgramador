import type { PageMood } from "../../hooks/usePageMood";

export type MoodPalette = {
  base: string;
  gradient: string;
  accent: string;
  label: string;
  wash: string;
  glow: string;
};

function mood(
  base: string,
  from: string,
  to: string,
  wash: string,
  accent: string,
  label: string,
  glow: string
): MoodPalette {
  return {
    base,
    gradient: `linear-gradient(180deg, ${from} 0%, ${to} 100%)`,
    accent,
    label,
    wash,
    glow
  };
}

/** Fundos por seção — escuro premium + mesh (referência Linear / Vercel / Stripe). */
export const MOOD_PALETTE: Record<PageMood, MoodPalette> = {
  trust: mood(
    "#020617",
    "#0f172a",
    "#020617",
    `radial-gradient(ellipse 85% 55% at 50% -10%, rgba(59, 130, 246, 0.32), transparent 58%)`,
    "#38bdf8",
    "rgba(125, 211, 252, 0.95)",
    "rgba(59, 130, 246, 0.35)"
  ),
  energy: mood(
    "#0c0a09",
    "#1c1917",
    "#09090b",
    `radial-gradient(ellipse 55% 40% at 92% 8%, rgba(251, 146, 60, 0.14), transparent 52%),
     radial-gradient(ellipse 45% 35% at 8% 92%, rgba(99, 102, 241, 0.16), transparent 48%)`,
    "#fb923c",
    "rgba(253, 186, 116, 0.92)",
    "rgba(251, 146, 60, 0.22)"
  ),
  desire: mood(
    "#0b1120",
    "#1e3a5f",
    "#070d1a",
    `radial-gradient(ellipse 75% 50% at 50% 105%, rgba(56, 189, 248, 0.28), transparent 55%)`,
    "#7dd3fc",
    "rgba(186, 230, 253, 0.95)",
    "rgba(56, 189, 248, 0.3)"
  ),
  spectrum: mood(
    "#080c14",
    "#111827",
    "#050810",
    `radial-gradient(circle at 12% 18%, rgba(99, 102, 241, 0.2), transparent 42%),
     radial-gradient(circle at 88% 75%, rgba(14, 165, 233, 0.16), transparent 40%)`,
    "#818cf8",
    "rgba(199, 210, 254, 0.92)",
    "rgba(129, 140, 248, 0.25)"
  ),
  logic: mood(
    "#042f2e",
    "#0f766e",
    "#022c28",
    `radial-gradient(ellipse 70% 48% at 28% 0%, rgba(45, 212, 191, 0.22), transparent 54%)`,
    "#2dd4bf",
    "rgba(94, 234, 212, 0.95)",
    "rgba(45, 212, 191, 0.2)"
  ),
  vault: mood(
    "#0a0f1a",
    "#151b28",
    "#070a12",
    `radial-gradient(ellipse 60% 45% at 72% 0%, rgba(129, 140, 248, 0.14), transparent 50%)`,
    "#a5b4fc",
    "rgba(199, 210, 254, 0.88)",
    "rgba(129, 140, 248, 0.18)"
  ),
  value: mood(
    "#0f1419",
    "#1e293b",
    "#0a0f14",
    `radial-gradient(ellipse 65% 42% at 50% 0%, rgba(250, 204, 21, 0.12), transparent 50%)`,
    "#fbbf24",
    "rgba(253, 224, 71, 0.92)",
    "rgba(251, 191, 36, 0.15)"
  ),
  launch: mood(
    "#082f49",
    "#0c4a6e",
    "#062638",
    `radial-gradient(ellipse 90% 58% at 50% 110%, rgba(56, 189, 248, 0.38), transparent 58%)`,
    "#38bdf8",
    "rgba(186, 230, 253, 0.95)",
    "rgba(56, 189, 248, 0.35)"
  ),
  calm: mood(
    "#111827",
    "#1f2937",
    "#0d1117",
    `radial-gradient(ellipse 100% 38% at 50% 0%, rgba(148, 163, 184, 0.11), transparent 50%)`,
    "#94a3b8",
    "rgba(203, 213, 225, 0.85)",
    "rgba(148, 163, 184, 0.12)"
  ),
  commit: mood(
    "#0a1628",
    "#0f2847",
    "#061018",
    `radial-gradient(ellipse 80% 52% at 82% 48%, rgba(59, 130, 246, 0.26), transparent 55%)`,
    "#38bdf8",
    "rgba(125, 211, 252, 0.95)",
    "rgba(56, 189, 248, 0.28)"
  ),
  legal: mood(
    "#07090c",
    "#0f1419",
    "#050608",
    `radial-gradient(ellipse 80% 45% at 50% 100%, rgba(71, 85, 105, 0.14), transparent 55%)`,
    "#64748b",
    "rgba(148, 163, 184, 0.88)",
    "rgba(71, 85, 105, 0.2)"
  )
};
