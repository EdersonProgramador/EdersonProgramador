import {
  AGENCY_CLIENT_PORTAL_CONTRACT_PATH,
  AGENCY_CLIENT_PORTAL_PROJECT_PATH,
  AGENCY_CLIENT_PORTAL_SUPPORT_PATH,
  AGENCY_PROFILE_PATH,
  BRAND_IDENTITY,
  CONTRACT_COPY
} from "@ederson-agencia/shared";
import { CheckCircle2, FolderKanban, Headphones, User, ClipboardCheck, Sparkles } from "lucide-react";
import { ClientPortalBanner } from "../../components/portal/client-amplifica/ClientPortalBanner";
import { ClientPortalModuleCard } from "../../components/portal/client-amplifica/ClientPortalModuleCard";
import { ClientPortalStatCard } from "../../components/portal/client-amplifica/ClientPortalStatCard";
import { useAgencySession } from "../../stores/authStore";
import { useClientPortalStats } from "./useClientPortalStats";

export function AgencyClientPortalHome() {
  const user = useAgencySession()?.user;
  const stats = useClientPortalStats();
  const firstName = user?.name?.split(/\s+/)[0] ?? "Cliente";

  return (
    <div className="space-y-2">
      <ClientPortalBanner
        badge="Portal do cliente"
        title={`Olá, ${firstName}`}
        subtitle={CONTRACT_COPY.clientPortalHint}
        footer={
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-100">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            {BRAND_IDENTITY.primarySystem.name}
          </span>
        }
      />

      <p className="acp-section-title">Resumo</p>
      <div className="acp-stat-grid acp-stat-grid--3">
        <ClientPortalStatCard
          label="Projetos ativos"
          value={stats.projects ?? "—"}
          icon={FolderKanban}
          accent="#6366f1"
        />
        <ClientPortalStatCard
          label="Suas aprovações"
          value={stats.awaitingApproval ?? "—"}
          icon={ClipboardCheck}
          accent="#f59e0b"
        />
        <ClientPortalStatCard
          label="Status"
          value="Ativo"
          icon={CheckCircle2}
          accent="#10b981"
        />
      </div>

      <p className="acp-section-title">Módulos</p>
      <div className="acp-module-grid">
        <ClientPortalModuleCard
          to={AGENCY_CLIENT_PORTAL_PROJECT_PATH}
          title="Meu projeto"
          description="Fases, entregas e aprovações dos seus projetos com a agência."
          icon={FolderKanban}
        />
        <ClientPortalModuleCard
          to={AGENCY_CLIENT_PORTAL_CONTRACT_PATH}
          title="Contratar serviços"
          description="Pacotes START, BUSINESS e ENTERPRISE — live, contrato e checkout no mesmo fluxo."
          icon={Sparkles}
        />
        <ClientPortalModuleCard
          to={AGENCY_CLIENT_PORTAL_SUPPORT_PATH}
          title="Suporte"
          description={`Dúvidas, ajustes e contato com a equipe ${BRAND_IDENTITY.name}.`}
          icon={Headphones}
        />
        <ClientPortalModuleCard
          to={AGENCY_PROFILE_PATH}
          title="Minha conta"
          description="Dados de acesso e informações cadastrais do contrato."
          icon={User}
        />
      </div>
    </div>
  );
}