import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import {
  ACADEMY_APP_BASE,
  ACADEMY_STORE_BASE,
  AGENCY_APP_BASE,
  DEVELOPMENT_LEGACY_PATH_ALIASES,
  developmentNavFlatItems,
  formulaNavFlatItems,
  marketingNavFlatItems
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
import { LandingPage } from "./pages/LandingPage";
import { LaunchPublicPage } from "./pages/LaunchPublicPage";
import { CadastroPage } from "./pages/CadastroPage";
import { AgencyLoginPage } from "./pages/LoginPage";
import { AcademyLoginPage } from "./pages/AcademyLoginPage";
import { CertificateVerifyPage } from "./pages/CertificateVerifyPage";
import { CourseStudyPage } from "./pages/CourseStudyPage";
import { AcademyCartPage } from "./pages/AcademyCartPage";
import { AcademyCourseCheckoutPage } from "./pages/AcademyCourseCheckoutPage";
import { AcademyCourseProgramPage } from "./pages/AcademyCourseProgramPage";
import { AcademyPublicSalesPage } from "./pages/AcademyPublicSalesPage";
import { AcademyStoreCheckoutPage } from "./pages/AcademyStoreCheckoutPage";
import { CoursesCatalogPage } from "./pages/CoursesCatalogPage";
import { AdminCourseContentPage } from "./pages/AdminCourseContentPage";
import { AdminCoursesPage } from "./pages/AdminCoursesPage";
import {
  AdminClientsPage,
  AdminFunnelPage,
  AdminLeadsPage,
  AdminProjectsPage,
  ClientDashboard,
  FreelancerDashboard
} from "./pages/DashboardPages";
import { AdminBrandbookPage } from "./pages/AdminBrandbookPage";
import { AdminFormulaSimuladorPage } from "./pages/AdminFormulaSimuladorPage";
import { AdminLaunchPlanPdfPage } from "./pages/AdminLaunchPlanPdfPage";
import { AdminMarketingPlanejamentoPage } from "./pages/AdminMarketingPlanejamentoPage";
import { AdminBrandingEtapaPage } from "./pages/AdminBrandingEtapaPage";
import { AdminProductOfferPage } from "./pages/AdminProductOfferPage";
import { AdminLaunchKitPage } from "./pages/AdminLaunchKitPage";
import { AdminLaunchPhasePage } from "./pages/AdminLaunchPhasePage";
import { AdminMarketingDevPage } from "./pages/AdminMarketingDevPage";
import { AdminMarketingHubPage } from "./pages/AdminMarketingHubPage";
import { AdminBrandingHubPage } from "./pages/AdminBrandingHubPage";
import { AdminDevelopmentHubPage } from "./pages/AdminDevelopmentHubPage";
import { AdminCodeStudioFullPage } from "./pages/AdminCodeStudioFullPage";
import { AdminFormulaHubPage } from "./pages/AdminFormulaHubPage";
import { AdminOperationsLayout } from "./components/admin/AdminOperationsLayout";
import { LegacyMarketingStackRoute } from "./components/admin/LegacyMarketingStackRoute";
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
        <Route index element={<LandingPage />} />
        <Route path="l/:slug" element={<LaunchPublicPage />} />
        <Route path="cadastro" element={<CadastroPage />} />
        <Route path="lancamento" element={<Navigate to="/cadastro" replace />} />
        <Route path="cursos" element={<AcademyPublicSalesPage />} />
        <Route path="cursos/carrinho" element={<AcademyCartPage />} />
        <Route path="cursos/finalizar" element={<AcademyStoreCheckoutPage />} />
        <Route path="cursos/:courseSlug/comprar" element={<AcademyCourseCheckoutPage />} />
        <Route path="cursos/:courseSlug" element={<AcademyCourseProgramPage />} />
        <Route path="/certificado/:code" element={<CertificateVerifyPage />} />

        <Route element={<ShellLayout title="Acesso" />}>
          <Route path="login" element={<AgencyLoginPage />} />
          <Route path="academia/entrar" element={<AcademyLoginPage />} />
        </Route>

        {/* ——— Agência (projetos, operação) ——— */}
        <Route path={AGENCY_APP_BASE} element={<ProtectedRoute realm="agency" />}>
          <Route element={<AgencyShellLayout title="Operação" />}>
            <Route index element={<AgencyHomeRedirect />} />
            <Route element={<ProtectedRoute realm="agency" roles={["ADMIN"]} />}>
              <Route path="studio/desenvolvimento" element={<AdminCodeStudioFullPage />} />
              <Route path="admin" element={<AdminOperationsLayout />}>
                <Route index element={<Navigate to="projetos" replace />} />
                <Route path="projetos" element={<AdminProjectsPage />} />
                <Route path="operacao/marketing/planejamento" element={<AdminMarketingPlanejamentoPage />} />
                {marketingNavFlatItems().map((item) => (
                  <Route key={item.id} path={item.adminPath} element={<AdminMarketingHubPage />} />
                ))}
                <Route path="operacao/branding/estatistica" element={<AdminBrandingHubPage />} />
                <Route path="operacao/branding/brandbook" element={<AdminBrandbookPage />} />
                <Route path="operacao/branding/:etapaId" element={<AdminBrandingEtapaPage />} />
                <Route path="operacao/desenvolvimento/stack" element={<AdminDevelopmentHubPage />} />
                <Route path="operacao/desenvolvimento/stack-front-end" element={<AdminDevelopmentHubPage />} />
                <Route path="operacao/desenvolvimento/stack-back-end" element={<AdminDevelopmentHubPage />} />
                <Route path="operacao/desenvolvimento/stack-dados" element={<AdminDevelopmentHubPage />} />
                <Route path="operacao/desenvolvimento/stack-infra" element={<AdminDevelopmentHubPage />} />
                <Route path="operacao/desenvolvimento/stack-automacao" element={<AdminDevelopmentHubPage />} />
                <Route path="operacao/desenvolvimento/stack-pagamentos" element={<AdminDevelopmentHubPage />} />
                <Route path="operacao/desenvolvimento/stack-email" element={<AdminDevelopmentHubPage />} />
                <Route path="operacao/desenvolvimento/editor" element={<AdminDevelopmentHubPage />} />
                <Route path="operacao/desenvolvimento/estatistica" element={<AdminDevelopmentHubPage />} />
                <Route path="operacao/desenvolvimento/infra" element={<AdminDevelopmentHubPage />} />
                <Route path="operacao/desenvolvimento/:stackId" element={<AdminMarketingDevPage />} />
                {Object.entries(DEVELOPMENT_LEGACY_PATH_ALIASES).map(([legacy, canonical]) => (
                  <Route
                    key={legacy}
                    path={legacy}
                    element={<Navigate to={`${AGENCY_APP_BASE}/admin/${canonical}`} replace />}
                  />
                ))}
                <Route path="operacao/marketing/:stackId" element={<LegacyMarketingStackRoute />} />
                <Route path="operacao/formula-lancamento/simulador" element={<AdminFormulaSimuladorPage />} />
                <Route path="operacao/formula-lancamento/plano-pdf" element={<AdminLaunchPlanPdfPage />} />
                {formulaNavFlatItems().map((item) => (
                  <Route key={item.id} path={item.adminPath} element={<AdminFormulaHubPage />} />
                ))}
                <Route path="operacao/produto-oferta" element={<AdminProductOfferPage />} />
                <Route path="operacao/launch-kit" element={<AdminLaunchKitPage />} />
                <Route path="operacao/:phaseId" element={<AdminLaunchPhasePage />} />
                <Route path="funil" element={<AdminFunnelPage />} />
                <Route path="leads" element={<AdminLeadsPage />} />
                <Route path="clientes" element={<AdminClientsPage />} />
              </Route>
            </Route>
            <Route element={<ProtectedRoute realm="agency" roles={["CLIENT"]} />}>
              <Route path="cliente" element={<ClientDashboard />} />
            </Route>
            <Route path="freelancer" element={<FreelancerDashboard />} />
            <Route path="projetos/:projectId" element={<ProjectDetailPage />} />
            <Route path="perfil" element={<UserProfilePage realm="agency" />} />
          </Route>
        </Route>

        {/* ——— Academia (catálogo, estudo e gestão de cursos) ——— */}
        <Route path={ACADEMY_APP_BASE} element={<ProtectedRoute realm="academy" />}>
          <Route element={<AcademyShellLayout title="Academia" />}>
            <Route index element={<CoursesCatalogPage />} />
            <Route element={<ProtectedRoute realm="academy" roles={["ADMIN"]} internalAdminOnly />}>
              <Route path="admin/cursos" element={<AdminCoursesPage />} />
              <Route path="admin/cursos/:courseId/conteudo" element={<AdminCourseContentPage />} />
            </Route>
            <Route path="perfil" element={<UserProfilePage realm="academy" />} />
          </Route>
          <Route path="cursos/:courseSlug/*" element={<CourseStudyPage />} />
        </Route>

        {/* Legado /app → novos prefixos */}
        <Route path="/app" element={<Navigate to={AGENCY_APP_BASE} replace />} />
        <Route path="/app/admin/cursos/*" element={<LegacyAcademyAdminCursosRedirect />} />
        <Route path="/agencia/admin/cursos/*" element={<LegacyAcademyAdminCursosRedirect />} />
        <Route path="/app/admin/*" element={<Navigate to={`${AGENCY_APP_BASE}/admin/projetos`} replace />} />
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
