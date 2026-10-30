import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import {
  ACADEMY_APP_BASE,
  ACADEMY_SALES,
  ACADEMY_STORE_BASE,
  ACADEMY_STORE_PATHS,
  loginPathForContext
} from "@ederson-agencia/shared";
import { useAcademySession } from "../../stores/authStore";
import { BrandLogo } from "../brand/BrandLogo";
import { ThemeToggle } from "../theme/ThemeToggle";
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
  const academyUser = useAcademySession()?.user;
  const academyLogin = loginPathForContext("academy");

  return (
    <div className="academy-sales surface-light min-h-screen">
      <header className="academy-sales__nav sticky top-0 z-50 border-b backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to={ACADEMY_STORE_BASE} className="shrink-0">
            <BrandLogo size="sm" />
          </Link>
          {nav ? <div className="hidden flex-1 justify-center md:flex">{nav}</div> : null}
          <div className="flex items-center gap-2">
            <ThemeToggle compact variant="chrome" className="academy-sales__theme-toggle shrink-0" />
            <Link
              to={academyUser ? ACADEMY_APP_BASE : academyLogin}
              state={academyUser ? undefined : { from: ACADEMY_APP_BASE }}
              className="btn-secondary inline-flex min-h-10 items-center text-sm"
            >
              {academyUser ? "Meus cursos" : copy.courses.loginCta}
            </Link>
            <Link
              to={ACADEMY_STORE_PATHS.cart}
              className="academy-sales__cart-btn inline-flex h-10 w-10 items-center justify-center rounded-lg border"
              aria-label={count > 0 ? `Carrinho, ${count} ${count === 1 ? "item" : "itens"}` : "Carrinho"}
            >
              <ShoppingCart className="h-5 w-5" aria-hidden />
            </Link>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
