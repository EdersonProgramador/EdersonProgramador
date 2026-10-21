import { useState } from "react";
import { BRAND_IDENTITY } from "@ederson-agencia/shared";
import { BrandMark } from "./BrandMark";

type BrandLogoProps = {
  variant?: "full" | "mark";
  size?: "sm" | "md";
  className?: string;
};

const logoImgClass = {
  sm: "brand-logo-img brand-logo-img--sm",
  md: "brand-logo-img brand-logo-img--md"
} as const;
const markSizes = { sm: 36, md: 44 } as const;

function LogoFallback({ size, className }: { size: "sm" | "md"; className?: string }) {
  const markPx = markSizes[size];
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <BrandMark size={markPx} className="shrink-0" />
      <span className="flex min-w-0 flex-col text-left leading-none">
        <span className="font-display text-xs font-extrabold uppercase tracking-[0.12em] text-white">
          {BRAND_IDENTITY.nameDisplay.primary}
        </span>
        <span className="mt-1 font-display text-[9px] font-semibold uppercase tracking-[0.28em] text-brand-primary">
          {BRAND_IDENTITY.nameDisplay.secondary}
        </span>
      </span>
    </span>
  );
}

export function BrandLogo({
  variant = "full",
  size = "md",
  className = ""
}: BrandLogoProps) {
  const [imgFailed, setImgFailed] = useState(false);

  if (variant === "mark") {
    return <BrandMark size={markSizes[size]} className={className} />;
  }

  if (imgFailed) {
    return <LogoFallback size={size} className={className} />;
  }

  return (
    <span className={`inline-flex shrink-0 ${className}`}>
      <img
        src={BRAND_IDENTITY.assets.logoHorizontal}
        alt={BRAND_IDENTITY.name}
        width={640}
        height={200}
        className={`${logoImgClass[size]} object-contain object-left`}
        onError={() => setImgFailed(true)}
        decoding="async"
      />
    </span>
  );
}
