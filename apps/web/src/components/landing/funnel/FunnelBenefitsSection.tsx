import { Box, MessageCircle, PlayCircle, Radio, RefreshCw, Users } from "lucide-react";
import { LAUNCH_FUNNEL_COPY } from "@ederson-agencia/shared";

const icons = {
  play: PlayCircle,
  live: Radio,
  box: Box,
  users: Users,
  message: MessageCircle,
  refresh: RefreshCw
} as const;

export function FunnelBenefitsSection() {
  const b = LAUNCH_FUNNEL_COPY.benefits;
  return (
    <section id="beneficios" className="funnel-section border-t border-white/[0.06] bg-[#060606] py-14 sm:py-16">
      <div className="landing-container">
        <h2 className="text-center font-display text-2xl font-bold text-white sm:text-3xl">{b.title}</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {b.items.map((item) => {
            const Icon = icons[item.icon as keyof typeof icons];
            return (
              <article key={item.title} className="funnel-benefit-card">
                <Icon className="h-7 w-7 text-emerald-400" aria-hidden />
                <h3>{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{item.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
