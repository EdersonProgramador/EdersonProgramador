import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { ACADEMY_ADMIN_COURSES_BASE, ACADEMY_APP_BASE, isAcademyInternalAdmin } from "@ederson-agencia/shared";
import type { AuthUser } from "@ederson-agencia/shared";

type NavLink = { to: string; label: string };

function academyLinks(user: AuthUser | undefined): NavLink[] {
  const links: NavLink[] = [{ to: ACADEMY_APP_BASE, label: "Meus cursos" }];
  if (user && isAcademyInternalAdmin(user)) {
    links.push({ to: ACADEMY_ADMIN_COURSES_BASE, label: "Gerenciar cursos" });
  }
  return links;
}

function linkClass(pathname: string, path: string, block?: boolean) {
  const active =
    path === ACADEMY_APP_BASE
      ? pathname === ACADEMY_APP_BASE
      : pathname === path || pathname.startsWith(`${path}/`);
  return [
    "portal-nav-link rounded-lg text-sm font-medium transition",
    block ? "flex w-full min-h-11 items-center px-3 py-2.5" : "inline-flex min-h-11 items-center justify-center px-3 py-2",
    active ? "is-active" : ""
  ].join(" ");
}

export function AcademyNav({ user }: { user?: AuthUser }) {
  const { pathname } = useLocation();
  const links = useMemo(() => academyLinks(user), [user]);
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="portal-nav-bar hidden min-w-0 flex-wrap items-center gap-1 md:flex" aria-label="Academia">
        {links.map((item) => (
          <Link key={item.to} to={item.to} className={linkClass(pathname, item.to)}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="relative md:hidden">
        <button
          type="button"
          className="btn-secondary inline-flex min-h-11 min-w-11 items-center justify-center p-2"
          aria-expanded={open}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        {open ? (
          <>
            <button type="button" className="portal-nav-backdrop fixed inset-0 z-40" aria-label="Fechar" onClick={() => setOpen(false)} />
            <nav className="portal-nav-menu absolute right-0 top-[calc(100%+0.35rem)] z-50 w-[min(18rem,calc(100vw-1.5rem))] rounded-xl border p-2 shadow-2xl">
              {links.map((item) => (
                <Link key={item.to} to={item.to} className={linkClass(pathname, item.to, true)} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </>
        ) : null}
      </div>
    </>
  );
}
