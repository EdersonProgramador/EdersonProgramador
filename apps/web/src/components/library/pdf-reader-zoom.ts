export const ZOOM_MIN = 25;
export const ZOOM_MAX = 400;
export const ZOOM_DEFAULT = 100;

export function clampZoom(percent: number): number {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(percent)));
}

/** Passo maior ao afastar; menor perto de 100% para ajuste fino. */
export function stepZoom(percent: number, direction: -1 | 1, fine = false): number {
  const step = fine
    ? 5
    : percent < 50
      ? 5
      : percent <= 100
        ? 10
        : percent <= 200
          ? 15
          : 25;
  return clampZoom(percent + direction * step);
}

export const ZOOM_PRESETS = [50, 75, 100, 125, 150, 200, 250, 300] as const;
