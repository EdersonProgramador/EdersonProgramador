import { BRAND_IDENTITY } from "@ederson-agencia/shared";
import { BrandMark } from "./BrandMark";

type BrandLogoProps = {
  variant?: "full" | "mark";
  size?: "sm" | "md";
  /** Oculta domínio em telas estreitas (nav mobile). */
  compact?: boolean;
  showDomain?: boolean;
  className?: string;
};

const markSizes = { sm: 32, md: 40 } as const;

export function BrandLogo({
  variant = "full",
  size = "md",
  compact = false,
  showDomain = true,
  className = ""
}: BrandLogoProps) {
  const markPx = markSizes[size];

  if (variant === "mark") {
    return <BrandMark size={markPx} className={className} />;
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <BrandMark size={markPx} className="shrink-0" />
      <span className="flex min-w-0 flex-col text-left leading-tight">
        <span
          className={`font-display font-bold tracking-wide text-white transition-colors group-hover:text-brand-primary ${size === "sm" ? "text-sm" : "text-sm md:text-[15px]"}`}
        >
          {BRAND_IDENTITY.name}
        </span>
        {showDomain ? (
          <span
            className={`font-mono text-[10px] uppercase tracking-widest text-white/40 ${compact ? "hidden md:inline" : ""}`}
          >
            {BRAND_IDENTITY.domain}
          </span>
        ) : null}
      </span>
    </span>
  );
}
