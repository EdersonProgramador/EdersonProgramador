import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  ACCOUNT_HUB_PATH,
  ACADEMY_STORE_BASE,
  AGENCY_OPERATION_LOGIN_PATH,
  BRAND_IDENTITY
} from "@ederson-agencia/shared";
import { Briefcase, GraduationCap } from "lucide-react";
import { applySiteTheme, useThemeStore } from "../stores/themeStore";
import "../styles/crm-auth-login.css";

function authEyebrow(pathname: string, title: string): string {
  if (pathname === ACCOUNT_HUB_PATH || pathname === `${ACCOUNT_HUB_PATH}/`) return "Minha conta";
  if (pathname.startsWith("/academia/entrar")) return "Academia";
  if (
    pathname === AGENCY_OPERATION_LOGIN_PATH ||
    pathname === `${AGENCY_OPERATION_LOGIN_PATH}/` ||
    pathname.startsWith("/cliente/entrar") ||
    pathname.startsWith("/freelancer/entrar")
  ) {
    return "Agência";
  }
  return title || "Acesso";
}

/** Layout mínimo para telas públicas de login (Agência + Academia). */
export function ShellLayout({ title }: { title: string }) {
  const { pathname } = useLocation();
  const isAcademyLogin = pathname.startsWith("/academia/entrar");
  const isAccountHub = pathname === ACCOUNT_HUB_PATH || pathname === `${ACCOUNT_HUB_PATH}/`;
  const isAgencyLogin =
    pathname === AGENCY_OPERATION_LOGIN_PATH ||
    pathname === `${AGENCY_OPERATION_LOGIN_PATH}/` ||
    pathname.startsWith("/cliente/entrar") ||
    pathname.startsWith("/freelancer/entrar");
  const isAuthShell = isAgencyLogin || isAcademyLogin || isAccountHub;
  const brandTo = isAcademyLogin || isAccountHub ? ACADEMY_STORE_BASE : "/";
  const siteTheme = useThemeStore((s) => s.theme);

  useEffect(() => {
    if (!isAuthShell) return;
    applySiteTheme("day");
    return () => applySiteTheme(siteTheme);
  }, [isAuthShell, siteTheme]);

  if (isAuthShell) {
    return (
      <div className="crm-auth-shell">
        <header className="app-shell-header crm-auth-top sticky top-0 z-50">
          <div className="crm-auth-top__inner">
            <Link to={brandTo} className="crm-auth-top__brand">
              <span
                className="crm-auth-top__mark"
                style={{ backgroundColor: "#4f46e5" }}
                aria-hidden
              >
                {isAcademyLogin ? (
                  <GraduationCap className="h-4 w-4 text-white" />
                ) : (
                  <Briefcase className="h-4 w-4 text-white" />
                )}
              </span>
              <span className="crm-auth-top__copy">
                <span className="crm-auth-top__name">{BRAND_IDENTITY.name}</span>
                <span className="crm-auth-top__eyebrow">{authEyebrow(pathname, title)}</span>
              </span>
            </Link>

            <div className="crm-auth-top__actions">
              {!isAgencyLogin && !isAcademyLogin ? (
                <Link to={AGENCY_OPERATION_LOGIN_PATH} className="crm-auth-top__link">
                  Agência
                </Link>
              ) : null}
              {!isAcademyLogin ? (
                <Link to="/academia/entrar" className="crm-auth-top__link">
                  Academia
                </Link>
              ) : null}
              <Link to={isAcademyLogin ? ACADEMY_STORE_BASE : "/"} className="crm-auth-top__back">
                Voltar ao site
              </Link>
            </div>
          </div>
        </header>
        <main className="crm-auth-main">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="surface-light min-h-screen bg-[var(--app-bg-solid)] text-[var(--app-text)]">
      <header className="app-shell-header sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:py-4">
          <Link to="/" className="crm-auth-top__brand">
            <span className="crm-auth-top__mark" style={{ backgroundColor: "#4f46e5" }} aria-hidden>
              <Briefcase className="h-4 w-4 text-white" />
            </span>
            <span className="crm-auth-top__copy">
              <span className="crm-auth-top__name">{BRAND_IDENTITY.name}</span>
              <span className="crm-auth-top__eyebrow">{title}</span>
            </span>
          </Link>
          <Link to="/" className="crm-auth-top__back">
            Voltar ao site
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}