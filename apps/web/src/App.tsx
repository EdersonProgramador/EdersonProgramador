import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import {
  ACADEMY_APP_BASE,
  ACADEMY_STORE_BASE,
  ACADEMY_VITRINE_PATH,
  AGENCY_APP_BASE,
  AGENCY_CLIENT_PORTAL_CONTRACT_PATH
} from "@ederson-agencia/shared";
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
import { AmplificaCrmLandingPage } from "./pages/AmplificaCrmLandingPage";
import { LandingPage } from "./pages/LandingPage";
import { LaunchPublicPage } from "./pages/LaunchPublicPage";
import { CadastroPage } from "./pages/CadastroPage";
import { QualificationFormPage } from "./pages/QualificationFormPage";
import { AgencyLoginPage } from "./pages/LoginPage";
import { AcademyLoginPage } from "./pages/AcademyLoginPage";
import { CertificateVerifyPage } from "./pages/CertificateVerifyPage";
import { CourseStudyPage } from "./pages/CourseStudyPage";
import { AcademyCartPage } from "./pages/AcademyCartPage";
import { AcademyCourseCheckoutPage } from "./pages/AcademyCourseCheckoutPage";
import { AcademyCourseProgramPage } from "./pages/AcademyCourseProgramPage";
import { AcademyPublicSalesPage } from "./pages/AcademyPublicSalesPage";
import { AcademyCoursesInstitutionalPage } from "./pages/AcademyCoursesInstitutionalPage";
import { AcademyStoreCheckoutPage } from "./pages/AcademyStoreCheckoutPage";
import { AccountHubPage } from "./pages/AccountHubPage";
import { CoursesCatalogPage } from "./pages/CoursesCatalogPage";
import { AcademyOpsCrmRedirect } from "./pages/AcademyOpsCrmRedirect";
import { FreelancerDashboard } from "./pages/DashboardPages";
import { AgencyClientPortalLayout } from "./components/AgencyClientPortalLayout";
import { AgencyClientPortalHome } from "./pages/agency-client/AgencyClientPortalHome";
import { AgencyClientProjectPage } from "./pages/agency-client/AgencyClientProjectPage";
import { AgencyClientSupportPage } from "./pages/agency-client/AgencyClientSupportPage";
import { AgencyClientContractPage } from "./pages/agency-client/AgencyClientContractPage";
import { AdminAmplificaCrmPage } from "./pages/AdminAmplificaCrmPage";
import { AdminCodeStudioFullPage } from "./pages/AdminCodeStudioFullPage";
import { AdminOperationsLayout } from "./components/admin/AdminOperationsLayout";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { UserProfilePage } from "./pages/UserProfilePage";
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
        <Route index element={<AmplificaCrmLandingPage />} />
        <Route path="vsl" element={<LandingPage />} />
        <Route path="l/:slug" element={<LaunchPublicPage />} />
        <Route path="cadastro" element={<CadastroPage />} />
        <Route path="formulario" element={<QualificationFormPage />} />
        <Route path="lancamento" element={<Navigate to="/vsl" replace />} />
        <Route path="cursos" element={<AcademyPublicSalesPage />} />
        <Route path="cursos/institucional" element={<AcademyCoursesInstitutionalPage />} />
        <Route path="cursos/carrinho" element={<AcademyCartPage />} />
        <Route path="cursos/finalizar" element={<AcademyStoreCheckoutPage />} />
        <Route path="cursos/:courseSlug/comprar" element={<AcademyCourseCheckoutPage />} />
        <Route path="cursos/:courseSlug" element={<AcademyCourseProgramPage />} />
        <Route path="/certificado/:code" element={<CertificateVerifyPage />} />

        <Route element={<ShellLayout title="Acesso" />}>
          <Route path="login" element={<AgencyLoginPage />} />
          <Route path="cliente/entrar" element={<Navigate to="/login" replace />} />
          <Route path="freelancer/entrar" element={<Navigate to="/login" replace />} />
          <Route path="academia/entrar" element={<AcademyLoginPage />} />
          <Route path="conta" element={<AccountHubPage />} />
        </Route>

        {/* CRM = app padrão em /agencia/admin (página cheia). Bridge crm/* faz hard-nav. Studio no React. */}
        <Route path={`${AGENCY_APP_BASE}/admin`} element={<AdminOperationsLayout />}>
          <Route index element={<AdminAmplificaCrmPage />} />
          <Route path="crm/:view" element={<AdminAmplificaCrmPage />} />
          <Route path="crm" element={<Navigate to={`${AGENCY_APP_BASE}/admin/crm/dashboard`} replace />} />
          <Route element={<ProtectedRoute realm="agency" roles={["ADMIN"]} />}>
            <Route path="studio" element={<AdminCodeStudioFullPage />} />
          </Route>
          <Route path="academia/*" element={<AcademyOpsCrmRedirect />} />
          <Route path="*" element={<AdminAmplificaCrmPage />} />
        </Route>
        <Route
          path={`${AGENCY_APP_BASE}/studio/desenvolvimento`}
          element={<Navigate to={`${AGENCY_APP_BASE}/admin/studio`} replace />}
        />

        {/* ——— Agência (projetos / cliente) ——— */}
        <Route path={AGENCY_APP_BASE} element={<ProtectedRoute realm="agency" />}>
          <Route index element={<AgencyHomeRedirect />} />
          <Route element={<ProtectedRoute realm="agency" roles={["CLIENT"]} />}>
            <Route element={<AgencyClientPortalLayout />}>
              <Route path="cliente" element={<AgencyClientPortalHome />} />
              <Route path="cliente/projeto" element={<AgencyClientProjectPage />} />
              <Route path="cliente/suporte" element={<AgencyClientSupportPage />} />
              <Route path="cliente/contratar" element={<AgencyClientContractPage />} />
              <Route path="projetos/:projectId" element={<ProjectDetailPage />} />
              <Route path="perfil" element={<UserProfilePage realm="agency" />} />
            </Route>
            <Route path="contratar" element={<Navigate to={AGENCY_CLIENT_PORTAL_CONTRACT_PATH} replace />} />
          </Route>
          <Route element={<AgencyShellLayout title="Operação" />}>
            <Route path="freelancer" element={<FreelancerDashboard />} />
            <Route element={<ProtectedRoute realm="agency" roles={["FREELANCER", "ADMIN"]} />}>
              <Route path="projetos/:projectId" element={<ProjectDetailPage />} />
              <Route path="perfil" element={<UserProfilePage realm="agency" />} />
            </Route>
          </Route>
        </Route>

        {/* ——— Academia (catálogo, estudo e gestão de cursos) ——— */}
        <Route path={ACADEMY_APP_BASE} element={<ProtectedRoute realm="academy" />}>
          <Route element={<AcademyShellLayout title="Academia" />}>
            <Route index element={<CoursesCatalogPage />} />
            <Route path="perfil" element={<UserProfilePage realm="academy" />} />
          </Route>
          <Route path="cursos/:courseSlug/*" element={<CourseStudyPage />} />
        </Route>

        {/* Legado /app → novos prefixos */}
        <Route path="/app" element={<Navigate to={AGENCY_APP_BASE} replace />} />
        <Route path="/app/admin/cursos/*" element={<LegacyAcademyAdminCursosRedirect />} />
        <Route path="/agencia/admin/cursos/*" element={<LegacyAcademyAdminCursosRedirect />} />
        <Route path="/app/admin/*" element={<Navigate to={`${AGENCY_APP_BASE}/admin/?view=dashboard`} replace />} />
        <Route path="/app/cliente" element={<Navigate to={`${AGENCY_APP_BASE}/cliente`} replace />} />
        <Route path="/app/freelancer" element={<Navigate to={`${AGENCY_APP_BASE}/freelancer`} replace />} />
        <Route path="/app/projetos/:projectId" element={<LegacyProjectRedirect />} />
        <Route path="/app/cursos/*" element={<LegacyAcademyCursosRedirect />} />
        <Route path="/academia/loja" element={<Navigate to={ACADEMY_STORE_BASE} replace />} />
        <Route path="/academia/vitrine" element={<Navigate to={ACADEMY_VITRINE_PATH} replace />} />
        <Route path="/academia/vitrine/*" element={<Navigate to={ACADEMY_VITRINE_PATH} replace />} />
        <Route path="/academia/admin/cursos/*" element={<LegacyAcademyAdminCursosRedirect />} />
        <Route path="/academia/comprar" element={<Navigate to={ACADEMY_STORE_BASE} replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
