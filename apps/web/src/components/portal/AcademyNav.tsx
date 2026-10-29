import { Link, useLocation } from "react-router-dom";
import { ACADEMY_APP_BASE } from "@ederson-agencia/shared";

export function AcademyNav() {
  const { pathname } = useLocation();
  const active = pathname === ACADEMY_APP_BASE || pathname.startsWith(`${ACADEMY_APP_BASE}/`);

  return (
    <nav className="portal-nav-bar flex items-center gap-1" aria-label="Academia">
      <Link
        to={ACADEMY_APP_BASE}
        className={`portal-nav-link inline-flex min-h-11 items-center rounded-lg px-3 py-2 text-sm font-medium ${active ? "is-active" : ""}`}
      >
        Meus cursos
      </Link>
    </nav>
  );
}
