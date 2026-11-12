import type { PortfolioProductionItem } from "@ederson-agencia/shared";
import { Globe } from "lucide-react";
import { useEffect, useState } from "react";

type ProductionProjectLogoProps = {
  site: PortfolioProductionItem;
  className?: string;
};

export function ProductionProjectLogo({ site, className = "" }: ProductionProjectLogoProps) {
  const [failed, setFailed] = useState(false);
  const src = site.logoUrl?.trim();
  const wide = site.logoWide === true;

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const shell = wide
    ? "flex h-12 w-[7.25rem] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white px-2 py-1.5 shadow-sm"
    : "flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white p-1.5 shadow-sm";

  if (!src || failed) {
    return (
      <div className={`${shell} bg-blue-deep/80 text-blue-glow ${className}`} aria-hidden>
        <Globe className="h-6 w-6" />
      </div>
    );
  }

  return (
    <div className={`${shell} ${className}`}>
      <img
        key={src}
        src={src}
        alt={`Logo ${site.name}`}
        width={wide ? 116 : 48}
        height={48}
        className="h-full w-full object-contain object-left"
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
