import { BRAND_IDENTITY } from "@ederson-agencia/shared";
import { FolderKanban, ClipboardCheck } from "lucide-react";
import { ClientPortalBanner } from "../../components/portal/client-amplifica/ClientPortalBanner";
import { ClientPortalStatCard } from "../../components/portal/client-amplifica/ClientPortalStatCard";
import { ClientDashboardProjects } from "./ClientDashboardProjects";
import { useClientPortalStats } from "./useClientPortalStats";

export function AgencyClientProjectPage() {
  const stats = useClientPortalStats();

  return (
    <div className="space-y-2">
      <ClientPortalBanner
        badge="Entregas"
        title="Meus projetos"
        subtitle={`Acompanhe fases, aprovações e entregas com a ${BRAND_IDENTITY.primarySystem.name}.`}
      />

      <div className="acp-stat-grid">
        <ClientPortalStatCard
          label="Projetos"
          value={stats.projects ?? 0}
          icon={FolderKanban}
        />
        <ClientPortalStatCard
          label="Aprovações pendentes"
          value={stats.awaitingApproval ?? 0}
          icon={ClipboardCheck}
          accent="#f59e0b"
        />
      </div>

      <p className="acp-section-title">Em andamento</p>
      <ClientDashboardProjects />
    </div>
  );
}