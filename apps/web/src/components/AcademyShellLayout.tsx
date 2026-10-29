import { Link, Outlet, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { AcademyNav } from "./portal/AcademyNav";
import { BrandLogo } from "./brand/BrandLogo";
import { ThemeToggle } from "./theme/ThemeToggle";
import { useAcademySession, useAuthStore } from "../stores/authStore";

export function AcademyShellLayout({ title }: { title: string }) {
  const session = useAcademySession();
  const clearSession = useAuthStore((s) => s.clearSession);
  const navigate = useNavigate();
  const user = session?.user;

  return (
    <div className="surface-light min-h-screen bg-[var(--app-bg-solid)] text-[var(--app-text)]">
      <header className="app-shell-header sticky top-0 z-50 border-b border-[var(--app-border)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-4">
          <div className="min-w-0">
            <Link to="/" className="group inline-block">
              <BrandLogo size="sm" />
            </Link>
            <p className="mt-1.5 truncate pl-11 text-xs text-[var(--app-text-muted)]">
              Academia interna · {title}
            </p>
          </div>
          <div className="flex min-w-0 shrink-0 items-center justify-end gap-2 sm:gap-3">
            <ThemeToggle compact />
            {user ? (
              <>
                <AcademyNav />
                <span className="hidden max-w-[8rem] truncate text-sm text-[var(--app-text-muted)] lg:inline">
                  {user.name}
                </span>
                <button
                  type="button"
                  className="btn-secondary inline-flex min-h-11 min-w-11 items-center justify-center p-2"
                  aria-label="Sair da Academia"
                  onClick={() => {
                    clearSession("academy");
                    navigate("/");
                  }}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <Link to="/academia/entrar" className="btn-ghost inline-flex min-h-11 items-center text-sm">
                Entrar
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
