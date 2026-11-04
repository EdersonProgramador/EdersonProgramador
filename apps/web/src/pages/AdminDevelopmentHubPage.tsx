import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import {
  DEVELOPMENT_OPERATION_NAV,
  findDevelopmentOperationNavContext
} from "@ederson-agencia/shared";
import { ADMIN_BASE } from "../components/admin/AdminOperationsLayout";
import { AdminPillarStatsHubPage } from "./AdminPillarStatsHubPage";

function hubViewFromPath(pathname: string): string | null {
  const marker = "/admin/operacao/desenvolvimento/";
  const idx = pathname.indexOf(marker);
  if (idx === -1) return null;
  return pathname.slice(idx + marker.length).split("/")[0] ?? null;
}

export function AdminDevelopmentHubPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const view = hubViewFromPath(location.pathname);
  const projectId = searchParams.get("project") ?? "";
  const q = projectId ? `?project=${encodeURIComponent(projectId)}` : "";

  if (view === "infra") {
    return <Navigate to={`${ADMIN_BASE}/operacao/fase-3${q}`} replace />;
  }

  const adminPath = view ? `operacao/desenvolvimento/${view}` : "";
  const navCtx = adminPath ? findDevelopmentOperationNavContext(adminPath) : null;
  const navItem = DEVELOPMENT_OPERATION_NAV.flatMap((s) => s.items).find((i) => i.id === view);

  if (view !== "estatistica" || !navItem) {
    const fallback = `${ADMIN_BASE}/operacao/desenvolvimento/estatistica${q}`;
    return <Navigate to={fallback} replace />;
  }

  return (
    <div className="space-y-6">
      <header className="agency-admin-page-head">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-300">
          {navCtx ? (
            <>
              {navCtx.pillarLabel} · {navCtx.sectionLabel} · {navCtx.itemLabel}
            </>
          ) : (
            "Desenvolvimento"
          )}
        </p>
        <h1>{navItem.label}</h1>
        <p>{navItem.description}</p>
      </header>
      <AdminPillarStatsHubPage pillar="development" />
    </div>
  );
}
