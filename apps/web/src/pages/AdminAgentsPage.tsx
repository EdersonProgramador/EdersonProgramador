import { AdminProcessChrome } from "../components/admin/AdminProcessChrome";
import { AgencyOsDashboard } from "../components/admin/agency-os/AgencyOsDashboard";

export function AdminAgentsPage() {
  return (
    <AdminProcessChrome
      title="Agentes IA"
      description="Deep-dive: bootstrap por cliente, skills de branding/marketing e fila de aprovação."
    >
      <AgencyOsDashboard deepDive />
    </AdminProcessChrome>
  );
}
