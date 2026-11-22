import { Navigate, useParams, useSearchParams } from "react-router-dom";
import {
  AGENCY_APP_BASE,
  DEVELOPMENT_LEGACY_PATH_ALIASES,
  MARKETING_LEGACY_PATH_ALIASES,
  agencyOpsDefaultAdminPath,
  isAgencyOpsLaneId
} from "@ederson-agencia/shared";
import { AdminAgencyOpsLanePage } from "../../pages/AdminAgencyOpsLanePage";
import { AdminMarketingDevPage } from "../../pages/AdminMarketingDevPage";

/** Lanes Agency Ops, aliases legados e checklists em operacao/marketing/*. */
export function LegacyMarketingStackRoute() {
  const { stackId } = useParams<{ stackId: string }>();
  const [searchParams] = useSearchParams();
  const q = searchParams.toString() ? `?${searchParams.toString()}` : "";

  if (stackId && isAgencyOpsLaneId(stackId)) {
    return <AdminAgencyOpsLanePage vertical="marketing" lane={stackId} />;
  }

  if (stackId) {
    const legacyKey = `operacao/marketing/${stackId}`;
    const canonical =
      DEVELOPMENT_LEGACY_PATH_ALIASES[legacyKey] ?? MARKETING_LEGACY_PATH_ALIASES[legacyKey];
    if (canonical) {
      return <Navigate to={`${AGENCY_APP_BASE}/admin/${canonical}${q}`} replace />;
    }
  }

  if (!stackId) {
    return (
      <Navigate to={`${AGENCY_APP_BASE}/admin/${agencyOpsDefaultAdminPath("marketing")}${q}`} replace />
    );
  }

  return <AdminMarketingDevPage />;
}
