import { BRAND_IDENTITY } from "@ederson-agencia/shared";
import { BRAND_MARK_SHAPE, BRAND_MARK_VIEWBOX } from "./brand-mark-paths";

type BrandMarkProps = {
  size?: number;
  className?: string;
  title?: string;
};

export function BrandMark({ size = 40, className = "", title = BRAND_IDENTITY.name }: BrandMarkProps) {
  const gradientId = `ep-brand-${size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={BRAND_MARK_VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={title}
    >
      <rect width="40" height="40" rx="10" fill="#070b14" />
      <rect x="0.75" y="0.75" width="38.5" height="38.5" rx="9.25" stroke={`url(#${gradientId}-ring)`} strokeWidth="1.25" />
      <path d={BRAND_MARK_SHAPE} fill={`url(#${gradientId}-fill)`} />
      <defs>
        <linearGradient id={`${gradientId}-fill`} x1="8" y1="8" x2="34" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7dd3fc" />
          <stop offset="0.45" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id={`${gradientId}-ring`} x1="4" y1="0" x2="36" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor={BRAND_IDENTITY.colors.primaryDeep} />
          <stop offset="0.5" stopColor={BRAND_IDENTITY.colors.primary} />
          <stop offset="1" stopColor={BRAND_IDENTITY.colors.primarySoft} />
        </linearGradient>
      </defs>
    </svg>
  );
}
