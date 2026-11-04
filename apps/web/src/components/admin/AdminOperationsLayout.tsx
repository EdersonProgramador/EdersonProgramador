import { NavLink, Outlet } from "react-router-dom";
import { AGENCY_APP_BASE, LAUNCH_OPERATION_PHASES } from "@ederson-agencia/shared";
import {
  BarChart3,
  Compass,
  FolderKanban,
  Megaphone,
  Palette,
  Radio,
  Rocket,
  Server,
  UserRound,
  Users,
  type LucideIcon
} from "lucide-react";
import "../../styles/agency-admin.css";

const ADMIN_BASE = `${AGENCY_APP_BASE}/admin`;

const PHASE_ICONS: Record<string, LucideIcon> = {
  "fase-1": Compass,
  "fase-2": Palette,
  "fase-3": Server,
  "fase-4": Radio,
  "fase-5": Rocket,
  "fase-6": BarChart3
};

type NavItem = {
  to: string;
  end: boolean;
  label: string;
  icon: LucideIcon;
};

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Operação",
    items: [
      { to: `${ADMIN_BASE}/projetos`, end: true, label: "Projetos", icon: FolderKanban },
      ...LAUNCH_OPERATION_PHASES.map((phase) => ({
        to: `${ADMIN_BASE}/operacao/${phase.id}`,
        end: false,
        label: phase.navLabel,
        icon: PHASE_ICONS[phase.id] ?? Compass
      }))
    ]
  },
  {
    label: "Comercial & configuração",
    items: [
      { to: `${ADMIN_BASE}/funil`, end: false, label: "Funil comercial", icon: Megaphone },
      { to: `${ADMIN_BASE}/leads`, end: false, label: "Leads", icon: Users },
      { to: `${ADMIN_BASE}/clientes`, end: false, label: "Clientes", icon: UserRound }
    ]
  }
];

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
  const flatItems = NAV_GROUPS.flatMap((g) => g.items);

  return (
    <div className="agency-admin-layout">
      <aside className="agency-admin-sidebar" aria-label="Menu da administração">
        <div className="agency-admin-mobile-nav lg:hidden">
          {flatItems.map((item) => (
            <AdminNavLink key={item.to} {...item} />
          ))}
        </div>
        <div className="agency-admin-sidebar__panel agency-admin-sidebar__desktop-nav">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-2 last:mb-0">
              <p className="agency-admin-sidebar__label">{group.label}</p>
              <nav className="flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <AdminNavLink key={item.to} {...item} />
                ))}
              </nav>
            </div>
          ))}
        </div>
      </aside>
      <div className="agency-admin-main">
        <Outlet />
      </div>
    </div>
  );
}

export { ADMIN_BASE };
