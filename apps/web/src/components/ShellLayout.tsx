import { Link, Outlet, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { homePathForRole } from "@ederson-agencia/shared";
import { useAuthStore } from "../stores/authStore";

export function ShellLayout({ title }: { title: string }) {
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-blue-matte/20 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <Link to="/" className="text-sm font-semibold text-blue-glow hover:text-white">
              Ederson Programador
            </Link>
            <p className="text-xs text-white/50">{title}</p>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to={homePathForRole(user.role)} className="text-sm text-white/80 hover:text-white">
                  Painel
                </Link>
                <span className="hidden text-sm text-white/60 sm:inline">{user.name}</span>
                <button
                  type="button"
                  className="btn-secondary px-3 py-2"
                  onClick={() => {
                    clearSession();
                    navigate("/");
                  }}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <Link to="/" className="btn-ghost text-sm">
                Voltar ao site
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
