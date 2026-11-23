import { BRAND_IDENTITY } from "@ederson-agencia/shared";
import { Mail, MessageCircle } from "lucide-react";
import { ClientPortalBanner } from "../../components/portal/client-amplifica/ClientPortalBanner";

export function AgencyClientSupportPage() {
  const contactEmail = "contato@" + BRAND_IDENTITY.domain;

  return (
    <div className="space-y-2">
      <ClientPortalBanner
        badge="Suporte"
        title="Fale com a equipe"
        subtitle="Canal direto com a agência para dúvidas sobre entregas, aprovações e contrato."
      />

      <p className="acp-section-title">Canais</p>
      <div className="space-y-3">
        <a
          href={`mailto:${contactEmail}?subject=${encodeURIComponent("Portal do cliente — suporte")}`}
          className="acp-contact"
        >
          <span className="acp-module__icon shrink-0">
            <Mail className="h-6 w-6" />
          </span>
          <span>
            <span className="block text-sm font-extrabold uppercase tracking-tight text-[var(--acp-ink)]">E-mail</span>
            <span className="mt-0.5 block text-sm text-[var(--acp-muted)]">{contactEmail}</span>
          </span>
        </a>

        <div className="acp-panel">
          <div className="flex gap-3">
            <span className="acp-module__icon shrink-0">
              <MessageCircle className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-tight text-[var(--acp-ink)]">WhatsApp</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--acp-muted)]">
                Use o número da equipe que acompanha seu projeto para alinhamentos rápidos. Em breve, abertura de chamados
                direto neste portal.
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-xs font-medium text-[var(--acp-muted)]">
        Horário comercial · {BRAND_IDENTITY.primarySystem.name}
      </p>
    </div>
  );
}