import { Link, Outlet, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { portalHomePath } from "@ederson-agencia/shared";
import { PortalNav } from "./portal/PortalNav";
import { BrandLogo } from "./brand/BrandLogo";
import { ThemeToggle } from "./theme/ThemeToggle";
import { useAuthStore } from "../stores/authStore";

export function ShellLayout({ title }: { title: string }) {
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const navigate = useNavigate();

  return (
    <div className="surface-light min-h-screen bg-[var(--app-bg-solid)] text-[var(--app-text)]">
      <header className="app-shell-header sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-4">
          <div className="min-w-0">
            <Link to="/" className="group inline-block">
              <BrandLogo size="sm" />
            </Link>
            <p className="mt-1.5 truncate pl-11 text-xs text-[var(--app-text-muted)] sm:max-w-xs">{title}</p>
          </div>
          <div className="flex min-w-0 shrink-0 items-center justify-end gap-2 sm:gap-3">
            <ThemeToggle compact />
            {user ? (
              <>
                <PortalNav user={user} />
                <Link
                  to={portalHomePath()}
                  className="hidden min-h-11 items-center text-sm text-[var(--app-text-muted)] hover:text-[var(--app-text)] md:inline-flex"
                >
                  Portal
                </Link>
                <span className="hidden max-w-[8rem] truncate text-sm text-[var(--app-text-muted)] lg:inline">{user.name}</span>
                <button
                  type="button"
                  className="btn-secondary inline-flex min-h-11 min-w-11 items-center justify-center p-2"
                  aria-label="Sair"
                  onClick={() => {
                    clearSession();
                    navigate("/");
                  }}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <Link to="/" className="btn-ghost inline-flex min-h-11 items-center text-sm">
                Voltar ao site
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
