import { BRAND_IDENTITY } from "@ederson-agencia/shared";
import { BRAND_MARK_LETTER_E, BRAND_MARK_LETTER_P, BRAND_MARK_VIEWBOX } from "./brand-mark-paths";

type BrandMarkProps = {
  size?: number;
  className?: string;
  title?: string;
};

/** Monograma EP — Ederson Programador. */
export function BrandMark({ size = 40, className = "", title = BRAND_IDENTITY.name }: BrandMarkProps) {
  const gradientId = `ep-border-${size}`;

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
      <rect width="40" height="40" rx="10" fill="#0f172a" />
      <rect x="0.75" y="0.75" width="38.5" height="38.5" rx="9.25" stroke={`url(#${gradientId})`} strokeWidth="1.5" />
      <path d={BRAND_MARK_LETTER_E} fill="#f8fafc" />
      <path d={BRAND_MARK_LETTER_P} fill={BRAND_IDENTITY.colors.primary} />
      <defs>
        <linearGradient id={gradientId} x1="5" y1="0" x2="35" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor={BRAND_IDENTITY.colors.primary} />
          <stop offset="0.45" stopColor={BRAND_IDENTITY.colors.accentIndigo} />
          <stop offset="1" stopColor={BRAND_IDENTITY.colors.primaryDeep} />
        </linearGradient>
      </defs>
    </svg>
  );
}
