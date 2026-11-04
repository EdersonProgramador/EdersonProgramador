import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AGENCY_APP_BASE, type OperationPillarTone, type OperationSectionNav } from "@ederson-agencia/shared";
import { ChevronDown, type LucideIcon } from "lucide-react";

const ADMIN_BASE = `${AGENCY_APP_BASE}/admin`;
const COLLAPSE_STORAGE_KEY = "ederson-agencia.admin-pillar-collapsed.v1";

export type PillarSidebarNavProps = {
  pillarId: string;
  pillarLabel: string;
  tone: OperationPillarTone;
  sections: readonly OperationSectionNav[];
  legacyAliases: Record<string, string>;
  iconById: Record<string, LucideIcon>;
  defaultIcon: LucideIcon;
};

function adminPathFromLocation(pathname: string): string {
  const marker = `${AGENCY_APP_BASE}/admin/`;
  const idx = pathname.indexOf(marker);
  if (idx === -1) return "";
  return pathname.slice(idx + marker.length).split("?")[0] ?? "";
}

function navItemActive(
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

function readCollapsedMap(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(COLLAPSE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, boolean>;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function writePillarCollapsed(pillarId: string, collapsed: boolean) {
  const map = readCollapsedMap();
  map[pillarId] = collapsed;
  localStorage.setItem(COLLAPSE_STORAGE_KEY, JSON.stringify(map));
}

function pillarHasActiveRoute(
  sections: readonly OperationSectionNav[],
  currentAdminPath: string,
  legacyAliases: Record<string, string>
): boolean {
  for (const section of sections) {
    for (const item of section.items) {
      if (navItemActive(currentAdminPath, item.adminPath, legacyAliases)) return true;
    }
  }
  for (const legacy of Object.keys(legacyAliases)) {
    if (currentAdminPath === legacy) return true;
  }
  return false;
}

export function PillarSidebarNav({
  pillarId,
  pillarLabel,
  tone,
  sections,
  legacyAliases,
  iconById,
  defaultIcon: DefaultIcon
}: PillarSidebarNavProps) {
  const location = useLocation();
  const bodyId = useId();
  const currentAdminPath = adminPathFromLocation(location.pathname);
  const toneClass =
    tone === "marketing"
      ? "marketing"
      : tone === "branding"
        ? "branding"
        : tone === "tech"
          ? "tech"
          : "formula";

  const isActivePillar = useMemo(
    () => pillarHasActiveRoute(sections, currentAdminPath, legacyAliases),
    [sections, currentAdminPath, legacyAliases]
  );

  const [collapsed, setCollapsed] = useState(() => {
    const stored = readCollapsedMap()[pillarId];
    if (typeof stored === "boolean") return stored;
    return !isActivePillar;
  });

  useEffect(() => {
    if (isActivePillar) setCollapsed(false);
  }, [isActivePillar]);

  const togglePillar = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      writePillarCollapsed(pillarId, next);
      return next;
    });
  }, [pillarId]);

  const toggleLabel = collapsed ? `Expandir ${pillarLabel}` : `Recolher ${pillarLabel}`;

  return (
    <div
      className={[
        "agency-admin-sidebar__pillar-section",
        `agency-admin-sidebar__pillar-section--${toneClass}`,
        collapsed ? "is-collapsed" : "is-expanded",
        isActivePillar ? "is-active-pillar" : ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        className={`agency-admin-sidebar__pillar-toggle agency-admin-sidebar__pillar agency-admin-sidebar__pillar--${toneClass}`}
        aria-expanded={!collapsed}
        aria-controls={bodyId}
        title={toggleLabel}
        onClick={togglePillar}
      >
        <span className="agency-admin-sidebar__pillar-toggle-label">{pillarLabel}</span>
        <ChevronDown
          className="agency-admin-sidebar__pillar-chevron h-4 w-4 shrink-0"
          strokeWidth={2}
          aria-hidden
        />
      </button>
      <div id={bodyId} className="agency-admin-sidebar__pillar-body" hidden={collapsed}>
        {sections.map((section) => (
          <div key={section.id} className="agency-admin-sidebar__pillar-section-group">
            <p className="agency-admin-sidebar__pillar-section-label">{section.sectionLabel}</p>
            <nav className="flex flex-col gap-0.5" aria-label={`${pillarLabel} — ${section.sectionLabel}`}>
              {section.items.map((item) => {
                const Icon = iconById[item.id] ?? DefaultIcon;
                return (
                  <NavLink
                    key={item.adminPath}
                    to={`${ADMIN_BASE}/${item.adminPath}`}
                    className={() => {
                      const active = navItemActive(currentAdminPath, item.adminPath, legacyAliases);
                      return `agency-admin-nav-link agency-admin-nav-link--${toneClass}${active ? " is-active" : ""}`;
                    }}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                    <span className="agency-admin-nav-link__text">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
    </div>
  );
}
