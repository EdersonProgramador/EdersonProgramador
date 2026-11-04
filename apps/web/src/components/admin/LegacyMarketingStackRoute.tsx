import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { AGENCY_APP_BASE, DEVELOPMENT_LEGACY_PATH_ALIASES } from "@ederson-agencia/shared";
import { AdminMarketingDevPage } from "../../pages/AdminMarketingDevPage";

/** Mantém checklists em `operacao/marketing/*` e redireciona stacks técnicas para Desenvolvimento. */
export function LegacyMarketingStackRoute() {
  const { stackId } = useParams<{ stackId: string }>();
  const [searchParams] = useSearchParams();
  const q = searchParams.toString() ? `?${searchParams.toString()}` : "";

  if (stackId) {
    const canonical = DEVELOPMENT_LEGACY_PATH_ALIASES[`operacao/marketing/${stackId}`];
    if (canonical) {
      return <Navigate to={`${AGENCY_APP_BASE}/admin/${canonical}${q}`} replace />;
    }
  }

  return <AdminMarketingDevPage />;
}
