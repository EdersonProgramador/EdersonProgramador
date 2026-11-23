import { Zap } from "lucide-react";
import type { ReactNode } from "react";

type ClientPortalBannerProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  footer?: ReactNode;
};

/** Hero estilo Amplifica CRM — marca Agência Ederson Programador. */
export function ClientPortalBanner({ title, subtitle, badge, footer }: ClientPortalBannerProps) {
  return (
    <div className="acp-banner">
      <div className="acp-banner__content">
        {badge ? <span className="acp-banner__badge">{badge}</span> : null}
        <h1 className="acp-banner__title">{title}</h1>
        {subtitle ? <p className="acp-banner__subtitle">{subtitle}</p> : null}
        {footer ? <div className="acp-banner__footer">{footer}</div> : null}
      </div>
      <Zap className="acp-banner__decor" aria-hidden />
    </div>
  );
}