import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import {
  FORMULA_OPERATION_NAV,
  findFormulaOperationNavContext,
  formulaLaunchPhaseIdFromHubView
} from "@ederson-agencia/shared";
import { ADMIN_BASE } from "../components/admin/AdminOperationsLayout";
import { AdminPillarStatsHubPage } from "./AdminPillarStatsHubPage";

function hubViewFromPath(pathname: string): string | null {
  const marker = "/admin/operacao/formula-lancamento/";
  const idx = pathname.indexOf(marker);
  if (idx === -1) return null;
  return pathname.slice(idx + marker.length).split("/")[0] ?? null;
}

export function AdminFormulaHubPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const view = hubViewFromPath(location.pathname);
  const projectId = searchParams.get("project") ?? "";
  const q = projectId ? `?project=${encodeURIComponent(projectId)}` : "";

  if (view && view !== "estatistica") {
    const phaseId = formulaLaunchPhaseIdFromHubView(view);
    if (phaseId) {
      return <Navigate to={`${ADMIN_BASE}/operacao/${phaseId}${q}`} replace />;
    }
  }

  const adminPath = view ? `operacao/formula-lancamento/${view}` : "";
  const navCtx = adminPath ? findFormulaOperationNavContext(adminPath) : null;
  const navItem = FORMULA_OPERATION_NAV.flatMap((s) => s.items).find((i) => i.id === view);

  if (view !== "estatistica" || !navItem) {
    return <Navigate to={`${ADMIN_BASE}/operacao/formula-lancamento/estatistica${q}`} replace />;
  }

  return (
    <div className="space-y-6">
      <header className="agency-admin-page-head">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-200">
          {navCtx ? (
            <>
              {navCtx.pillarLabel} · {navCtx.sectionLabel} · {navCtx.itemLabel}
            </>
          ) : (
            "Fórmula de Lançamento"
          )}
        </p>
        <h1>{navItem.label}</h1>
        <p>{navItem.description}</p>
      </header>
      <AdminPillarStatsHubPage pillar="formula" />
    </div>
  );
}
