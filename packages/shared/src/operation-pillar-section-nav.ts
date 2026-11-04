/** Sidebar em seções (padrão Leadlovers) — tipos e helpers compartilhados. */

export type OperationSectionNavItem = {
  id: string;
  label: string;
  adminPath: string;
  description?: string;
};

export type OperationSectionNav = {
  id: string;
  sectionLabel: string;
  items: readonly OperationSectionNavItem[];
};

export function operationSectionNavFlatItems(sections: readonly OperationSectionNav[]): OperationSectionNavItem[] {
  return sections.flatMap((s) => [...s.items]);
}

export function findOperationSectionNavByAdminPath(
  sections: readonly OperationSectionNav[],
  adminPath: string
): { section: OperationSectionNav; item: OperationSectionNavItem } | null {
  const normalized = adminPath.replace(/^\/+/, "");
  for (const section of sections) {
    const item = section.items.find((i) => i.adminPath === normalized);
    if (item) return { section, item };
  }
  return null;
}

export function operationSectionNavItemActive(
  currentAdminPath: string,
  itemAdminPath: string,
  legacyAliases: Record<string, string>
): boolean {
  if (currentAdminPath === itemAdminPath) return true;
  for (const [legacy, canonical] of Object.entries(legacyAliases)) {
    if (canonical === itemAdminPath && currentAdminPath === legacy) return true;
  }
  return false;
}

export function findOperationSectionNavContext(
  pillarLabel: string,
  sections: readonly OperationSectionNav[],
  adminPath: string,
  legacyAliases: Record<string, string>
): { pillarLabel: string; sectionLabel: string; itemLabel: string } | null {
  const normalized = adminPath.replace(/^\/+/, "");
  const direct = findOperationSectionNavByAdminPath(sections, normalized);
  if (direct) {
    return {
      pillarLabel,
      sectionLabel: direct.section.sectionLabel,
      itemLabel: direct.item.label
    };
  }
  const canonical = legacyAliases[normalized];
  if (canonical) {
    const hit = findOperationSectionNavByAdminPath(sections, canonical);
    if (hit) {
      return {
        pillarLabel,
        sectionLabel: hit.section.sectionLabel,
        itemLabel: hit.item.label
      };
    }
  }
  return null;
}
