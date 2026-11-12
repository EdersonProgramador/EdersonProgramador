import { LAUNCH_FUNNEL_COPY } from "@ederson-agencia/shared";

export function BenefitMarquee() {
  const items = [...LAUNCH_FUNNEL_COPY.marquee, ...LAUNCH_FUNNEL_COPY.marquee];
  return (
    <div className="ui-marquee benefit-marquee overflow-hidden" aria-label="Benefícios do programa">
      <div className="benefit-marquee__track ui-marquee__track flex whitespace-nowrap">
        {items.map((text, i) => (
          <span key={`${text}-${i}`} className="inline-flex items-center gap-2.5">
            <span className="h-1 w-1 rounded-full bg-sky-400/90" aria-hidden />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
