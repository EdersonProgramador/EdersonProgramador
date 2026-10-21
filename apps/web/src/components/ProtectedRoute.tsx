import { Navigate, Outlet } from "react-router-dom";
import type { AgencyRole } from "@ederson-agencia/shared";
import { useAuthStore } from "../stores/authStore";

export function ProtectedRoute({ roles }: { roles?: AgencyRole[] }) {
  const booting = useAuthStore((s) => s.booting);
  const user = useAuthStore((s) => s.user);

  if (booting) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-white/70">
        Carregando sessão…
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/app" replace />;

  return <Outlet />;
}
