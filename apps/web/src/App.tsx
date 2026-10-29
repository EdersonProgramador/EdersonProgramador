import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ACADEMY_APP_BASE, ACADEMY_STORE_BASE, AGENCY_APP_BASE } from "@ederson-agencia/shared";
import { AuthSessionBridge } from "./auth/AuthSessionBridge";
import { AcademyShellLayout } from "./components/AcademyShellLayout";
import { AgencyShellLayout } from "./components/AgencyShellLayout";
import {
  AgencyHomeRedirect,
  LegacyAcademyAdminCursosRedirect,
  LegacyAcademyCursosRedirect,
  LegacyProjectRedirect,
  ProtectedRoute
} from "./components/ProtectedRoute";
import { ShellLayout } from "./components/ShellLayout";
import { LandingPage } from "./pages/LandingPage";
import { AgencyLoginPage } from "./pages/LoginPage";
import { AcademyLoginPage } from "./pages/AcademyLoginPage";
import { CertificateVerifyPage } from "./pages/CertificateVerifyPage";
import { CourseStudyPage } from "./pages/CourseStudyPage";
import { AcademyCartPage } from "./pages/AcademyCartPage";
import { AcademyCourseCheckoutPage } from "./pages/AcademyCourseCheckoutPage";
import { AcademyPublicSalesPage } from "./pages/AcademyPublicSalesPage";
import { AcademyStoreCheckoutPage } from "./pages/AcademyStoreCheckoutPage";
import { CoursesCatalogPage } from "./pages/CoursesCatalogPage";
import { AdminCourseContentPage } from "./pages/AdminCourseContentPage";
import { AdminCoursesPage } from "./pages/AdminCoursesPage";
import { AdminDashboard, ClientDashboard, FreelancerDashboard } from "./pages/DashboardPages";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { ThemeSync } from "./components/theme/ThemeSync";
import { useAuthStore } from "./stores/authStore";

export default function App() {
  const bootstrap = useAuthStore((s) => s.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  return (
    <>
      <AuthSessionBridge />
      <ThemeSync />
      <Routes>
        <Route index element={<LandingPage />} />
        <Route path="cursos" element={<AcademyPublicSalesPage />} />
        <Route path="cursos/carrinho" element={<AcademyCartPage />} />
        <Route path="cursos/finalizar" element={<AcademyStoreCheckoutPage />} />
        <Route path="cursos/:courseSlug/comprar" element={<AcademyCourseCheckoutPage />} />
        <Route path="/certificado/:code" element={<CertificateVerifyPage />} />

        <Route element={<ShellLayout title="Acesso" />}>
          <Route path="login" element={<AgencyLoginPage />} />
          <Route path="academia/entrar" element={<AcademyLoginPage />} />
        </Route>

        {/* ——— Agência (projetos, operação) ——— */}
        <Route path={AGENCY_APP_BASE} element={<ProtectedRoute realm="agency" />}>
          <Route element={<AgencyShellLayout title="Operação" />}>
            <Route index element={<AgencyHomeRedirect />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="cliente" element={<ClientDashboard />} />
            <Route path="freelancer" element={<FreelancerDashboard />} />
            <Route path="projetos/:projectId" element={<ProjectDetailPage />} />
          </Route>
        </Route>

        {/* ——— Academia (catálogo, estudo e gestão de cursos) ——— */}
        <Route path={ACADEMY_APP_BASE} element={<ProtectedRoute realm="academy" />}>
          <Route element={<AcademyShellLayout title="Academia" />}>
            <Route index element={<CoursesCatalogPage />} />
            <Route element={<ProtectedRoute realm="academy" roles={["ADMIN"]} />}>
              <Route path="admin/cursos" element={<AdminCoursesPage />} />
              <Route path="admin/cursos/:courseId/conteudo" element={<AdminCourseContentPage />} />
            </Route>
          </Route>
          <Route path="cursos/:courseSlug/*" element={<CourseStudyPage />} />
        </Route>

        {/* Legado /app → novos prefixos */}
        <Route path="/app" element={<Navigate to={AGENCY_APP_BASE} replace />} />
        <Route path="/app/admin/cursos/*" element={<LegacyAcademyAdminCursosRedirect />} />
        <Route path="/agencia/admin/cursos/*" element={<LegacyAcademyAdminCursosRedirect />} />
        <Route path="/app/admin/*" element={<Navigate to={`${AGENCY_APP_BASE}/admin`} replace />} />
        <Route path="/app/cliente" element={<Navigate to={`${AGENCY_APP_BASE}/cliente`} replace />} />
        <Route path="/app/freelancer" element={<Navigate to={`${AGENCY_APP_BASE}/freelancer`} replace />} />
        <Route path="/app/projetos/:projectId" element={<LegacyProjectRedirect />} />
        <Route path="/app/cursos/*" element={<LegacyAcademyCursosRedirect />} />
        <Route path="/academia/loja" element={<Navigate to={ACADEMY_STORE_BASE} replace />} />
        <Route path="/academia/comprar" element={<Navigate to={ACADEMY_STORE_BASE} replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
