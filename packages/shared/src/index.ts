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
export {
  COURSE_COVER,
  COURSES_UI,
  ENEM_FELIPE_ARAUJO_COURSE,
  FL_COURSE,
  resolveCourseCoverUrl,
  TANAR_COURSE
} from "./courses-copy.js";
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
export { LAUNCH_FUNNEL_COPY } from "./launch-funnel-copy.js";
export { SEED_LAUNCH_COPY, SEED_LAUNCH_PATH } from "./seed-launch-copy.js";
export { CADASTRO_COPY, CADASTRO_PATH, CADASTRO_PUBLIC_URL } from "./cadastro-copy.js";
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
  PACKAGE_TIER_SALES_IDS,
  packageTierSelectOptions,
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
export {
  adjacentOperationProductionPhase,
  findBrandingOperationNavContext,
  findDevelopmentOperationNavContext,
  findFormulaOperationNavContext,
  findMarketingOperationNavContext,
  findOperationNavByAdminPath,
  OPERATION_PILLAR_NAV,
  operationPhaseNavLabel,
  type OperationPillarNav,
  type OperationPillarTone,
  type OperationProductionPhaseNav
} from "./launch-operation-nav.js";
export {
  findMarketingNavByAdminPath,
  MARKETING_LEGACY_PATH_ALIASES,
  MARKETING_OPERATION_NAV,
  marketingNavFlatItems,
  type MarketingNavItem,
  type MarketingNavSection
} from "./marketing-operation-nav.js";
export {
  BRANDING_LEGACY_PATH_ALIASES,
  BRANDING_OPERATION_NAV,
  brandingNavFlatItems,
  findBrandingNavByAdminPath,
  type BrandingNavItem,
  type BrandingNavSection
} from "./branding-operation-nav.js";
export {
  DEVELOPMENT_LEGACY_PATH_ALIASES,
  DEVELOPMENT_OPERATION_NAV,
  developmentNavFlatItems,
  developmentStackIdFromAdminPath,
  findDevelopmentNavByAdminPath,
  type DevelopmentNavItem,
  type DevelopmentNavSection
} from "./development-operation-nav.js";
export {
  DEVELOPMENT_TECH_STACK_CATEGORIES,
  devTechStackCategoryByAdminSegment,
  devTechStackFieldIds,
  devTechOptionsByGroup,
  findDevTechOptionByStoredValue,
  devTechStackCategoryByNavItemId,
  type DevTechOption,
  type DevTechStackCategory
} from "./development-tech-stack.js";
export { DEV_TECH_BRAND_SLUG, devTechBrandSlug } from "./development-tech-brand-slugs.js";
export {
  DEV_TECH_BRAND_LOCAL_ICON,
  DEV_TECH_SI_JSDELIVR_SLUGS,
  devTechBrandIconCandidates,
  simpleIconsCdnUrl,
  simpleIconsJsdelivrUrl
} from "./development-tech-brand-icons.js";
export {
  DEV_CODE_STUDIO_FIELD_ID,
  defaultDevCodeStudioSnapshot,
  parseDevCodeStudioSnapshot,
  serializeDevCodeStudioSnapshot,
  type DevCodeStudioFile,
  type DevCodeStudioFolder,
  type DevCodeStudioOpenTab,
  type DevCodeStudioSnapshot,
  type DevCodeStudioTabGroup
} from "./development-code-studio.js";
export {
  buildCodeStudioTree,
  closeTabInSnapshot,
  createFileInSnapshot,
  createFolderInSnapshot,
  deleteFileFromSnapshot,
  deleteFolderFromSnapshot,
  ensureOpenTabs,
  fileBaseName,
  folderParentPath,
  importFileIntoSnapshot,
  importFilesIntoSnapshot,
  joinPath,
  languageFromPath,
  openFileInTab,
  pinTabForFile,
  prepareDevCodeStudioSnapshotForStorage,
  renamePathInSnapshot,
  setActiveOpenFile,
  uniqueFileNameInDirectory,
  uniqueFolderNameInDirectory,
  type CodeStudioTreeNode,
  type ImportLocalFileSpec
} from "./development-code-studio-fs.js";
export {
  findFormulaNavByAdminPath,
  FORMULA_HUB_REDIRECT_TO_PHASE,
  FORMULA_LEGACY_PATH_ALIASES,
  FORMULA_OPERATION_NAV,
  formulaLaunchPhaseIdFromHubView,
  formulaNavFlatItems,
  type FormulaNavItem,
  type FormulaNavSection
} from "./formula-operation-nav.js";
export {
  findOperationSectionNavByAdminPath,
  findOperationSectionNavContext,
  operationSectionNavFlatItems,
  operationSectionNavItemActive,
  type OperationSectionNav,
  type OperationSectionNavItem
} from "./operation-pillar-section-nav.js";
export {
  adjacentBrandingEtapa,
  BRANDING_ETAPAS,
  brandingEtapaAdminPath,
  brandingEtapaProgress,
  brandingWorkspaceProgress,
  getBrandingEtapa,
  isBrandingFieldValueEmpty,
  parseBrandingWorkspaceJson,
  type BrandingEtapaDef,
  type BrandingEtapaId,
  type BrandingFieldDef,
  type BrandingFieldType,
  type BrandingFieldValue,
  type BrandingMediaAsset,
  type BrandingRepeaterColumn,
  type BrandingRepeaterValue,
  type BrandingSectionDef,
  type BrandingWorkspaceData
} from "./branding-workspace.js";
export {
  BRANDING_NAMING_FIELD_ID,
  BRANDING_PALETTE_FIELD_ID,
  buildBrandbookOutline,
  buildBrandbookPdfModel,
  type BrandbookPdfModel,
  brandingNamingStudioValueEmpty,
  brandingPaletteValueEmpty,
  defaultBrandingNamingStudioValue,
  defaultBrandingPaletteValue,
  formatBrandingNamingForFeed,
  formatBrandingPaletteForFeed,
  isBrandingNamingStudioValue,
  isBrandingPaletteValue,
  parseBrandingNamingField,
  parseBrandingPaletteField,
  type BrandbookSection,
  type BrandingNamingOption,
  type BrandingNamingStudioValue,
  type BrandingPaletteRole,
  type BrandingPaletteSwatch,
  type BrandingPaletteValue
} from "./branding-studio.js";
export {
  buildLaunchPlanOutline,
  buildLaunchPlanPdfModel,
  type LaunchPlanPdfModel
} from "./launch-plan-report.js";
export {
  buildCanvaAutofillData,
  CANVA_AUTOFILL_TEXT_BINDINGS,
  type CanvaAutofillTextDatum
} from "./canva-integration.js";
export {
  computeLaunchRevenueProjection,
  FORMULA_SIMULATOR_FIELD_IDS,
  FORMULA_SIMULATOR_FIELDS,
  formulaSimulatorProgress,
  type LaunchScenario,
  type LaunchSimulatorResult
} from "./formula-launch-simulator.js";
export {
  marketingBudgetChart,
  MARKETING_PLANEJAMENTO_FIELD_IDS,
  MARKETING_PLANEJAMENTO_SECTIONS,
  marketingPlanejamentoProgress,
  type MarketingBudgetBar
} from "./marketing-workspace.js";
export {
  CANVA_API_BASE,
  CANVA_CONNECT_DOCS_URL,
  CANVA_CREATE_LINKS,
  CANVA_INTEGRATION_FIELD_IDS,
  CANVA_OAUTH_AUTHORIZE_URL,
  CANVA_OAUTH_SCOPES,
  CANVA_OAUTH_TOKEN_URL,
  formatPaletteForCanvaClipboard,
  readCanvaIntegrationStatus,
  type CanvaCreateLink,
  type CanvaIntegrationStatus
} from "./canva-integration.js";
export {
  PROJECT_WORKSPACE_FEED_RULES,
  PROJECT_WORKSPACE_VERSION,
  brandingFieldIdValid,
  workspaceFieldIdValid,
  checklistTaskIdValid,
  extractBrandingFields,
  hydrateProjectWorkspace,
  emptyProjectWorkspace,
  parseProjectWorkspaceJson,
  projectWorkspaceFeedProjections,
  projectWorkspaceNavPillarProgress,
  projectWorkspaceSummary,
  projectWorkspaceToLegacyColumns,
  resolveWorkspaceFeed,
  type OperationNavPillarId,
  type ProgressSlice,
  type ProjectWorkspaceDocument,
  type ProjectWorkspaceLegacySources
} from "./project-workspace.js";
export type { ProjectWorkspaceFeedRule } from "./project-workspace-feeds.js";
export {
  extractProductFields,
  PRODUCT_OFFER_FIELDS,
  productOfferProgress,
  productOfferSnapshot,
  type ProductOfferSnapshot
} from "./project-product-offer.js";
export {
  INTEGRATION_SECRET_FIELDS,
  integrationSecretFieldId
} from "./project-integration-fields.js";
export {
  buildLaunchLandingDocument,
  buildLaunchTemplateContext,
  getLaunchTemplateById,
  LAUNCH_TEMPLATES,
  parseEmailTemplateContent,
  renderAllLaunchTemplates,
  renderLaunchTemplate,
  type LaunchTemplateContext,
  type LaunchTemplateDef,
  type LaunchTemplateId
} from "./project-launch-templates.js";
export {
  buildHotmartProductDraft,
  buildLaunchKitExport,
  buildLeadloversBlueprint,
  type HotmartProductDraft,
  type LaunchKitExport,
  type LeadloversAutomationBlueprint
} from "./project-sync-export.js";
export {
  getMarketingDevStack,
  MARKETING_DEV_STACKS,
  marketingDevAllTaskIds,
  marketingDevTaskId,
  type MarketingDevStack,
  type MarketingDevStackId
} from "./launch-operation-marketing-dev.js";
export {
  getMarketingOperationPage,
  getMarketingProductionView,
  marketingProductionResolvedItems,
  MARKETING_PRODUCTION_VIEWS,
  type MarketingProductionView,
  type MarketingProductionViewId
} from "./launch-operation-marketing-production.js";
export {
  adjacentLaunchOperationPhase,
  getLaunchOperationPhase,
  LAUNCH_OPERATION_PHASES,
  LAUNCH_OPERATION_PILLAR_ORDER,
  LAUNCH_OPERATION_PILLARS,
  launchOperationAllTaskIds,
  launchOperationPillarProgress,
  launchOperationPhaseProgress,
  launchOperationProgress,
  parseLaunchOpCheckedJson,
  launchOperationTaskId,
  type LaunchOperationChecklistItem,
  type LaunchOperationPhase,
  type LaunchOperationPillar,
  type LaunchOperationPillarId,
  type LaunchOperationSection
} from "./launch-operation-phases.js";
export { LEGAL_NOTICES } from "./legal-notices.js";

export { AGENCY_META } from "./agency-meta.js";
export { PORTFOLIO_GITHUB, PORTFOLIO_PRODUCTION, PORTFOLIO_REPOS } from "./production-portfolio.js";
export type { PortfolioGithubItem, PortfolioProductionItem } from "./production-portfolio.js";

export function formatBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}
