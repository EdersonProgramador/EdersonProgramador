import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { agencyHomePathForRole } from "@ederson-agencia/shared";
import type { AuthUser } from "@ederson-agencia/shared";

type NavLink = { to: string; label: string };

function agencyLinks(user: AuthUser): NavLink[] {
  return [{ to: agencyHomePathForRole(user.role), label: "Início" }];
}

function linkClass(pathname: string, path: string, block?: boolean) {
  const active = pathname === path || pathname.startsWith(`${path}/`);
  return [
    "portal-nav-link rounded-lg text-sm font-medium transition",
    block ? "flex w-full min-h-11 items-center px-3 py-2.5" : "inline-flex min-h-11 items-center justify-center px-3 py-2",
    active ? "is-active" : ""
  ].join(" ");
}

export function AgencyNav({ user }: { user: AuthUser }) {
  const { pathname } = useLocation();
  const links = useMemo(() => agencyLinks(user), [user]);
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="portal-nav-bar hidden min-w-0 flex-wrap items-center gap-1 md:flex" aria-label="Agência">
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
