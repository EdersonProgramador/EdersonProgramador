import { LAUNCH_FUNNEL_COPY } from "@ederson-agencia/shared";
import { CalendarClock } from "lucide-react";
import { useLeadCaptureOptional } from "./lead-capture-context";

const s = LAUNCH_FUNNEL_COPY.scarcity;
const slots = s.slotsLeft;

export function OfferScarcityBand() {
  const capture = useLeadCaptureOptional();
  return (
    <section className="ui-cta-band ui-cta-band--urgent offer-scarcity" aria-labelledby="scarcity-title">
      <div className="landing-container flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-orange-400">
            <CalendarClock className="h-4 w-4" aria-hidden />
            {s.label} · {slots} vagas
          </p>
          <h2 id="scarcity-title" className="pro-headline mt-2 text-2xl text-[var(--app-text)] sm:text-3xl">
            {s.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--app-text-muted)] sm:text-base">{s.body}</p>
          <p className="mt-2 text-xs text-[var(--app-text-muted)] opacity-80">{s.note}</p>
        </div>
        {capture ? (
          <button
            type="button"
            className="btn-primary btn-primary--conversion btn-primary--urgent w-full shrink-0 md:w-auto"
            onClick={() => capture.openCapture()}
          >
            {s.cta}
          </button>
        ) : null}
      </div>
    </section>
  );
}
