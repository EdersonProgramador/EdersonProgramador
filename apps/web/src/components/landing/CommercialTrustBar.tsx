import { BRAND_IDENTITY, MARKETING_COPY } from "@ederson-agencia/shared";
import { BadgeCheck, Shield } from "lucide-react";

const guarantee = MARKETING_COPY.guarantee.period;

export function CommercialTrustBar() {
  return (
    <div className="ui-trust-row" role="list" aria-label="Sinais de confiança">
      <span className="ui-badge ui-badge--accent" role="listitem">
        <Shield className="h-3.5 w-3.5" aria-hidden />
        Garantia {guarantee}
      </span>
      {BRAND_IDENTITY.values.map((value) => (
        <span key={value} className="ui-badge" role="listitem">
          <BadgeCheck className="h-3.5 w-3.5 opacity-70" aria-hidden />
          {value}
        </span>
      ))}
    </div>
  );
}
