import { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  ACADEMY_ADMIN_COURSES_BASE,
  ACADEMY_STORE_BASE,
  AGENCY_APP_BASE,
  AGENCY_CRM_BASE,
  AGENCY_OS_STUDIO_ADMIN_PATH,
  BRAND_IDENTITY,
  logoutHomePathForContext
} from "@ederson-agencia/shared";
import { Code2, GraduationCap, LogOut } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { applySiteTheme, useThemeStore } from "../../stores/themeStore";
import "../../styles/agency-admin.css";
import "../../styles/agency-os-opus-home.css";

const ADMIN_BASE = `${AGENCY_APP_BASE}/admin`;
const CRM_HOME = `${ADMIN_BASE}/?view=dashboard`;
const AGENCY_BRAND = BRAND_IDENTITY.primarySystem.name;

export function AdminOperationsLayout() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("project")?.trim();
  const q = projectId ? `?project=${encodeURIComponent(projectId)}` : "";
  const location = useLocation();
  const navigate = useNavigate();
  const clearSession = useAuthStore((s) => s.clearSession);
  const siteTheme = useThemeStore((s) => s.theme);

  const path = location.pathname.replace(/\/$/, "");
  const isCrm = path === ADMIN_BASE || path.includes("/admin/crm");
  const isStudio = path.includes("/admin/studio");

  useEffect(() => {
    document.body.classList.add("agency-os-opus-active");
    document.body.classList.remove("agency-funnel-active");
    applySiteTheme("day");
    return () => {
      document.body.classList.remove("agency-os-opus-active");
      applySiteTheme(siteTheme);
    };
  }, [siteTheme]);

  return (
    <div
      className={`opus-workspace${isCrm ? " opus-workspace--crm" : ""}${isStudio ? " opus-workspace--studio" : ""}`}
    >
      <div
        className={`opus-workspace__frame${isCrm ? " opus-workspace__frame--crm" : ""}${
          isStudio ? " opus-workspace__frame--studio" : ""
        }`}
      >
        {!isStudio ? (
          <header className={`opus-workspace-top${isCrm ? " opus-workspace-top--overlay" : ""}`}>
            <a href={CRM_HOME} className="opus-workspace-top__brand">
              <span className="opus-workspace-top__name">{AGENCY_BRAND}</span>
            </a>
            <nav className="opus-workspace-top__nav" aria-label="Workspace">
              <a
                href={`${AGENCY_CRM_BASE}/?view=dashboard`}
                className={`opus-workspace-top__link${isCrm ? " is-active" : ""}`}
              >
                CRM
              </a>
              <a href={ACADEMY_ADMIN_COURSES_BASE} className="opus-workspace-top__link">
                <GraduationCap className="h-3.5 w-3.5" aria-hidden />
                Academia
              </a>
              <a href={ACADEMY_STORE_BASE} className="opus-workspace-top__link">
                Loja
              </a>
              <NavLink
                to={`${ADMIN_BASE}/${AGENCY_OS_STUDIO_ADMIN_PATH}${q}`}
                className={({ isActive }) => `opus-workspace-top__link${isActive ? " is-active" : ""}`}
              >
                <Code2 className="h-3.5 w-3.5" aria-hidden />
                Code Studio
              </NavLink>
              <button
                type="button"
                className="opus-workspace-top__link opus-workspace-top__link--ghost"
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
                <LogOut className="h-3.5 w-3.5" aria-hidden />
                Sair
              </button>
            </nav>
          </header>
        ) : null}

        <main
          className={`opus-workspace__main${isCrm ? " opus-workspace__main--crm" : ""}${
            isStudio ? " opus-workspace__main--studio" : ""
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export { ADMIN_BASE };
