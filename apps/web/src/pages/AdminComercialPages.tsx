import { useState } from "react";
import { Link } from "react-router-dom";
import { AGENCY_APP_BASE, agencyOpsLaneAdminPath } from "@ederson-agencia/shared";
import { AdminProcessChrome } from "../components/admin/AdminProcessChrome";
import { useAdminProjectScope } from "../components/admin/admin-project-scope";
import { AdminClientsPage, AdminFunnelPage, AdminLeadsPage } from "./DashboardPages";
import {
  AdminMarketingCampaignsPage,
  AdminMarketingCdpPage,
  AdminMarketingCrmPage,
  AdminMarketingLoyaltyPage
} from "./AdminMarketingPlatformPages";
import { AgencyOsDashboard } from "../components/admin/agency-os/AgencyOsDashboard";

const ADMIN = `${AGENCY_APP_BASE}/admin`;

export function AdminComercialCapturaPage() {
  const { withProjectQuery } = useAdminProjectScope();
  const [tab, setTab] = useState<"leads" | "cdp">("leads");
  return (
    <AdminProcessChrome
      title="1. Lead"
      description="Entrada de leads e sincronização do CDP — estágio 1 do pipeline Agency Ops."
    >
      <div className="admin-process__tabs">
        <button
          type="button"
          className={`admin-process__tab${tab === "leads" ? " is-active" : ""}`}
          onClick={() => setTab("leads")}
        >
          Leads
        </button>
        <button
          type="button"
          className={`admin-process__tab${tab === "cdp" ? " is-active" : ""}`}
          onClick={() => setTab("cdp")}
        >
          CDP / contatos
        </button>
        <Link className="admin-process__tab-link" to="/formulario" target="_blank" rel="noreferrer">
          Quiz público
        </Link>
        <Link className="admin-process__tab-link" to={withProjectQuery(`${ADMIN}/comercial/qualificacao`)}>
          Próximo: Qualificação →
        </Link>
      </div>
      {tab === "leads" ? <AdminLeadsPage /> : <AdminMarketingCdpPage />}
    </AdminProcessChrome>
  );
}

export function AdminComercialQualificacaoPage() {
  const { withProjectQuery } = useAdminProjectScope();
  return (
    <AdminProcessChrome
      title="2. Qualificação"
      description="Qualificar interesse, pacote e prontidão — status QUALIFIED."
    >
      <div className="admin-process__tabs">
        <Link className="admin-process__tab-link" to={withProjectQuery(`${ADMIN}/comercial/captura`)}>
          ← Lead
        </Link>
        <span className="admin-process__tab is-active">Pipeline</span>
        <Link className="admin-process__tab-link" to={withProjectQuery(`${ADMIN}/comercial/proposta`)}>
          Próximo: Proposta →
        </Link>
        <Link
          className="admin-process__tab-link"
          to={withProjectQuery(`${ADMIN}/${agencyOpsLaneAdminPath("marketing", "pipeline")}`)}
        >
          Board Marketing
        </Link>
      </div>
      <AdminMarketingCrmPage />
    </AdminProcessChrome>
  );
}

export function AdminComercialPropostaPage() {
  const { withProjectQuery } = useAdminProjectScope();
  return (
    <AdminProcessChrome
      title="3. Proposta"
      description="Gerar proposta com agentes IA, enviar e aguardar aceite."
    >
      <div className="admin-process__tabs">
        <Link className="admin-process__tab-link" to={withProjectQuery(`${ADMIN}/agentes`)}>
          Agentes IA
        </Link>
        <Link className="admin-process__tab-link" to={withProjectQuery(`${ADMIN}/comercial/negociacao`)}>
          Próximo: Negociação →
        </Link>
      </div>
      <AgencyOsDashboard deepDive />
    </AdminProcessChrome>
  );
}

export function AdminComercialNegociacaoPage() {
  const { withProjectQuery } = useAdminProjectScope();
  return (
    <AdminProcessChrome
      title="4. Negociação"
      description="Ajustes de escopo e valor — status NEGOTIATION."
    >
      <div className="admin-process__tabs">
        <Link className="admin-process__tab-link" to={withProjectQuery(`${ADMIN}/comercial/proposta`)}>
          ← Proposta
        </Link>
        <Link className="admin-process__tab-link" to={withProjectQuery(`${ADMIN}/comercial/contrato`)}>
          Próximo: Contrato →
        </Link>
      </div>
      <AdminMarketingCrmPage />
    </AdminProcessChrome>
  );
}

export function AdminComercialContratoPage() {
  const { withProjectQuery } = useAdminProjectScope();
  return (
    <AdminProcessChrome
      title="5. Contrato"
      description="Assinatura e checkout — status CONTRACT / funil do cliente."
    >
      <div className="admin-process__tabs">
        <span className="admin-process__tab is-active">Funil do cliente</span>
        <Link className="admin-process__tab-link" to={withProjectQuery(`${ADMIN}/comercial/relacionamento`)}>
          Próximo: Ativo →
        </Link>
      </div>
      <AdminFunnelPage />
    </AdminProcessChrome>
  );
}

export function AdminComercialNutricaoPage() {
  const { withProjectQuery } = useAdminProjectScope();
  return (
    <AdminProcessChrome
      title="Nutrição (campanhas)"
      description="Sequências drip — apoio ao pipeline (legado → Marketing Pipeline)."
    >
      <div className="admin-process__tabs">
        <span className="admin-process__tab is-active">Campanhas drip</span>
        <Link
          className="admin-process__tab-link"
          to={withProjectQuery(`${ADMIN}/${agencyOpsLaneAdminPath("marketing", "pipeline")}`)}
        >
          Pipeline Marketing →
        </Link>
      </div>
      <AdminMarketingCampaignsPage />
    </AdminProcessChrome>
  );
}

export function AdminComercialVendasPage() {
  const { withProjectQuery } = useAdminProjectScope();
  const [tab, setTab] = useState<"crm" | "funil">("crm");
  return (
    <AdminProcessChrome
      title="Pipeline / Vendas"
      description="Board CRM e funil — use os 6 estágios do Comercial."
    >
      <div className="admin-process__tabs">
        <button
          type="button"
          className={`admin-process__tab${tab === "crm" ? " is-active" : ""}`}
          onClick={() => setTab("crm")}
        >
          Pipeline
        </button>
        <button
          type="button"
          className={`admin-process__tab${tab === "funil" ? " is-active" : ""}`}
          onClick={() => setTab("funil")}
        >
          Funil do cliente
        </button>
        <Link className="admin-process__tab-link" to={withProjectQuery(`${ADMIN}/comercial/relacionamento`)}>
          Ativo →
        </Link>
      </div>
      {tab === "crm" ? <AdminMarketingCrmPage /> : <AdminFunnelPage />}
    </AdminProcessChrome>
  );
}

export function AdminComercialRelacionamentoPage() {
  const [tab, setTab] = useState<"clientes" | "fidelidade">("clientes");
  return (
    <AdminProcessChrome
      title="6. Ativo"
      description="Clientes convertidos e fidelização — estágio final do pipeline."
    >
      <div className="admin-process__tabs">
        <button
          type="button"
          className={`admin-process__tab${tab === "clientes" ? " is-active" : ""}`}
          onClick={() => setTab("clientes")}
        >
          Clientes
        </button>
        <button
          type="button"
          className={`admin-process__tab${tab === "fidelidade" ? " is-active" : ""}`}
          onClick={() => setTab("fidelidade")}
        >
          Fidelidade
        </button>
      </div>
      {tab === "clientes" ? <AdminClientsPage /> : <AdminMarketingLoyaltyPage />}
    </AdminProcessChrome>
  );
}
