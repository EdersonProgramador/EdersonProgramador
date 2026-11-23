import { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ACADEMY_APP_BASE,
  ACADEMY_PROFILE_PATH,
  BRAND_IDENTITY,
  loginPathForContext,
  logoutHomePathForContext
} from "@ederson-agencia/shared";
import { GraduationCap, LogOut } from "lucide-react";
import { ProfileAvatarNavLink } from "./profile/ProfileAvatarCircle";
import { AcademyNav } from "./portal/AcademyNav";
import { prefetchMyCourses } from "../courses/catalog-cache";
import { useAcademySession, useAuthStore } from "../stores/authStore";
import { applySiteTheme, useThemeStore } from "../stores/themeStore";
import "../styles/academy-portal.css";

export function AcademyShellLayout({ title }: { title: string }) {
  const session = useAcademySession();
  const clearSession = useAuthStore((s) => s.clearSession);
  const navigate = useNavigate();
  const location = useLocation();
  const user = session?.user;
  const academyLogin = loginPathForContext("academy");
  const siteTheme = useThemeStore((s) => s.theme);

  useEffect(() => {
    if (session?.token) prefetchMyCourses();
  }, [session?.token]);

  useEffect(() => {
    document.body.classList.add("academy-portal-active");
    applySiteTheme("day");
    return () => {
      document.body.classList.remove("academy-portal-active");
      applySiteTheme(siteTheme);
    };
  }, [siteTheme]);

  function logoutAcademy() {
    clearSession("academy");
    try {
      sessionStorage.setItem("academy_logged_out", "1");
    } catch {
      /* ignore */
    }
    navigate(logoutHomePathForContext("academy"), { replace: true });
  }

  return (
    <div className="academy-portal">
      <header className="app-shell-header academy-portal__header sticky top-0 z-50">
        <div className="academy-portal__inner">
          <Link to={ACADEMY_APP_BASE} className="academy-portal__brand">
            <span className="academy-portal__mark" aria-hidden>
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="academy-portal__brand-copy">
              <span className="academy-portal__brand-name">{BRAND_IDENTITY.name}</span>
              <span className="academy-portal__brand-eyebrow">
                Academia interna · {title}
              </span>
            </span>
          </Link>

          <div className="academy-portal__actions">
            {user ? (
              <>
                <AcademyNav user={user} />
                <ProfileAvatarNavLink user={user} to={ACADEMY_PROFILE_PATH} />
                <button
                  type="button"
                  className="btn-secondary inline-flex min-h-11 min-w-11 items-center justify-center p-2"
                  aria-label="Encerrar sessão"
                  title="Encerrar sessão"
                  onClick={logoutAcademy}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <Link
                to={academyLogin}
                state={{ from: `${location.pathname}${location.search}` }}
                className="btn-primary inline-flex min-h-11 items-center px-5 text-sm font-bold"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="academy-portal__main">
        <Outlet />
      </main>
    </div>
  );
}
