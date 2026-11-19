import { AdminProcessChrome } from "../components/admin/AdminProcessChrome";
import { AgencyOsDashboard } from "../components/admin/agency-os/AgencyOsDashboard";

export function AdminOpsHomePage() {
  return (
    <AdminProcessChrome
      title="Comando operacional"
      description="Agency OS — multi-client, campanhas e agentes especialistas."
    >
      <AgencyOsDashboard />
    </AdminProcessChrome>
  );
}
