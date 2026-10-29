import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { AgencyRole, AuthContext } from "@ederson-agencia/shared";
import { canAccessAcademy, canAccessAgency, loginPathForContext } from "@ederson-agencia/shared";
import { useAuthStore } from "../stores/authStore";

export function ProtectedRoute({ roles, realm }: { roles?: AgencyRole[]; realm?: AuthContext }) {
  const booting = useAuthStore((s) => s.booting);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (booting) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[var(--app-text-muted)]">
        Carregando sessão…
      </div>
    );
  }

  if (!user) {
    const loginTo = loginPathForContext(realm ?? "agency");
    return <Navigate to={loginTo} replace state={{ from: location.pathname }} />;
  }

  if (realm === "agency" && !canAccessAgency(user)) {
    return <Navigate to="/academia/entrar" replace state={{ from: location.pathname, needAgency: true }} />;
  }

  if (realm === "academy" && !canAccessAcademy(user)) {
    return <Navigate to="/login" replace state={{ from: location.pathname, needAcademy: true }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
