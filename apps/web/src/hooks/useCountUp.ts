import { useEffect, useState } from "react";

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function useCountUp(target: number, active: boolean, durationMs = 1100) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }

    let frame = 0;
    let start: number | null = null;

    const step = (now: number) => {
      if (start === null) start = now;
      const progress = Math.min((now - start) / durationMs, 1);
      setValue(Math.round(target * easeOutCubic(progress)));
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [active, durationMs, target]);

  return value;
}

export type ParsedStatValue = {
  prefix: string;
  suffix: string;
  target: number;
};

export function parseStatValue(raw: string): ParsedStatValue | null {
  const match = raw.trim().match(/^(~?)(\d+)(\+|d)?$/);
  if (!match) return null;
  return {
    prefix: match[1] ?? "",
    suffix: match[3] ?? "",
    target: Number(match[2])
  };
}
