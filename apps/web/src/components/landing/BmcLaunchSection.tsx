import { LAUNCH_FUNNEL_COPY } from "@ederson-agencia/shared";
import { SectionHeader } from "./SectionHeader";
import { useLeadCaptureOptional } from "./lead-capture-context";

const bmc = LAUNCH_FUNNEL_COPY.bmc;
const forWho = LAUNCH_FUNNEL_COPY.forWho;

export function BmcLaunchSection() {
  const capture = useLeadCaptureOptional();
  return (
    <section id="modelo" className="landing-section-y relative">
      <div className="landing-container">
        <header className="ui-section-intro--center mb-10 md:mb-12">
          <SectionHeader label={bmc.label} title={bmc.title} description={bmc.subtitle} align="center" />
        </header>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {bmc.pillars.map((p) => (
            <article key={p.step} className="ui-card ui-card--body">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-sky-600 dark:text-sky-300">
                {p.step}
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold text-[var(--app-text)]">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--app-text-muted)]">{p.text}</p>
            </article>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-[var(--app-text-muted)]">
          {bmc.footnote}
        </p>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <div className="ui-card ui-card--body">
            <SectionHeader label={forWho.label} title={forWho.title} />
            <ul className="mt-6 space-y-3">
              {forWho.items.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-[var(--app-text)]">
                  <span className="font-semibold text-sky-500" aria-hidden>
                    —
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="ui-card ui-card--body border-amber-500/25 bg-amber-500/[0.04]">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-200/90">
              Não é indicado se
            </p>
            <ul className="mt-4 space-y-2">
              {forWho.notFor.map((item) => (
                <li key={item} className="text-sm leading-relaxed text-[var(--app-text-muted)]">
                  {item}
                </li>
              ))}
            </ul>
            {capture ? (
              <button type="button" className="btn-primary mt-8 w-full sm:w-auto" onClick={() => capture.openCapture()}>
                {LAUNCH_FUNNEL_COPY.scarcity.cta}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
