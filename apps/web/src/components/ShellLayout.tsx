import { Link, Outlet } from "react-router-dom";
import { BrandLogo } from "./brand/BrandLogo";
import { ThemeToggle } from "./theme/ThemeToggle";

/** Layout mínimo para telas públicas de login (sem nav de Agência/Academia). */
export function ShellLayout({ title }: { title: string }) {
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
            <Link to="/" className="btn-ghost inline-flex min-h-11 items-center text-sm">
              Voltar ao site
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
