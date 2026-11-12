import { useEffect, useState, useSyncExternalStore } from "react";
import { ClipboardList, Layers, Lightbulb, Rocket, Trophy, type LucideIcon } from "lucide-react";
import { LAUNCH_FUNNEL_COPY } from "@ederson-agencia/shared";

const p = LAUNCH_FUNNEL_COPY.pipeline;

const STEP_ICONS: Record<(typeof p.steps)[number]["key"], LucideIcon> = {
  ideia: Lightbulb,
  plano: ClipboardList,
  mvp: Layers,
  lancamento: Rocket,
  validacao: Trophy
};

const STEP_MS = 1050;
const VICTORY_MS = 3000;
const RESTART_MS = 500;

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function stepClass(index: number, activeIndex: number, victory: boolean, tier: string) {
  const base = `funnel-pipeline__step funnel-pipeline__step--${tier}`;
  if (victory && index === p.steps.length - 1) return `${base} funnel-pipeline__step--victory`;
  if (index < activeIndex) return `${base} funnel-pipeline__step--done`;
  if (index === activeIndex) return `${base} funnel-pipeline__step--active`;
  return `${base} funnel-pipeline__step--pending`;
}

export function FunnelPipelineInline() {
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);
  const [activeIndex, setActiveIndex] = useState(reducedMotion ? p.steps.length - 1 : -1);
  const [victory, setVictory] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) return;

    const timeouts: number[] = [];
    let generation = 0;

    const schedule = (fn: () => void, ms: number) => {
      const gen = generation;
      const id = window.setTimeout(() => {
        if (gen === generation) fn();
      }, ms);
      timeouts.push(id);
    };

    const runCycle = () => {
      generation += 1;
      const gen = generation;

      setVictory(false);
      setActiveIndex(-1);

      p.steps.forEach((_, index) => {
        schedule(() => setActiveIndex(index), 400 + index * STEP_MS);
      });

      const finishAt = 400 + p.steps.length * STEP_MS;
      schedule(() => {
        setVictory(true);
        setActiveIndex(p.steps.length - 1);
      }, finishAt);

      schedule(() => {
        setVictory(false);
        setActiveIndex(-1);
        window.setTimeout(() => {
          if (gen === generation) runCycle();
        }, RESTART_MS);
      }, finishAt + VICTORY_MS);
    };

    const boot = window.setTimeout(runCycle, 300);
    timeouts.push(boot);

    return () => {
      generation += 1;
      timeouts.forEach((id) => window.clearTimeout(id));
    };
  }, [reducedMotion]);

  return (
    <div className="funnel-pipeline-card mt-10 rounded-2xl border border-white/[0.08] bg-[#0a0a0a] p-6 sm:p-8">
      <p className="text-center text-sm font-semibold text-emerald-300/90">{p.title}</p>

      <div
        className={`funnel-pipeline mt-6 ${victory ? "funnel-pipeline--victory" : ""}`}
        role="list"
        aria-label="Etapas da jornada do produto"
      >
        {p.steps.map((step, index) => {
          const Icon = STEP_ICONS[step.key];
          return (
          <div key={step.key} className="funnel-pipeline__unit" role="listitem">
            <div className={stepClass(index, activeIndex, victory, step.tier)}>
              <span className="funnel-pipeline__step-led" aria-hidden />
              <span className="funnel-pipeline__step-icon" aria-hidden>
                <Icon className="h-4 w-4 sm:h-[1.125rem] sm:w-[1.125rem]" strokeWidth={2.25} />
              </span>
              <span className="funnel-pipeline__step-label">{step.label}</span>
              {victory && index === p.steps.length - 1 ? (
                <span className="funnel-pipeline__step-check" aria-hidden>
                  ✓
                </span>
              ) : null}
            </div>
            {index < p.steps.length - 1 ? (
              <span
                className={`funnel-pipeline__connector funnel-pipeline__connector--link-${index} ${index < activeIndex ? "funnel-pipeline__connector--lit" : ""}`}
                aria-hidden
              >
                <span className="funnel-pipeline__connector-beam" />
              </span>
            ) : null}
          </div>
          );
        })}
      </div>

      {victory ? (
        <div className="funnel-pipeline__victory-banner" role="status">
          <span className="funnel-pipeline__victory-sparkles" aria-hidden />
          <p className="funnel-pipeline__victory-title">{p.victoryTitle}</p>
          <p className="funnel-pipeline__victory-sub">{p.victorySubtitle}</p>
        </div>
      ) : (
        <p className="mt-6 text-center text-xs text-white/50">{p.tagline}</p>
      )}

      {!victory ? <p className="sr-only">Etapa atual: {activeIndex >= 0 ? p.steps[activeIndex]?.label : "Início"}</p> : null}
    </div>
  );
}
