import { useState } from "react";
import { Link } from "react-router-dom";
import { AGENCY_APP_BASE } from "@ederson-agencia/shared";
import { AdminProcessChrome } from "../components/admin/AdminProcessChrome";
import { useAdminProjectScope } from "../components/admin/admin-project-scope";
import { AdminClientsPage, AdminFunnelPage, AdminLeadsPage } from "./DashboardPages";
import {
  AdminMarketingCampaignsPage,
  AdminMarketingCdpPage,
  AdminMarketingCrmPage,
  AdminMarketingLoyaltyPage
} from "./AdminMarketingPlatformPages";

const ADMIN = `${AGENCY_APP_BASE}/admin`;

export function AdminComercialCapturaPage() {
  const { withProjectQuery } = useAdminProjectScope();
  const [tab, setTab] = useState<"leads" | "cdp">("leads");
  return (
    <AdminProcessChrome
      title="1. Captura"
      description="Entrada de leads e sincronização do CDP. Qualifique antes de nutrir."
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
        <Link className="admin-process__tab-link" to={withProjectQuery(`${ADMIN}/comercial/nutricao`)}>
          Próximo: Nutrição →
        </Link>
      </div>
      {tab === "leads" ? <AdminLeadsPage /> : <AdminMarketingCdpPage />}
    </AdminProcessChrome>
  );
}

export function AdminComercialNutricaoPage() {
  const { withProjectQuery } = useAdminProjectScope();
  return (
    <AdminProcessChrome
      title="2. Nutrição"
      description="Sequências por data: aquisição, re-marketing e follow-up."
    >
      <div className="admin-process__tabs">
        <span className="admin-process__tab is-active">Campanhas drip</span>
        <Link className="admin-process__tab-link" to={withProjectQuery(`${ADMIN}/comercial/vendas`)}>
          Próximo: Vendas →
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
      title="3. Vendas"
      description="Pipeline e funil comercial — uma entrada, sem duplicar Leads/CRM/Funil."
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
          Próximo: Relacionamento →
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
      title="4. Relacionamento"
      description="Clientes convertidos e programa de fidelização."
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
