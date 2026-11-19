import { NavLink, Outlet, useSearchParams } from "react-router-dom";
import {
  AGENCY_APP_BASE,
  ADMIN_OPERATION_BLOCKS,
  adminComercialStepLabel,
  BRANDING_LEGACY_PATH_ALIASES,
  BRANDING_OPERATION_NAV,
  FORMULA_LEGACY_PATH_ALIASES,
  FORMULA_OPERATION_NAV,
  type AdminNavLink
} from "@ederson-agencia/shared";
import {
  Bot,
  FolderKanban,
  Home,
  LayoutTemplate,
  Monitor,
  Rocket,
  Settings2,
  type LucideIcon
} from "lucide-react";
import { AdminProcessBreadcrumb } from "./AdminProcessChrome";
import { DevelopmentPillarSidebarNav } from "./DevelopmentPillarSidebarNav";
import { PillarSidebarNav } from "./PillarSidebarNav";
import { BRANDING_SIDEBAR_ICONS, FORMULA_SIDEBAR_ICONS } from "./pillar-sidebar-icons";
import "../../styles/agency-admin.css";

const ADMIN_BASE = `${AGENCY_APP_BASE}/admin`;

const LINK_ICONS: Record<string, LucideIcon> = {
  inicio: Home,
  agentes: Bot,
  projetos: FolderKanban,
  captura: LayoutTemplate,
  nutricao: Rocket,
  vendas: LayoutTemplate,
  relacionamento: LayoutTemplate,
  branding: Monitor,
  desenvolvimento: Monitor,
  formula: Rocket,
  automacoes: Settings2,
  integracoes: Settings2,
  transacional: Settings2
};

function AdminNavLinkItem({
  link,
  end
}: {
  link: AdminNavLink;
  end?: boolean;
}) {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("project")?.trim();
  const path = link.adminPath ? `${ADMIN_BASE}/${link.adminPath}` : ADMIN_BASE;
  const toResolved = projectId ? `${path}?project=${encodeURIComponent(projectId)}` : path;
  const Icon = LINK_ICONS[link.id] ?? LayoutTemplate;
  const label = link.stepNumber ? adminComercialStepLabel(link) : link.label;

  return (
    <NavLink
      to={toResolved}
      end={end ?? !link.adminPath}
      className={({ isActive }) => `agency-admin-nav-link${isActive ? " is-active" : ""}`}
      title={link.purpose}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
      <span className="agency-admin-nav-link__text">{label}</span>
    </NavLink>
  );
}

function flatMobileLinks() {
  return ADMIN_OPERATION_BLOCKS.flatMap((block) =>
    block.links.map((link) => ({ blockId: block.id, link }))
  );
}

export function AdminOperationsLayout() {
  const mobile = flatMobileLinks();

  return (
    <div className="agency-admin-layout">
      <aside className="agency-admin-sidebar" aria-label="Menu da administração">
        <div className="agency-admin-mobile-nav lg:hidden">
          {mobile.map(({ blockId, link }) => (
            <AdminNavLinkItem key={`${blockId}-${link.id}`} link={link} />
          ))}
        </div>
        <div className="agency-admin-sidebar__panel agency-admin-sidebar__desktop-nav">
          {ADMIN_OPERATION_BLOCKS.map((block) => (
            <div key={block.id} className="mb-3 last:mb-0">
              <p className="agency-admin-sidebar__label">{block.label}</p>
              <p className="agency-admin-sidebar__purpose">{block.purpose}</p>
              <nav className="flex flex-col gap-0.5" aria-label={block.label}>
                {block.links.map((link) => (
                  <AdminNavLinkItem key={link.id} link={link} />
                ))}
              </nav>
              {block.id === "entrega" ? (
                <div className="agency-admin-sidebar__pillar-block">
                  <PillarSidebarNav
                    pillarId="branding"
                    pillarLabel="Branding · fases"
                    tone="branding"
                    sections={BRANDING_OPERATION_NAV}
                    legacyAliases={BRANDING_LEGACY_PATH_ALIASES}
                    iconById={BRANDING_SIDEBAR_ICONS}
                    defaultIcon={Monitor}
                  />
                  <DevelopmentPillarSidebarNav />
                  <PillarSidebarNav
                    pillarId="formula-lancamento"
                    pillarLabel="Fórmula · fases"
                    tone="formula"
                    sections={FORMULA_OPERATION_NAV}
                    legacyAliases={FORMULA_LEGACY_PATH_ALIASES}
                    iconById={FORMULA_SIDEBAR_ICONS}
                    defaultIcon={Monitor}
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </aside>
      <div className="agency-admin-main">
        <AdminProcessBreadcrumb />
        <Outlet />
      </div>
    </div>
  );
}

export { ADMIN_BASE };
