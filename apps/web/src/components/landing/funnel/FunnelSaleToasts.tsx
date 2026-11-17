import { useCallback, useEffect, useRef, useState } from "react";
import { LAUNCH_FUNNEL_COPY } from "@ederson-agencia/shared";

const variants = LAUNCH_FUNNEL_COPY.saleToastVariants;

export type FunnelSaleToast = {
  id: string;
  type: "lead" | "pix" | "sale";
  title: string;
  value: string;
  time: string;
};

const RECENT_LIMIT = 8;
/** Tempo visível de cada popup. */
const VISIBLE_MS = 2000;
/** Pausa aleatória entre um popup e o próximo (após sumir). */
const GAP_MIN_MS = 6500;
const GAP_MAX_MS = 14000;
const FIRST_DELAY_MS = 1800;

function randomInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pickOne<T>(items: readonly T[], avoid?: T): T {
  const pool = avoid !== undefined ? items.filter((x) => x !== avoid) : [...items];
  if (pool.length === 0) return items[randomInt(0, items.length - 1)];
  return pool[randomInt(0, pool.length - 1)];
}

function fillTemplate(template: string, name: string, city: string, formN: number) {
  return template.replaceAll("{name}", name).replaceAll("{city}", city).replaceAll("{n}", String(formN));
}

function randomTimeLabel() {
  if (Math.random() < 0.22) return "agora";
  const min = randomInt(1, 47);
  return `há ${min} min`;
}

function toastFingerprint(t: Pick<FunnelSaleToast, "title" | "value">) {
  return `${t.title}|${t.value}`;
}

function buildRandomToast(recent: Set<string>): FunnelSaleToast {
  const name = pickOne(variants.firstNames);
  const city = pickOne(variants.cities);
  const formN = randomInt(120, 984);
  const roll = Math.random();
  const kind: "lead" | "pix" | "sale" = roll < 0.42 ? "lead" : roll < 0.78 ? "pix" : "sale";

  const source =
    kind === "lead" ? variants.lead : kind === "pix" ? variants.proposal : variants.contract;

  let title = pickOne(source.titles);
  let value = fillTemplate(pickOne(source.valueTemplates), name, city, formN);
  let fp = toastFingerprint({ title, value });
  let attempts = 0;

  while (recent.has(fp) && attempts < 12) {
    title = pickOne(source.titles, title);
    value = fillTemplate(
      pickOne(source.valueTemplates),
      pickOne(variants.firstNames),
      pickOne(variants.cities),
      randomInt(120, 984)
    );
    fp = toastFingerprint({ title, value });
    attempts += 1;
  }

  const type = kind === "pix" ? "pix" : kind === "sale" ? "sale" : "lead";

  return {
    id: `${Date.now()}-${randomInt(1000, 9999)}`,
    type,
    title,
    value,
    time: randomTimeLabel()
  };
}

export function FunnelSaleToasts() {
  const [toast, setToast] = useState<FunnelSaleToast | null>(null);
  const recentRef = useRef<string[]>([]);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const showOne = () => {
      if (cancelled) return;
      const recent = new Set(recentRef.current);
      const next = buildRandomToast(recent);
      recentRef.current = [...recentRef.current, toastFingerprint(next)].slice(-RECENT_LIMIT);
      setToast(next);

      schedule(() => {
        if (cancelled) return;
        setToast(null);
        schedule(showOne, randomInt(GAP_MIN_MS, GAP_MAX_MS));
      }, VISIBLE_MS);
    };

    schedule(showOne, FIRST_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimers();
    };
  }, [clearTimers, schedule]);

  if (!toast) return null;

  return (
    <div className="funnel-toast-stack" aria-live="polite" aria-relevant="additions text">
      <div key={toast.id} className={`funnel-toast funnel-toast--${toast.type} animate-fade-up`}>
        <p className="funnel-toast__title">{toast.title}</p>
        <p className="funnel-toast__value">{toast.value}</p>
        <p className="funnel-toast__time">{toast.time}</p>
      </div>
    </div>
  );
}
