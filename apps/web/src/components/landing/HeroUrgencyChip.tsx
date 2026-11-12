import { LAUNCH_FUNNEL_COPY } from "@ederson-agencia/shared";
import { Sparkles } from "lucide-react";

export function HeroUrgencyChip() {
  return (
    <p className="ui-urgency-chip" role="status">
      <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>{LAUNCH_FUNNEL_COPY.scarcity.label}</span>
      <span className="ui-urgency-chip__dot" aria-hidden />
      <span className="font-medium text-[var(--app-text)]">Cadastro aberto neste lote</span>
    </p>
  );
}
