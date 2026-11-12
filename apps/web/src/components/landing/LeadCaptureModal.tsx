import { useEffect, useRef, useState } from "react";
import { Loader2, X } from "lucide-react";
import { LAUNCH_FUNNEL_COPY } from "@ederson-agencia/shared";
import { submitLeadCapture } from "../../lib/submit-lead-capture";

const copy = LAUNCH_FUNNEL_COPY.captureModal;

type LeadCaptureModalProps = {
  open: boolean;
  onClose: () => void;
  packageTier?: "essential" | "professional" | "advanced";
};

export function LeadCaptureModal({ open, onClose, packageTier }: LeadCaptureModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) {
      setFeedback(null);
      setError(null);
      setConsent(false);
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent) {
      setError("Marque o consentimento LGPD para continuar.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      const res = await submitLeadCapture({
        name: String(form.get("name") ?? "").trim(),
        email: String(form.get("email") ?? "").trim(),
        phone: String(form.get("phone") ?? "").trim(),
        packageTier: packageTier ?? undefined,
        consentLgpd: true
      });
      setFeedback(res.message || copy.success);
      event.currentTarget.reset();
      setConsent(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar. Tente de novo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="lead-capture-dialog fixed inset-0 z-[100] m-0 max-h-none max-w-none border-0 bg-transparent p-0 backdrop:bg-black/70"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div
        className="ui-modal-panel lead-capture-panel mx-auto mt-[10vh] w-[min(100%,26rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-[var(--app-text)]">{copy.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--app-text-muted)]">{copy.subtitle}</p>
          </div>
          <button type="button" className="btn-ghost shrink-0 p-2" onClick={onClose} aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </div>

        {feedback ? (
          <p className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            {feedback}
          </p>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <label className="block">
              <span className="ui-field-label">{copy.fields.name}</span>
              <input
                name="name"
                required
                minLength={2}
                autoComplete="name"
                className="input w-full"
              />
            </label>
            <label className="block">
              <span className="ui-field-label">{copy.fields.email}</span>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="input w-full"
              />
            </label>
            <label className="block">
              <span className="ui-field-label">{copy.fields.phone}</span>
              <input
                name="phone"
                type="tel"
                required
                minLength={8}
                autoComplete="tel"
                placeholder="(11) 99999-9999"
                className="input w-full"
              />
            </label>
            <label className="flex gap-3 text-xs leading-relaxed text-[var(--app-text-muted)]">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1"
              />
              <span>{copy.consent}</span>
            </label>
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
            <button type="submit" disabled={submitting} className="btn-primary w-full font-semibold tracking-wide">
              {submitting ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : copy.submit}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-[11px] text-[var(--app-text-muted)]">
          Também pode usar o formulário completo na seção{" "}
          <a href="#contato" className="underline" onClick={onClose}>
            Contato
          </a>
          .
        </p>
      </div>
    </dialog>
  );
}
