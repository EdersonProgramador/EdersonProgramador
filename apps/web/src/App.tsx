import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { homePathForRole } from "@ederson-agencia/shared";
import { setUnauthorizedHandler } from "./api";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ShellLayout } from "./components/ShellLayout";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { AdminDashboard, ClientDashboard, FreelancerDashboard } from "./pages/DashboardPages";
import { useAuthStore } from "./stores/authStore";

function AppHomeRedirect() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={homePathForRole(user.role)} replace />;
}

export default function App() {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const clearSession = useAuthStore((s) => s.clearSession);

  useEffect(() => {
    setUnauthorizedHandler(() => clearSession());
    void bootstrap();
  }, [bootstrap, clearSession]);

  return (
    <Routes>
      <Route index element={<LandingPage />} />
      <Route element={<ShellLayout title="Acesso" />}>
        <Route path="login" element={<LoginPage />} />
      </Route>

      <Route path="/app" element={<ProtectedRoute />}>
        <Route index element={<AppHomeRedirect />} />
      </Route>

      <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
        <Route element={<ShellLayout title="Administração" />}>
          <Route path="/app/admin" element={<AdminDashboard />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["CLIENT"]} />}>
        <Route element={<ShellLayout title="Cliente" />}>
          <Route path="/app/cliente" element={<ClientDashboard />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["FREELANCER"]} />}>
        <Route element={<ShellLayout title="Freelancer" />}>
          <Route path="/app/freelancer" element={<FreelancerDashboard />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
