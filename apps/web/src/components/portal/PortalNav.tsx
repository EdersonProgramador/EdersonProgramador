import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { agencyHomePathForRole, portalHomePath } from "@ederson-agencia/shared";
import type { AuthUser } from "@ederson-agencia/shared";

type NavLink = { to: string; label: string };

function portalLinks(user: AuthUser): NavLink[] {
  const agencyPath = agencyHomePathForRole(user.role);
  const links: NavLink[] = [
    { to: portalHomePath(), label: "Início" },
    { to: "/app/cursos", label: "Academia" },
    { to: agencyPath, label: "Agência" }
  ];
  if (user.role === "ADMIN") {
    links.push({ to: "/app/admin/cursos", label: "Cursos (admin)" });
  }
  return links;
}

function linkClass(pathname: string, path: string, block?: boolean) {
  const active = pathname === path || pathname.startsWith(`${path}/`);
  return [
    "portal-nav-link rounded-lg text-sm font-medium transition",
    block ? "flex w-full min-h-11 items-center px-3 py-2.5" : "inline-flex min-h-11 items-center justify-center px-3 py-2",
    active ? "is-active" : ""
  ].join(" ");
}

export function PortalNav({ user }: { user: AuthUser }) {
  const { pathname } = useLocation();
  const links = useMemo(() => portalLinks(user), [user]);
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="portal-nav-bar hidden min-w-0 flex-wrap items-center gap-1 md:flex" aria-label="Áreas do portal">
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
          aria-controls="portal-nav-mobile"
          aria-label={open ? "Fechar menu do portal" : "Abrir menu do portal"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        {open ? (
          <>
            <button
              type="button"
              className="portal-nav-backdrop fixed inset-0 z-40"
              aria-label="Fechar menu"
              onClick={() => setOpen(false)}
            />
            <nav
              id="portal-nav-mobile"
              className="portal-nav-menu absolute right-0 top-[calc(100%+0.35rem)] z-50 w-[min(18rem,calc(100vw-1.5rem))] rounded-xl border p-2 shadow-2xl"
              aria-label="Áreas do portal"
            >
              {links.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={linkClass(pathname, item.to, true)}
                  onClick={() => setOpen(false)}
                >
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
