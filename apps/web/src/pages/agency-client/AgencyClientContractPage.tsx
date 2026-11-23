import { useRef, useState } from "react";
import { AGENCY_FUNNEL_COPY, type PackageTierId } from "@ederson-agencia/shared";
import { Sparkles } from "lucide-react";
import { ClientFunnelPanel } from "../../components/portal/ClientFunnelPanel";
import { ClientPortalBanner } from "../../components/portal/client-amplifica/ClientPortalBanner";
import { ClientPortalPlanGrid } from "../../components/portal/client-amplifica/ClientPortalPlanGrid";

/** Planos (visual Amplifica) + funil de contratação no portal do cliente. */
export function AgencyClientContractPage() {
  const ui = AGENCY_FUNNEL_COPY.client;
  const [tier, setTier] = useState<PackageTierId>("professional");
  const funnelRef = useRef<HTMLDivElement>(null);

  function selectTier(next: PackageTierId) {
    setTier(next);
    window.requestAnimationFrame(() => {
      funnelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <div className="space-y-2">
      <ClientPortalBanner
        badge="Contratação"
        title={ui.title}
        subtitle="Escolha o pacote (START, BUSINESS ou ENTERPRISE) e avance pelas etapas: live, contrato e checkout."
        footer={
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-100">
            <Sparkles className="h-4 w-4" aria-hidden />
            Live · contrato · checkout
          </span>
        }
      />

      <p className="acp-section-title">Pacotes de serviço</p>
      <ClientPortalPlanGrid selectedTier={tier} onSelect={selectTier} />

      <p className="acp-section-title" id="contratacao-etapas">
        Etapas de contratação
      </p>
      <p className="mb-2 text-sm text-[var(--acp-muted)]">
        O pacote escolhido acima é usado na etapa de confirmação. Valores finais seguem a configuração vigente do funil.
      </p>
      <div ref={funnelRef} className="acp-funnel-host">
        <ClientFunnelPanel suppressPackageGrid selectedTier={tier} onSelectedTierChange={setTier} />
      </div>
    </div>
  );
}