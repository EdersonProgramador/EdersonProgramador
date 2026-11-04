import { NavLink, Outlet } from "react-router-dom";
import {
  AGENCY_APP_BASE,
  BRANDING_LEGACY_PATH_ALIASES,
  BRANDING_OPERATION_NAV,
  brandingNavFlatItems,
  DEVELOPMENT_LEGACY_PATH_ALIASES,
  DEVELOPMENT_OPERATION_NAV,
  developmentNavFlatItems,
  FORMULA_LEGACY_PATH_ALIASES,
  FORMULA_OPERATION_NAV,
  formulaNavFlatItems,
  MARKETING_LEGACY_PATH_ALIASES,
  MARKETING_OPERATION_NAV,
  marketingNavFlatItems,
  OPERATION_PILLAR_NAV,
  type OperationPillarNav
} from "@ederson-agencia/shared";
import { FolderKanban, Megaphone, Monitor, UserRound, Users, type LucideIcon } from "lucide-react";
import { PillarSidebarNav } from "./PillarSidebarNav";
import {
  BRANDING_SIDEBAR_ICONS,
  DEVELOPMENT_SIDEBAR_ICONS,
  FORMULA_SIDEBAR_ICONS,
  MARKETING_SIDEBAR_ICONS
} from "./pillar-sidebar-icons";
import "../../styles/agency-admin.css";

const ADMIN_BASE = `${AGENCY_APP_BASE}/admin`;

type NavItem = {
  to: string;
  end: boolean;
  label: string;
  icon: LucideIcon;
};

const PROJECTS_ITEM: NavItem = {
  to: `${ADMIN_BASE}/projetos`,
  end: true,
  label: "Projetos",
  icon: FolderKanban
};

const COMMERCIAL_ITEMS: NavItem[] = [
  { to: `${ADMIN_BASE}/funil`, end: false, label: "Funil comercial", icon: Megaphone },
  { to: `${ADMIN_BASE}/leads`, end: false, label: "Leads", icon: Users },
  { to: `${ADMIN_BASE}/clientes`, end: false, label: "Clientes", icon: UserRound }
];

function pillarFlatMobileItems(pillarLabel: string, items: ReturnType<typeof marketingNavFlatItems>, icon: LucideIcon): NavItem[] {
  return items.map((item) => ({
    to: `${ADMIN_BASE}/${item.adminPath}`,
    end: false,
    label: `${pillarLabel} · ${item.label}`,
    icon: icon
  }));
}

function flatMobileItems(): NavItem[] {
  return [
    PROJECTS_ITEM,
    ...pillarFlatMobileItems("Branding", brandingNavFlatItems(), Monitor),
    ...pillarFlatMobileItems("Marketing", marketingNavFlatItems(), Megaphone),
    ...pillarFlatMobileItems("Desenvolvimento", developmentNavFlatItems(), Monitor),
    ...pillarFlatMobileItems("Fórmula L.", formulaNavFlatItems(), Monitor),
    ...COMMERCIAL_ITEMS
  ];
}

function PillarSidebarFor({ pillar }: { pillar: OperationPillarNav }) {
  switch (pillar.id) {
    case "branding":
      return (
        <PillarSidebarNav
          pillarId={pillar.id}
          pillarLabel={pillar.pillarLabel}
          tone="branding"
          sections={BRANDING_OPERATION_NAV}
          legacyAliases={BRANDING_LEGACY_PATH_ALIASES}
          iconById={BRANDING_SIDEBAR_ICONS}
          defaultIcon={Monitor}
        />
      );
    case "marketing":
      return (
        <PillarSidebarNav
          pillarId={pillar.id}
          pillarLabel={pillar.pillarLabel}
          tone="marketing"
          sections={MARKETING_OPERATION_NAV}
          legacyAliases={MARKETING_LEGACY_PATH_ALIASES}
          iconById={MARKETING_SIDEBAR_ICONS}
          defaultIcon={Megaphone}
        />
      );
    case "desenvolvimento":
      return (
        <PillarSidebarNav
          pillarId={pillar.id}
          pillarLabel={pillar.pillarLabel}
          tone="tech"
          sections={DEVELOPMENT_OPERATION_NAV}
          legacyAliases={DEVELOPMENT_LEGACY_PATH_ALIASES}
          iconById={DEVELOPMENT_SIDEBAR_ICONS}
          defaultIcon={Monitor}
        />
      );
    case "formula-lancamento":
      return (
        <PillarSidebarNav
          pillarId={pillar.id}
          pillarLabel={pillar.pillarLabel}
          tone="formula"
          sections={FORMULA_OPERATION_NAV}
          legacyAliases={FORMULA_LEGACY_PATH_ALIASES}
          iconById={FORMULA_SIDEBAR_ICONS}
          defaultIcon={Monitor}
        />
      );
    default:
      return null;
  }
}

function AdminNavLink({ to, end, label, icon: Icon }: NavItem) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `agency-admin-nav-link${isActive ? " is-active" : ""}`}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
      <span className="agency-admin-nav-link__text">{label}</span>
    </NavLink>
  );
}

export function AdminOperationsLayout() {
  const flatItems = flatMobileItems();

  return (
    <div className="agency-admin-layout">
      <aside className="agency-admin-sidebar" aria-label="Menu da administração">
        <div className="agency-admin-mobile-nav lg:hidden">
          {flatItems.map((item) => (
            <AdminNavLink key={item.to} {...item} />
          ))}
        </div>
        <div className="agency-admin-sidebar__panel agency-admin-sidebar__desktop-nav">
          <div className="mb-2">
            <p className="agency-admin-sidebar__label">Operação</p>
            <nav className="flex flex-col gap-0.5">
              <AdminNavLink {...PROJECTS_ITEM} />
            </nav>
            {OPERATION_PILLAR_NAV.map((pillar) => (
              <PillarSidebarFor key={pillar.id} pillar={pillar} />
            ))}
          </div>
          <div className="mb-2 last:mb-0">
            <p className="agency-admin-sidebar__label">Comercial & configuração</p>
            <nav className="flex flex-col gap-0.5">
              {COMMERCIAL_ITEMS.map((item) => (
                <AdminNavLink key={item.to} {...item} />
              ))}
            </nav>
          </div>
        </div>
      </aside>
      <div className="agency-admin-main">
        <Outlet />
      </div>
    </div>
  );
}

export { ADMIN_BASE };
