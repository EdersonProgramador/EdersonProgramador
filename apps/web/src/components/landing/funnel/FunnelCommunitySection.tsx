import { LAUNCH_FUNNEL_COPY } from "@ederson-agencia/shared";
import { useLeadCaptureOptional } from "../lead-capture-context";

const c = LAUNCH_FUNNEL_COPY.community;
const who = LAUNCH_FUNNEL_COPY.forWho;

export function FunnelCommunitySection() {
  const capture = useLeadCaptureOptional();
  return (
    <section id="comunidade" className="funnel-section border-t border-white/[0.06] bg-[#060606] py-14 sm:py-16">
      <div className="landing-container">
        <p className="funnel-community-kicker">{c.kicker}</p>
        <h2 className="funnel-spaced-brand mt-4 text-center">
          {c.brand} <span className="text-emerald-400">{c.brandSuffix}</span>
        </h2>
        <p className="mx-auto mt-4 flex max-w-md justify-center">
          <span className="funnel-member-pill">
            {c.memberCount} <span className="text-white/70">{c.memberLabel}</span>
          </span>
        </p>
        <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-relaxed text-white/65 sm:text-base">{c.body}</p>

        <RunWhoGrid />

        <div className="mx-auto mt-12 max-w-lg rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-300">{c.ruleTitle}</p>
          <p className="mt-3 whitespace-pre-line text-lg font-semibold text-white">{c.ruleBody}</p>
          {capture ? (
            <button type="button" className="btn-primary btn-primary--urgent mt-6" onClick={() => capture.openCapture()}>
              {c.cta}
            </button>
          ) : (
            <a href="#contato" className="btn-primary btn-primary--urgent mt-6 inline-flex">
              {c.cta}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function RunWhoGrid() {
  return (
    <div className="mt-14 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">{who.label}</p>
        <ul className="mt-6 space-y-3">
          {who.items.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-relaxed text-white/80">
              <span className="text-emerald-400">☞</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-orange-500/30 bg-orange-500/5 p-6">
        <p className="text-xs font-black uppercase text-orange-300">{who.notForTitle}</p>
        <ul className="mt-4 space-y-2">
          {who.notFor.map((item) => (
            <li key={item} className="text-sm text-white/55">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
