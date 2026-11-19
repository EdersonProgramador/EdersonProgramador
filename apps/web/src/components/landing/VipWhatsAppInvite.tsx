import { LAUNCH_FUNNEL_COPY } from "@ederson-agencia/shared";
import { ShieldCheck } from "lucide-react";

const vip = LAUNCH_FUNNEL_COPY.vipGroup;

function resolveVipGroupUrl(): string {
  const fromEnv = (import.meta.env.VITE_VIP_WHATSAPP_GROUP_URL as string | undefined)?.trim();
  return fromEnv || vip.whatsappUrl;
}

type VipWhatsAppInviteProps = {
  /** Compacto para caber no modal pós-proposta. */
  compact?: boolean;
  className?: string;
  /** Chamado ao clicar no CTA (ex.: fechar modal antes de abrir o WhatsApp). */
  onWhatsAppClick?: () => void;
};

export function VipWhatsAppInvite({
  compact = false,
  className = "",
  onWhatsAppClick
}: VipWhatsAppInviteProps) {
  const href = resolveVipGroupUrl();

  return (
    <div className={`vip-invite ${compact ? "vip-invite--compact" : ""} ${className}`.trim()}>
      <p className="vip-invite__eyebrow">{vip.eyebrow}</p>
      <h3 className="vip-invite__title">{vip.title}</h3>
      <p className="vip-invite__lead">{vip.lead}</p>

      <ul className="vip-invite__benefits">
        {vip.benefits.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary btn-primary--urgent vip-invite__cta"
        onClick={() => onWhatsAppClick?.()}
      >
        {vip.cta}
      </a>
      <p className="vip-invite__free">{vip.freeNote}</p>

      <aside className="vip-invite__security" aria-label="Aviso de segurança">
        <p className="vip-invite__security-title">
          <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden />
          {vip.securityTitle}
        </p>
        <p className="vip-invite__security-body">{vip.securityBody}</p>
        <p className="vip-invite__security-body vip-invite__security-body--warn">{vip.securityWarn}</p>
      </aside>

      {!compact ? (
        <p className="vip-invite__legal">
          <a href="#privacidade">{vip.privacy}</a>
          <span aria-hidden> · </span>
          <a href="#termos">{vip.terms}</a>
          <span className="block mt-1 opacity-70">{vip.copyright}</span>
        </p>
      ) : null}
    </div>
  );
}
