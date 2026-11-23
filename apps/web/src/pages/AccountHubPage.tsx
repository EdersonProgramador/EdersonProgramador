import { Link, Navigate } from "react-router-dom";
import {
  ACCOUNT_HUB_PATH,
  ACADEMY_APP_BASE,
  AGENCY_CRM_ACADEMY_VIEW,
  ACADEMY_PROFILE_PATH,
  ACADEMY_STORE_BASE,
  ACADEMY_VITRINE_PATH,
  AGENCY_APP_BASE,
  AGENCY_PROFILE_PATH,
  AGENCY_SYSTEM_HOME,
  agencyHomePathForRole,
  BRAND_IDENTITY,
  isAcademyInternalAdmin,
  AGENCY_OPERATION_LOGIN_PATH,
  loginPathForContext
} from "@ederson-agencia/shared";
import { BookOpen, Briefcase, GraduationCap, LayoutDashboard, LogOut } from "lucide-react";
import { getStoredToken } from "../api";
import { useAcademySession, useAgencySession, useAuthStore } from "../stores/authStore";

function readGuestFlags() {
  if (typeof sessionStorage === "undefined") {
    return { academyLoggedOut: false, agencyGuest: false };
  }
  return {
    academyLoggedOut: sessionStorage.getItem("academy_logged_out") === "1",
    agencyGuest: sessionStorage.getItem("agency_logged_out") === "1"
  };
}

type HubCard = {
  key: string;
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  primary?: boolean;
};

export function AccountHubPage() {
  const booting = useAuthStore((s) => s.booting);
  const clearSession = useAuthStore((s) => s.clearSession);
  const agency = useAgencySession();
  const academy = useAcademySession();
  const { academyLoggedOut, agencyGuest } = readGuestFlags();

  const hasAgencyToken = Boolean(getStoredToken("agency"));
  const hasAcademyToken = Boolean(getStoredToken("academy"));
  const agencyUser = agency?.user;
  const academyUser = academy?.user;

  const agencyActive =
    !booting && hasAgencyToken && Boolean(agencyUser) && !agencyGuest && (agencyUser?.authContext ?? "agency") === "agency";
  const academyActive =
    !booting &&
    hasAcademyToken &&
    Boolean(academyUser) &&
    !academyLoggedOut &&
    !agencyGuest &&
    (academyUser?.authContext ?? "academy") === "academy";

  if (booting) {
    return (
      <p className="crm-auth__subtitle text-center" role="status">
        Carregando sua conta…
      </p>
    );
  }

  if (!agencyActive && !academyActive) {
    return <Navigate to={AGENCY_OPERATION_LOGIN_PATH} replace state={{ from: ACCOUNT_HUB_PATH }} />;
  }

  const agencyCards: HubCard[] = [];
  if (agencyActive && agencyUser) {
    const home = agencyHomePathForRole(agencyUser.role);
    if (agencyUser.role === "ADMIN") {
      agencyCards.push({
        key: "crm",
        title: "CRM · Operação",
        description: "Leads, clientes, finanças e módulo Academia.",
        href: AGENCY_SYSTEM_HOME,
        icon: <LayoutDashboard className="h-5 w-5" aria-hidden />,
        primary: true
      });
    } else {
      agencyCards.push({
        key: "agency-home",
        title: agencyUser.role === "FREELANCER" ? "Área freelancer" : "Área do cliente",
        description: "Projetos, funil e acompanhamento da agência.",
        href: home,
        icon: <Briefcase className="h-5 w-5" aria-hidden />,
        primary: true
      });
    }
    agencyCards.push({
      key: "agency-profile",
      title: "Perfil · Agência",
      description: "Dados da conta operacional.",
      href: AGENCY_PROFILE_PATH,
      icon: <Briefcase className="h-5 w-5" aria-hidden />
    });
  }

  const academyCards: HubCard[] = [];
  if (academyActive && academyUser) {
    academyCards.push({
      key: "academy-courses",
      title: "Meus cursos",
      description: "Trilhas matriculadas e progresso.",
      href: ACADEMY_APP_BASE,
      icon: <GraduationCap className="h-5 w-5" aria-hidden />,
      primary: true
    });
    if (isAcademyInternalAdmin(academyUser)) {
      academyCards.push({
        key: "academy-crm",
        title: "Gestão de cursos (CRM)",
        description: "Cadastro, conteúdo e análise interna.",
        href: AGENCY_CRM_ACADEMY_VIEW,
        icon: <BookOpen className="h-5 w-5" aria-hidden />
      });
      academyCards.push({
        key: "academy-analysis",
        title: "Análise de catálogo",
        description: "Visibilidade, matrículas e prévia.",
        href: ACADEMY_VITRINE_PATH,
        icon: <BookOpen className="h-5 w-5" aria-hidden />
      });
    }
    academyCards.push({
      key: "academy-profile",
      title: "Perfil · Academia",
      description: "Conta de estudos e matrículas.",
      href: ACADEMY_PROFILE_PATH,
      icon: <GraduationCap className="h-5 w-5" aria-hidden />
    });
  }

  function logoutAgency() {
    clearSession("agency");
    try {
      sessionStorage.setItem("agency_logged_out", "1");
    } catch {
      /* ignore */
    }
  }

  function logoutAcademy() {
    clearSession("academy");
    try {
      sessionStorage.setItem("academy_logged_out", "1");
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="crm-auth crm-auth__card mx-auto w-full max-w-lg space-y-8">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">{BRAND_IDENTITY.name}</p>
        <h1 className="mt-3 text-2xl font-bold text-[var(--crm-ink)]">Minha conta</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--crm-muted)]">
          A Agência e a Academia usam a mesma identidade, com acessos separados. Escolha onde continuar.
        </p>
      </div>

      {agencyActive ? (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--crm-label)]">Agência</h2>
          <p className="text-sm text-[var(--crm-muted)]">
            {agencyUser?.name} · <span className="font-mono text-xs">{agencyUser?.email}</span>
          </p>
          <ul className="space-y-2">
            {agencyCards.map((card) => (
              <li key={card.key}>
                <a
                  href={card.href}
                  className={`flex items-start gap-3 rounded-xl border px-4 py-3 transition hover:border-indigo-200 hover:bg-indigo-50/50 ${
                    card.primary ? "border-indigo-200 bg-indigo-50/30" : "border-[var(--crm-line)] bg-white"
                  }`}
                >
                  <span className="mt-0.5 text-indigo-600">{card.icon}</span>
                  <span className="min-w-0 text-left">
                    <span className="block text-sm font-semibold text-[var(--crm-ink)]">{card.title}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-[var(--crm-muted)]">{card.description}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <button type="button" className="btn-secondary flex w-full items-center justify-center gap-2 text-sm" onClick={logoutAgency}>
            <LogOut className="h-4 w-4" aria-hidden />
            Sair da Agência
          </button>
        </section>
      ) : (
        <section className="rounded-xl border border-dashed border-[var(--crm-line)] bg-[var(--crm-field)] px-4 py-5 text-center">
          <p className="text-sm text-[var(--crm-muted)]">Sem sessão ativa na Agência.</p>
          <Link
            to={AGENCY_OPERATION_LOGIN_PATH}
            state={{ from: ACCOUNT_HUB_PATH }}
            className="mt-2 inline-block text-sm font-semibold text-indigo-600 hover:underline"
          >
            Entrar na Agência
          </Link>
        </section>
      )}

      {academyActive ? (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--crm-label)]">Academia</h2>
          <p className="text-sm text-[var(--crm-muted)]">
            {academyUser?.name} · <span className="font-mono text-xs">{academyUser?.email}</span>
          </p>
          <ul className="space-y-2">
            {academyCards.map((card) => (
              <li key={card.key}>
                <a
                  href={card.href}
                  className={`flex items-start gap-3 rounded-xl border px-4 py-3 transition hover:border-indigo-200 hover:bg-indigo-50/50 ${
                    card.primary ? "border-indigo-200 bg-indigo-50/30" : "border-[var(--crm-line)] bg-white"
                  }`}
                >
                  <span className="mt-0.5 text-indigo-600">{card.icon}</span>
                  <span className="min-w-0 text-left">
                    <span className="block text-sm font-semibold text-[var(--crm-ink)]">{card.title}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-[var(--crm-muted)]">{card.description}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <button type="button" className="btn-secondary flex w-full items-center justify-center gap-2 text-sm" onClick={logoutAcademy}>
            <LogOut className="h-4 w-4" aria-hidden />
            Sair da Academia
          </button>
        </section>
      ) : (
        <section className="rounded-xl border border-dashed border-[var(--crm-line)] bg-[var(--crm-field)] px-4 py-5 text-center">
          <p className="text-sm text-[var(--crm-muted)]">Sem sessão ativa na Academia.</p>
          <Link
            to={loginPathForContext("academy")}
            state={{ from: ACCOUNT_HUB_PATH }}
            className="mt-2 inline-block text-sm font-semibold text-indigo-600 hover:underline"
          >
            Entrar na Academia
          </Link>
        </section>
      )}

      <p className="crm-auth__footer text-center">
        <Link to={ACADEMY_STORE_BASE}>Vitrine de cursos</Link>
        {" · "}
        <Link to={AGENCY_APP_BASE}>Portal agência</Link>
      </p>
    </div>
  );
}