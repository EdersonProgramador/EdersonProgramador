import { useEffect } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, ShoppingCart } from "lucide-react";
import {
  ACCOUNT_HUB_PATH,
  ACADEMY_APP_BASE,
  ACADEMY_SALES,
  ACADEMY_STORE_BASE,
  ACADEMY_STORE_PATHS,
  BRAND_IDENTITY,
  loginPathForContext
} from "@ederson-agencia/shared";
import { getStoredToken } from "../../api";
import { useAcademySession, useAgencySession, useAuthStore } from "../../stores/authStore";
import { applySiteTheme, useThemeStore } from "../../stores/themeStore";
import { useAcademyCartStore } from "../../stores/academyCartStore";

const copy = ACADEMY_SALES;

export function AcademyStoreShell({
  children,
  nav
}: {
  children: React.ReactNode;
  nav?: React.ReactNode;
}) {
  const count = useAcademyCartStore((s) => s.items.length);
  const booting = useAuthStore((s) => s.booting);
  const clearSession = useAuthStore((s) => s.clearSession);
  const agencyUser = useAgencySession()?.user;
  const academyUser = useAcademySession()?.user;
  const academyLogin = loginPathForContext("academy");
  const siteTheme = useThemeStore((s) => s.theme);
  const academyLoggedOut =
    typeof sessionStorage !== "undefined" && sessionStorage.getItem("academy_logged_out") === "1";
  const agencyGuest =
    typeof sessionStorage !== "undefined" && sessionStorage.getItem("agency_logged_out") === "1";
  const hasAcademyToken = Boolean(getStoredToken("academy"));

  useEffect(() => {
    if (booting) return;
    if (!hasAcademyToken && academyUser) {
      clearSession("academy");
    }
  }, [booting, hasAcademyToken, academyUser, clearSession]);

  // Vitrine pública: "Meus cursos" só com token academia válido e sem logout voluntário (academia ou agência/CRM).
  const loggedIn =
    !booting &&
    hasAcademyToken &&
    Boolean(academyUser) &&
    (academyUser.authContext ?? "academy") === "academy" &&
    !academyLoggedOut &&
    !agencyGuest;

  const hasAgencyToken = Boolean(getStoredToken("agency"));
  const agencyActive =
    !booting &&
    hasAgencyToken &&
    Boolean(agencyUser) &&
    !agencyGuest &&
    (agencyUser?.authContext ?? "agency") === "agency";
  const showAccountHub = agencyActive || loggedIn;

  useEffect(() => {
    document.body.classList.add("academy-sales-active");
    applySiteTheme("day");
    return () => {
      document.body.classList.remove("academy-sales-active");
      applySiteTheme(siteTheme);
    };
  }, [siteTheme]);

  return (
    <div className="academy-sales academy-sales--crm surface-light min-h-screen">
      <header className="academy-sales__nav sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <Link to={ACADEMY_STORE_BASE} className="academy-sales__brand shrink-0">
            <span className="academy-sales__brand-mark" aria-hidden>
              <GraduationCap className="h-5 w-5 text-white" />
            </span>
            <span className="academy-sales__brand-copy">
              <span className="academy-sales__brand-name">{BRAND_IDENTITY.name}</span>
              <span className="academy-sales__brand-eyebrow">{copy.brand}</span>
            </span>
          </Link>

          {nav ? <div className="hidden flex-1 justify-center lg:flex">{nav}</div> : null}

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to={ACADEMY_STORE_PATHS.cart}
              className="academy-sales__cart-btn"
              aria-label={count > 0 ? `Carrinho, ${count} ${count === 1 ? "item" : "itens"}` : "Carrinho"}
            >
              <ShoppingCart className="h-4 w-4" aria-hidden />
              {count > 0 ? <span className="academy-sales__cart-count">{count}</span> : null}
            </Link>
            {showAccountHub ? (
              <Link to={ACCOUNT_HUB_PATH} className="academy-sales__nav-link hidden sm:inline-flex">
                Minha conta
              </Link>
            ) : null}
            <Link
              to={loggedIn ? ACADEMY_APP_BASE : academyLogin}
              state={loggedIn ? undefined : { from: ACADEMY_APP_BASE }}
              className="academy-sales__nav-cta"
            >
              {loggedIn ? "Meus cursos" : "Entrar"}
            </Link>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
