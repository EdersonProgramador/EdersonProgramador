import { Link, useLocation } from "react-router-dom";
import {
  AGENCY_APP_BASE,
  AGENCY_CLIENT_PORTAL_BASE,
  AGENCY_CLIENT_PORTAL_PROJECT_PATH,
  AGENCY_CLIENT_PORTAL_CONTRACT_PATH,
  AGENCY_CLIENT_PORTAL_SUPPORT_PATH,
  AGENCY_PROFILE_PATH
} from "@ederson-agencia/shared";

const LINKS = [
  { to: AGENCY_CLIENT_PORTAL_BASE, label: "Início", end: true },
  { to: AGENCY_CLIENT_PORTAL_PROJECT_PATH, label: "Meu projeto", end: false, projectArea: true },
  { to: AGENCY_CLIENT_PORTAL_CONTRACT_PATH, label: "Contratar", end: false },
  { to: AGENCY_CLIENT_PORTAL_SUPPORT_PATH, label: "Suporte", end: false },
  { to: AGENCY_PROFILE_PATH, label: "Perfil", end: false }
] as const;

function isActive(
  pathname: string,
  to: string,
  end: boolean,
  projectArea?: boolean
): boolean {
  if (projectArea && pathname.startsWith(`${AGENCY_APP_BASE}/projetos/`)) return true;
  if (end) return pathname === to || pathname === `${to}/`;
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function AgencyClientNav() {
  const { pathname } = useLocation();
  return (
    <nav className="agency-client-portal__nav hidden items-center gap-1 md:flex" aria-label="Portal do cliente">
      {LINKS.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={
            isActive(pathname, item.to, item.end, "projectArea" in item && item.projectArea)
              ? "is-active"
              : undefined
          }
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}