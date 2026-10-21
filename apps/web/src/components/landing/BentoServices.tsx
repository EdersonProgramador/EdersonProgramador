import { Code2, Layers, Rocket, Sparkles } from "lucide-react";
import { MARKETING_COPY } from "@ederson-agencia/shared";

const copy = MARKETING_COPY;
const icons = [Code2, Sparkles, Layers, Rocket];

export function BentoServices() {
  const [featured, ...rest] = copy.services.items;

  return (
    <div className="bento-grid mt-14">
      <article className="bento-cell bento-cell-feature bento-feature glass-card group md:col-span-2 md:row-span-2">
        <div className="bento-icon">
          <Code2 className="h-6 w-6" />
        </div>
        <h3 className="mt-6 font-display text-2xl font-bold text-white">{featured.title}</h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-white/65 md:text-base">{featured.text}</p>
        <p className="mt-auto pt-8 font-mono text-xs text-sky-300/70">Stack · React · Node · Cloud</p>
      </article>

      {rest.map((item, i) => {
        const Icon = icons[i + 1] ?? Rocket;
        return (
          <article key={item.title} className="bento-cell glass-card group">
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
