import { useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  AGENCY_CLIENT_PORTAL_BASE,
  AGENCY_PROFILE_PATH,
  BRAND_IDENTITY,
  loginPathForContext,
  logoutHomePathForContext
} from "@ederson-agencia/shared";
import { Briefcase, LogOut } from "lucide-react";
import { AgencyClientNav } from "./portal/AgencyClientNav";
import { ProfileAvatarNavLink } from "./profile/ProfileAvatarCircle";
import { useAgencySession, useAuthStore } from "../stores/authStore";
import { applySiteTheme, useThemeStore } from "../stores/themeStore";
import "../styles/agency-client-portal.css";

/** Portal do cliente — Agência Ederson Programador (layout comercial Amplifica). */
export function AgencyClientPortalLayout() {
  const session = useAgencySession();
  const clearSession = useAuthStore((s) => s.clearSession);
  const navigate = useNavigate();
  const siteTheme = useThemeStore((s) => s.theme);
  const user = session?.user;
  const agencyLogin = loginPathForContext("agency");

  useEffect(() => {
    applySiteTheme("day");
    return () => applySiteTheme(siteTheme);
  }, [siteTheme]);

  return (
    <div className="agency-client-portal surface-light">
      <header className="agency-client-portal__header">
        <div className="agency-client-portal__header-inner">
          <Link to={AGENCY_CLIENT_PORTAL_BASE} className="agency-client-portal__brand">
            <span className="agency-client-portal__mark" aria-hidden>
              <Briefcase className="h-5 w-5" />
            </span>
            <span>
              <span className="agency-client-portal__eyebrow">Portal do cliente</span>
              <span className="agency-client-portal__name">{BRAND_IDENTITY.primarySystem.name}</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <AgencyClientNav />
            {user ? (
              <>
                <ProfileAvatarNavLink user={user} to={AGENCY_PROFILE_PATH} />
                <button
                  type="button"
                  className="btn-secondary inline-flex min-h-10 min-w-10 items-center justify-center p-2"
                  aria-label="Sair"
                  onClick={() => {
                    clearSession("agency");
                    try {
                      sessionStorage.setItem("agency_logged_out", "1");
                      sessionStorage.removeItem("crm_login_fallback");
                      localStorage.removeItem("agency_token");
                      localStorage.removeItem("agency_user");
                    } catch {
                      /* ignore */
                    }
                    navigate(logoutHomePathForContext("agency"), { replace: true });
                  }}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <Link to={agencyLogin} className="btn-ghost text-sm font-semibold">
                Entrar
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="agency-client-portal__main">
        <Outlet />
      </main>
    </div>
  );
}