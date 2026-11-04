import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import { ADMIN_BASE } from "../components/admin/AdminOperationsLayout";
import { BRANDING_OPERATION_NAV, findBrandingOperationNavContext } from "@ederson-agencia/shared";
import { AdminPillarStatsHubPage } from "./AdminPillarStatsHubPage";

function hubViewFromPath(pathname: string): string | null {
  const marker = "/admin/operacao/branding/";
  const idx = pathname.indexOf(marker);
  if (idx === -1) return null;
  return pathname.slice(idx + marker.length).split("/")[0] ?? null;
}

export function AdminBrandingHubPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const view = hubViewFromPath(location.pathname);
  const projectId = searchParams.get("project") ?? "";
  const q = projectId ? `?project=${encodeURIComponent(projectId)}` : "";
  const adminPath = view ? `operacao/branding/${view}` : "";
  const navCtx = adminPath ? findBrandingOperationNavContext(adminPath) : null;
  const navItem = BRANDING_OPERATION_NAV.flatMap((s) => s.items).find((i) => i.id === view);

  if (view !== "estatistica" || !navItem) {
    return <Navigate to={`${ADMIN_BASE}/operacao/branding/diagnostico${q}`} replace />;
  }

  return (
    <div className="space-y-6">
      <header className="agency-admin-page-head">
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-300">
          {navCtx ? (
            <>
              {navCtx.pillarLabel} · {navCtx.sectionLabel} · {navCtx.itemLabel}
            </>
          ) : (
            "Branding"
          )}
        </p>
        <h1>{navItem.label}</h1>
        <p>{navItem.description}</p>
      </header>
      <AdminPillarStatsHubPage pillar="branding" />
    </div>
  );
}
