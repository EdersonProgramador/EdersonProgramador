import { LAUNCH_FUNNEL_COPY } from "@ederson-agencia/shared";

const sym = LAUNCH_FUNNEL_COPY.marqueeSymbols;

export function FunnelMarquee() {
  const items = [...LAUNCH_FUNNEL_COPY.marquee, ...LAUNCH_FUNNEL_COPY.marquee];
  return (
    <div className="funnel-marquee" aria-hidden>
      <div className="funnel-marquee__track">
        {items.map((text, i) => (
          <span key={`${text}-${i}`} className="inline-flex items-center gap-2">
            <span className="funnel-marquee__sym">{sym}</span>
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
