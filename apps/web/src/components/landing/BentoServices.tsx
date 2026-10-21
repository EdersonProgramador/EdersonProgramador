import { BarChart3, Brain, Cloud, Code2, Monitor } from "lucide-react";
import { MARKETING_COPY } from "@ederson-agencia/shared";

const copy = MARKETING_COPY;
const icons = [Code2, Brain, Cloud, Monitor, BarChart3];

export function BentoServices() {
  const [featured, ...rest] = copy.services.items;

  return (
    <div className="bento-grid mt-14 md:grid-cols-2 lg:grid-cols-3">
      <article className="bento-cell bento-cell-feature bento-feature glass-card group lg:col-span-2 lg:row-span-2">
        <div className="bento-icon">
          <Code2 className="h-6 w-6" />
        </div>
        <h3 className="mt-6 font-display text-2xl font-bold text-white">{featured.title}</h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-white/65 md:text-base">{featured.text}</p>
        <p className="mt-auto pt-8 font-mono text-xs text-sky-300/70">React · Node · APIs · Cloud</p>
      </article>

      {rest.map((item, i) => {
        const Icon = icons[i + 1] ?? BarChart3;
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
