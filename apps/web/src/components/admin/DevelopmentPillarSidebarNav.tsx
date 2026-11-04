import { useCallback, useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import {
  DEVELOPMENT_LEGACY_PATH_ALIASES,
  DEVELOPMENT_OPERATION_NAV,
  devTechStackCategoryByNavItemId,
  findDevTechOptionByStoredValue,
  type BrandingWorkspaceData,
  type OperationSectionNavItem
} from "@ederson-agencia/shared";
import { Monitor } from "lucide-react";
import { getProjectWorkspace } from "../../api/project-workspace-api";
import { DevTechBrandIcon } from "./DevTechBrandIcon";
import { DEVELOPMENT_SIDEBAR_ICONS } from "./pillar-sidebar-icons";
import { PillarSidebarNav } from "./PillarSidebarNav";

export function DevelopmentPillarSidebarNav() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const projectId = searchParams.get("project")?.trim() ?? "";
  const [fields, setFields] = useState<BrandingWorkspaceData | null>(null);

  useEffect(() => {
    if (!projectId) {
      setFields(null);
      return;
    }
    let cancelled = false;
    void getProjectWorkspace(projectId)
      .then((res) => {
        if (!cancelled) setFields(res.workspace.fields);
      })
      .catch(() => {
        if (!cancelled) setFields(null);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId, location.pathname, location.search]);

  const renderItemLeading = useCallback(
    (item: OperationSectionNavItem) => {
      const cat = devTechStackCategoryByNavItemId(item.id);
      if (!cat || !fields) return undefined;
      const stored = fields[cat.fieldId];
      if (typeof stored !== "string" || !stored.trim()) return undefined;
      const opt = findDevTechOptionByStoredValue(stored);
      if (!opt) return undefined;
      return <DevTechBrandIcon optionId={opt.id} label={opt.label} size={16} className="h-4 w-4" />;
    },
    [fields]
  );

  return (
    <PillarSidebarNav
      pillarId="desenvolvimento"
      pillarLabel="Desenvolvimento"
      tone="tech"
      sections={DEVELOPMENT_OPERATION_NAV}
      legacyAliases={DEVELOPMENT_LEGACY_PATH_ALIASES}
      iconById={DEVELOPMENT_SIDEBAR_ICONS}
      defaultIcon={Monitor}
      renderItemLeading={projectId ? renderItemLeading : undefined}
    />
  );
}
