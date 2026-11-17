import type { PortfolioProductionItem } from "@ederson-agencia/shared";
import { Globe } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ProductionProjectLogoProps = {
  site: PortfolioProductionItem;
  className?: string;
};

function logoCandidates(site: PortfolioProductionItem): string[] {
  const raw = [site.logoUrl, site.logoUrlFallback].map((s) => s?.trim()).filter(Boolean) as string[];
  return [...new Set(raw)];
}

export function ProductionProjectLogo({ site, className = "" }: ProductionProjectLogoProps) {
  const candidates = useMemo(() => logoCandidates(site), [site.logoUrl, site.logoUrlFallback]);
  const [index, setIndex] = useState(0);
  const wide = site.logoWide === true;
  const darkShell = site.logoShell === "dark";
  const src = candidates[index] ?? "";
  const exhausted = candidates.length === 0 || index >= candidates.length;

  useEffect(() => {
    setIndex(0);
  }, [site.logoUrl, site.logoUrlFallback]);

  const shellTone = darkShell
    ? "border-white/15 bg-[#0c0c0c]"
    : "border-white/10 bg-white";
  const shell = wide
    ? `flex h-12 w-[7.25rem] shrink-0 items-center justify-center overflow-hidden rounded-xl border ${shellTone} px-2 py-1.5 shadow-sm`
    : `flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border ${shellTone} p-1.5 shadow-sm`;

  if (exhausted) {
    return (
      <div className={`${shell} text-blue-glow ${className}`} aria-hidden>
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
        className="h-full w-full object-contain object-center"
        loading="eager"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setIndex((i) => i + 1)}
      />
    </div>
  );
}
