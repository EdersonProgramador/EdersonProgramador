import { ClipboardList, Layout, Rocket, Smartphone } from "lucide-react";
import { MARKETING_COPY } from "@ederson-agencia/shared";

const copy = MARKETING_COPY;
const icons = [ClipboardList, Layout, Smartphone, Rocket];

export function BentoServices() {
  return (
    <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:gap-5">
      {copy.services.items.map((item, i) => {
        const Icon = icons[i] ?? Rocket;
        return (
          <article key={item.title} className="bento-cell glass-card group min-h-[180px]">
            <div className="bento-icon">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/60">{item.text}</p>
          </article>
        );
      })}
    </div>
  );
}
