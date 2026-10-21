import { useEffect, useState } from "react";

export type PageMood = "trust" | "energy" | "desire" | "spectrum" | "logic" | "vault" | "value" | "launch" | "calm" | "commit" | "legal";

const DEFAULT_MOOD: PageMood = "trust";

export function usePageMood(rootSelector = "[data-mood-track]") {
  const [mood, setMood] = useState<PageMood>(DEFAULT_MOOD);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(rootSelector));
    if (!nodes.length) return;

    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.getAttribute("data-mood-track");
          if (!id) continue;
          ratios.set(id, entry.intersectionRatio);
        }

        let bestId = DEFAULT_MOOD;
        let bestRatio = 0;
        for (const node of nodes) {
          const id = node.getAttribute("data-mood-track") as PageMood;
          const ratio = ratios.get(id) ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }
        if (bestRatio > 0.08) setMood(bestId);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.08, 0.2, 0.35, 0.5, 0.75, 1] }
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [rootSelector]);

  useEffect(() => {
    document.documentElement.setAttribute("data-page-mood", mood);
    return () => document.documentElement.removeAttribute("data-page-mood");
  }, [mood]);

  return mood;
}
