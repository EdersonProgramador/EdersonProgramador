import { NavLink, Outlet } from "react-router-dom";
import { AGENCY_APP_BASE } from "@ederson-agencia/shared";
import { FolderKanban, Megaphone, UserRound, Users } from "lucide-react";
import "../../styles/agency-admin.css";

const ADMIN_BASE = `${AGENCY_APP_BASE}/admin`;

const NAV_GROUPS = [
  {
    label: "Operação",
    items: [{ to: `${ADMIN_BASE}/projetos`, end: true, label: "Projetos", icon: FolderKanban }]
  },
  {
    label: "Comercial & configuração",
    items: [
      { to: `${ADMIN_BASE}/funil`, end: false, label: "Funil comercial", icon: Megaphone },
      { to: `${ADMIN_BASE}/leads`, end: false, label: "Leads", icon: Users },
      { to: `${ADMIN_BASE}/clientes`, end: false, label: "Clientes", icon: UserRound }
    ]
  }
] as const;

function AdminNavLink({
  to,
  end,
  label,
  icon: Icon
}: {
  to: string;
  end: boolean;
  label: string;
  icon: typeof FolderKanban;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `agency-admin-nav-link${isActive ? " is-active" : ""}`}
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      {label}
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
