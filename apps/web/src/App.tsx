import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { setUnauthorizedHandler } from "./api";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ShellLayout } from "./components/ShellLayout";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { AppHubPage } from "./pages/AppHubPage";
import { CourseStudyPage } from "./pages/CourseStudyPage";
import { CoursesCatalogPage } from "./pages/CoursesCatalogPage";
import { AdminCoursesPage } from "./pages/AdminCoursesPage";
import { AdminDashboard, ClientDashboard, FreelancerDashboard } from "./pages/DashboardPages";
import { useAuthStore } from "./stores/authStore";

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
        <Route index element={<AppHubPage />} />
        <Route path="cursos/:courseSlug/*" element={<CourseStudyPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<ShellLayout title="Cursos" />}>
          <Route path="/app/cursos" element={<CoursesCatalogPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
        <Route element={<ShellLayout title="Administração" />}>
          <Route path="/app/admin" element={<AdminDashboard />} />
          <Route path="/app/admin/cursos" element={<AdminCoursesPage />} />
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
