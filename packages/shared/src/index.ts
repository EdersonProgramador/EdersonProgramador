export { ACADEMY_SALES } from "./academy-sales-copy.js";
export type { CourseProgramBonus, CourseProgramContent, PublicCourseProgram } from "./academy-course-program.js";
export {
  ACADEMY_COURSE_PROGRAM_PRESETS,
  academyCourseProgramPath,
  buildDefaultCourseProgramContent,
  normalizePublicCourseProgram
} from "./academy-course-program.js";
export {
  ACADEMY_CART,
  ACADEMY_DEMO_COUPONS,
  ACADEMY_STORE_PATHS
} from "./academy-cart-copy.js";
export { COURSE_COVER, COURSES_UI, FL_COURSE, resolveCourseCoverUrl, TANAR_COURSE } from "./courses-copy.js";
export {
  applyTanarSalmosStudyFallback,
  applyTanarStudyFallback,
  TANAR_MISHLE_CATALOG_LESSONS,
  TANAR_SALMOS_CATALOG_LESSONS,
  type TanarStudyCurriculumItem
} from "./tanar-salmos-study-fallback.js";
export {
  mergeTanarLibraryBooks,
  resolveTanarLibraryPdfUrl,
  tanarLibraryBookDetailFallback,
  TANAR_BIBLIA_HEBRAICA,
  type TanarLibraryBookLike
} from "./tanar-library-fallback.js";
export {
  normalizeTanarBibleSectionKey,
  tanarBibleLibraryLinkHtml,
  tanarBibleLibraryPath,
  tanarBiblePageForLesson,
  tanarBiblePageForSection,
  tanarBibleReadingIntro,
  TANAR_BIBLIA_BOOK_SLUG,
  TANAR_BIBLIA_OUTLINE,
  TANAR_KETUVIM_EXTRA_EXPECTED,
  TANAR_KETUVIM_TRACK,
  TANAR_NEVIIM_TRACK,
  TANAR_PROFETAS_EXPECTED_LESSONS,
  type TanarBibleOutlineEntry,
  type TanarBibleTrackLesson
} from "./tanar-bible-outline.js";
export {
  enrichTanarBibleLessonNotes,
  needsTanarProseFallback,
  tanarBibleLessonHtmlForSlug,
  tanarMishleChapterLessonHtml,
  tanarTehillimDayLessonHtml,
  tanarTorahBlockLessonHtml,
  tanarTrackBookLessonHtml
} from "./tanar-lesson-prose.js";

import { ACADEMY_APP_BASE, AGENCY_APP_BASE, agencyHomePathForRole } from "./auth-context.js";

export type AgencyRole = "ADMIN" | "CLIENT" | "FREELANCER";

export type { AuthContext, SessionUser } from "./auth-context.js";
export {
  ACADEMY_ADMIN_COURSES_BASE,
  ACADEMY_APP_BASE,
  ACADEMY_PROFILE_PATH,
  ACADEMY_STORE_BASE,
  ACADEMY_STORE_CUSTOMER_MARKER,
  AGENCY_PROFILE_PATH,
  academyCourseCheckoutPath,
  AGENCY_APP_BASE,
  agencyHomePathForRole,
  ACADEMY_INTERNAL_ADMIN_EMAIL,
  canAccessAcademy,
  canAccessAgency,
  isAcademyInternalAdmin,
  isAcademyStoreCustomer,
  homePathAfterLogin,
  inferAuthContextFromPath,
  loginPathForContext,
  resolvePostLoginPath,
  sanitizeReturnPath
} from "./auth-context.js";
export type { AuthRouteState } from "./auth-context.js";

/** Usuário autenticado (JWT). `authContext` indica o login usado: Agência ou Academia. */
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: AgencyRole;
  company?: string | null;
  github?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  authContext?: import("./auth-context.js").AuthContext;
};

/** @deprecated Use AGENCY_APP_BASE ou agencyHomePathForRole. */
export function portalHomePath(): string {
  return AGENCY_APP_BASE;
}

/** @deprecated Use agencyHomePathForRole(role). */
export function homePathForRole(role: AgencyRole): string {
  return agencyHomePathForRole(role);
}

export const CONTRACT_DEFAULTS = {
  title: "Contrato de Prestação de Serviços de Desenvolvimento de Site/Sistema",
  totalValueCents: 300_000,
  entryValueCents: 150_000,
  technicalHourCents: 5_000,
  estimatedDays: 40,
  lateFeePercent: 5,
  lateInterestPercentMonthly: 2,
  clientRescissionPenaltyPercent: 25,
  phases: [
    {
      key: "DESIGN",
      label: "1ª fase — Criação de toda a parte gráfica do projeto (pré-aprovação da CONTRATANTE)",
      days: 10
    },
    {
      key: "LOGIC",
      label:
        "2ª fase — Desenvolvimento da lógica e funcionamento, com base na parte gráfica aprovada",
      days: 15
    },
    {
      key: "CONTENT",
      label: "3ª fase — Ajuste do conteúdo fornecido pela CONTRATANTE ao projeto desenvolvido",
      days: 10
    },
    {
      key: "DEPLOY",
      label: "4ª fase — Configuração e publicação do projeto",
      days: 5
    }
  ] as const
} as const;

export type ContractPhaseKey = (typeof CONTRACT_DEFAULTS.phases)[number]["key"];

export { BRAND_IDENTITY } from "./brand.js";
export { CONTRACT_COPY } from "./contract-copy.js";
export { MARKETING_COPY } from "./marketing-copy.js";
export { SEED_LAUNCH_COPY, SEED_LAUNCH_PATH } from "./seed-launch-copy.js";
export {
  AGENCY_CONTRACT_VERSION,
  AGENCY_FUNNEL_COPY,
  contractSummaryForTier,
  type AgencyContractPartySnapshot
} from "./agency-funnel-copy.js";
export {
  buildInstitutionalPackagesJson,
  institutionalFunnelDbDefaults,
  type FunnelPackageJson
} from "./agency-funnel-institutional.js";
export {
  composeAgencyContractDocument,
  composeAgencyContractDocumentForTier,
  contractDocumentToPlainText,
  sanitizeContractCompany,
  type AgencyContractDocument,
  type AgencyContractDocumentSection,
  type ComposeAgencyContractInput
} from "./agency-contract-document.js";
export {
  contractKindForTier,
  isPartnershipTier,
  isCompleteContractAddress,
  legalNameFromPartyDetails,
  normalizePartyDetails,
  validatePartyDetails,
  type AgencyContractAddress,
  type AgencyContractKind,
  type AgencyContractPartyDetails,
  type ContractPartyKind
} from "./agency-contract-legal.js";
export {
  PACKAGE_TIER_CONFIG,
  PACKAGE_TIER_IDS,
  JOURNEY_PHASES,
  JOURNEY_PHASE_KEYS,
  PHASE_STATUS_LABELS,
  DELIVERABLE_STATUS_LABELS,
  UPGRADE_TIER_ORDER,
  allDeliverablesForTier,
  currentPhaseIndex,
  deliverablesForTierPhase,
  entryValueCentsForTier,
  nextUpgradeTier,
  packageTierLabel,
  parsePackageTier,
  projectProgressPercent,
  type JourneyPhaseKey,
  type PackageTierId
} from "./project-journey.js";
export { LEGAL_NOTICES } from "./legal-notices.js";

export {
  AGENCY_META,
  PORTFOLIO_GITHUB,
  PORTFOLIO_PRODUCTION,
  PORTFOLIO_REPOS,
  type PortfolioGithubItem,
  type PortfolioProductionItem
} from "./portfolio.js";

export function formatBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}
