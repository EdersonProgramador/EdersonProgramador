import { Link, useLocation } from "react-router-dom";
import { agencyHomePathForRole, portalHomePath } from "@ederson-agencia/shared";
import type { AuthUser } from "@ederson-agencia/shared";

export function PortalNav({ user }: { user: AuthUser }) {
  const { pathname } = useLocation();
  const agencyPath = agencyHomePathForRole(user.role);

  const linkClass = (path: string) =>
    `rounded-lg px-3 py-1.5 text-sm transition ${
      pathname === path || pathname.startsWith(`${path}/`)
        ? "bg-white/10 text-white"
        : "text-white/70 hover:text-white"
    }`;

  return (
    <nav className="flex flex-wrap items-center gap-1" aria-label="Áreas do portal">
      <Link to={portalHomePath()} className={linkClass(portalHomePath())}>
        Início
      </Link>
      <Link to="/app/cursos" className={linkClass("/app/cursos")}>
        Academia
      </Link>
      <Link to={agencyPath} className={linkClass(agencyPath)}>
        Agência
      </Link>
      {user.role === "ADMIN" ? (
        <Link to="/app/admin/cursos" className={linkClass("/app/admin/cursos")}>
          Cursos (admin)
        </Link>
      ) : null}
    </nav>
  );
}
