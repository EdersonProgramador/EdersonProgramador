import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AGENCY_APP_BASE,
  ADMIN_COMERCIAL_STEPS,
  adminComercialStepLabel
} from "@ederson-agencia/shared";
import { apiGet } from "../../api";
import { useAdminProjectScope } from "../admin/admin-project-scope";

const ADMIN = `${AGENCY_APP_BASE}/admin`;

type OpsOverview = {
  leadsNew: number;
  enrollmentsDue: number;
  campaignsActive: number;
  contactsTotal: number;
};

/**
 * Console Comercial — processo em 4 etapas (substitui a landing de features).
 */
export function MarketingPlatformHub() {
  const { withProjectQuery } = useAdminProjectScope();
  const [ops, setOps] = useState<OpsOverview | null>(null);

  useEffect(() => {
    void apiGet<OpsOverview>("/agency/admin/ops/overview")
      .then(setOps)
      .catch(() => setOps(null));
  }, []);

  const hints: Record<string, string> = {
    captura: ops ? `${ops.leadsNew} leads novos · ${ops.contactsTotal} no CDP` : "Leads e fontes de entrada",
    nutricao: ops
      ? `${ops.campaignsActive} campanhas · ${ops.enrollmentsDue} disparos vencidos`
      : "Sequências de aquisição e follow-up",
    vendas: "Pipeline CRM e funil do cliente",
    relacionamento: "Clientes e fidelização"
  };

  return (
    <div className="admin-comercial-console space-y-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-[var(--app-text)]">Processo comercial</h2>
        <p className="max-w-2xl text-sm text-[var(--app-text-muted)]">
          Um fluxo único: capture → nutra → venda → relacione. Configure integrações em Sistema.
        </p>
      </header>

      <ol className="grid gap-3 sm:grid-cols-2">
        {ADMIN_COMERCIAL_STEPS.map((step) => (
          <li key={step.id}>
            <Link
              to={withProjectQuery(`${ADMIN}/${step.adminPath}`)}
              className="admin-ops-step-card"
            >
              <span className="admin-ops-step-card__num">{step.stepNumber}</span>
              <span>
                <span className="admin-ops-step-card__title">{adminComercialStepLabel(step)}</span>
                <span className="admin-ops-step-card__desc">{hints[step.id] ?? step.purpose}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap gap-2">
        <Link className="btn-primary" to={withProjectQuery(`${ADMIN}/comercial/captura`)}>
          Começar na Captura
        </Link>
        <Link className="btn-secondary" to={withProjectQuery(`${ADMIN}/comercial/nutricao`)}>
          Abrir Nutrição
        </Link>
        <Link className="btn-ghost" to={withProjectQuery(`${ADMIN}/marketing/integracoes`)}>
          Integrações (Sistema)
        </Link>
      </div>
    </div>
  );
}
