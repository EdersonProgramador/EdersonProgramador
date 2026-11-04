import { useCallback, useEffect, useMemo, useState } from "react";
import { devTechBrandIconCandidates } from "@ederson-agencia/shared";

type DevTechBrandIconProps = {
  optionId: string;
  label: string;
  size?: number;
  className?: string;
};

function initials(label: string): string {
  const parts = label.replace(/[+()]/g, " ").split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return label.slice(0, 2).toUpperCase();
}

/** Logo de marca: assets locais, Simple Icons CDN e fallback legado. */
export function DevTechBrandIcon({ optionId, label, size = 22, className = "" }: DevTechBrandIconProps) {
  const candidates = useMemo(() => devTechBrandIconCandidates(optionId), [optionId]);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    setIndex(0);
  }, [optionId, candidates.join("|")]);
  const failed = index >= candidates.length;
  const src = candidates[index];

  const onError = useCallback(() => {
    setIndex((i) => i + 1);
  }, []);

  if (!candidates.length || failed) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-md bg-[var(--app-hover)] text-[10px] font-bold leading-none text-[var(--app-text-muted)] ${className}`}
        style={{ width: size, height: size }}
        aria-hidden
      >
        {initials(label)}
      </span>
    );
  }

  return (
    <img
      key={src}
      src={src}
      alt=""
      width={size}
      height={size}
      className={`dev-tech-brand-icon shrink-0 object-contain ${className}`}
      loading="lazy"
      decoding="async"
      onError={onError}
    />
  );
}
