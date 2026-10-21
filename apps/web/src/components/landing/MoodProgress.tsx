import type { PageMood } from "../../hooks/usePageMood";

const STEPS: { mood: PageMood; label: string; href: string }[] = [
  { mood: "trust", label: "Início", href: "#topo" },
  { mood: "energy", label: "Por quê", href: "#interesse" },
  { mood: "desire", label: "Projetos", href: "#producao" },
  { mood: "logic", label: "Método", href: "#processo" },
  { mood: "launch", label: "Reunião", href: "#reuniao" },
  { mood: "commit", label: "Briefing", href: "#orcamento" }
];

type MoodProgressProps = {
  active: PageMood;
};

export function MoodProgress({ active }: MoodProgressProps) {
  return (
    <nav
      className="mood-progress pointer-events-none fixed left-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 md:flex"
      aria-label="Progresso da página"
    >
      {STEPS.map((step) => {
        const isActive = active === step.mood || (active === "spectrum" && step.mood === "desire") || (active === "value" && step.mood === "launch") || (active === "vault" && step.mood === "logic") || (active === "calm" && step.mood === "commit");
        return (
          <a
            key={step.href}
            href={step.href}
            className={`mood-progress-dot pointer-events-auto group flex items-center gap-2 ${isActive ? "is-active" : ""}`}
            data-mood-dot={step.mood}
            title={step.label}
          >
            <span className="mood-progress-pip" />
            <span className="mood-progress-label font-mono text-[10px] uppercase tracking-wider opacity-0 transition group-hover:opacity-100">
              {step.label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
