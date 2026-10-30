import type { ReactNode } from "react";
import { Check, CreditCard, FileSignature, Package, Radio, Rocket } from "lucide-react";
import { AGENCY_FUNNEL_COPY } from "@ederson-agencia/shared";

const STEP_ICONS: Record<string, typeof Radio> = {
  live: Radio,
  package: Package,
  contract: FileSignature,
  checkout: CreditCard,
  delivery: Rocket
};

const STEP_ORDER = AGENCY_FUNNEL_COPY.steps.map((s) => s.key);

export function funnelStepIndex(key: string) {
  return STEP_ORDER.indexOf(key);
}

export function ClientFunnelStepper({
  currentKey,
  liveOk
}: {
  currentKey: string;
  liveOk: boolean;
}) {
  const currentIdx = funnelStepIndex(currentKey);

  return (
    <nav aria-label="Etapas do funil" className="mb-8">
      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-2">
        {AGENCY_FUNNEL_COPY.steps.map((step) => {
          const idx = funnelStepIndex(step.key);
          const Icon = STEP_ICONS[step.key] ?? Radio;
          let status: "done" | "current" | "upcoming" = "upcoming";
          if (idx < currentIdx) status = "done";
          else if (idx === currentIdx) status = "current";
          if (step.key === "live" && liveOk && currentIdx > 0) status = "done";

          return (
            <li
              key={step.key}
              className={`relative flex flex-col items-center rounded-xl border px-2 py-3 text-center transition ${
                status === "current"
                  ? "border-sky-500/60 bg-gradient-to-b from-sky-500/15 to-transparent shadow-[0_0_24px_-8px_rgba(14,165,233,0.5)]"
                  : status === "done"
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-[var(--app-border)] bg-[var(--app-hover)]/40 opacity-80"
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full ${
                  status === "current"
                    ? "bg-sky-500 text-white"
                    : status === "done"
                      ? "bg-emerald-500/90 text-white"
                      : "bg-[var(--app-panel)] text-[var(--app-text-muted)]"
                }`}
              >
                {status === "done" ? <Check className="h-4 w-4" aria-hidden /> : <Icon className="h-4 w-4" aria-hidden />}
              </span>
              <span
                className={`mt-2 text-[11px] font-semibold uppercase tracking-wide ${
                  status === "current" ? "text-sky-600 dark:text-sky-300" : "text-[var(--app-text-muted)]"
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-[var(--app-hover)]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 via-violet-500 to-emerald-500 transition-all duration-500"
          style={{
            width: `${Math.max(8, ((currentIdx + 1) / STEP_ORDER.length) * 100)}%`
          }}
        />
      </div>
    </nav>
  );
}

export function FunnelStepPanel({
  eyebrow,
  title,
  description,
  children
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-panel)]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-sky-500/10 via-violet-500/5 to-transparent"
        aria-hidden
      />
      <div className="relative space-y-5 p-6 sm:p-8">
        <header>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400">{eyebrow}</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-[var(--app-text)] sm:text-2xl">{title}</h3>
          {description ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--app-text-muted)]">{description}</p> : null}
        </header>
        {children}
      </div>
    </div>
  );
}

export function streamEmbedUrl(streamUrl: string): string | null {
  try {
    const u = new URL(streamUrl);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts[0] === "embed" && parts[1]) return `https://www.youtube.com/embed/${parts[1]}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}
