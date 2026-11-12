import { LAUNCH_FUNNEL_COPY } from "@ederson-agencia/shared";

export function FunnelTopicsStrip() {
  const base = LAUNCH_FUNNEL_COPY.topics;
  const topics = [...base, ...base];

  return (
    <section className="border-t border-white/[0.06] py-4" aria-label="Assuntos do programa">
      <p className="landing-container mb-3 text-center text-xs font-bold uppercase tracking-widest text-white/40">
        Tipo de assunto que trabalhamos
      </p>
      <div className="funnel-topics-marquee" aria-hidden>
        <div className="funnel-topics-marquee__track">
          {topics.map((topic, i) => (
            <span key={`${topic}-${i}`} className="funnel-topic-chip">
              {topic}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
