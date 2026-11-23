import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { AuthContext, AuthRouteState } from "@ederson-agencia/shared";
import {
  ACADEMY_STORE_BASE,
  AGENCY_CRM_BASE,
  AGENCY_SYSTEM_HOME,
  BRAND_IDENTITY,
  loginPathForContext,
  ACCOUNT_HUB_PATH,
  resolvePostLoginPath
} from "@ederson-agencia/shared";
import { Lock, LogIn, Mail, Zap } from "lucide-react";
import { ApiError, apiPost, getStoredToken, type LoginResponse } from "../../api";
import { normalizeAuthFields, warmAcademyStoreTestAccount } from "../../lib/academy-store-auth";
import { BrandLogo } from "../brand/BrandLogo";
import { useAcademySession, useAgencySession, useAuthStore } from "../../stores/authStore";
import "../../styles/crm-auth-login.css";

/** Abre o CRM com SSO embed. Se falhar, usa ?nossso=1 para o CRM mostrar login local (sem loop). */
async function assignCrmWithSso(dest: string) {
  const target = new URL(dest, window.location.origin);
  if (!target.pathname.startsWith(AGENCY_CRM_BASE)) {
    window.location.assign(dest);
    return;
  }
  let ssoOk = false;
  try {
    // Sempre same-origin HTTP do Vite (:5174). https://localhost:5174 não tem TLS → 404/SSL.
    const embedUrl = `${window.location.protocol}//${window.location.host}${AGENCY_CRM_BASE}/api/embed/session`;
    const res = await Promise.race([
      fetch(embedUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}"
      }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000))
    ]);
    if (res && "ok" in res && res.ok) {
      const data = (await res.json()) as { token?: string; user?: unknown };
      if (data.token && data.user) {
        target.searchParams.set("embedToken", data.token);
        target.searchParams.set("embedUser", JSON.stringify(data.user));
        ssoOk = true;
      }
    } else if (res && "status" in res) {
      console.warn("[SSO] embed/session falhou:", res.status, embedUrl);
    }
  } catch (err) {
    console.warn("[SSO] embed/session erro:", err);
  }
  if (!ssoOk) {
    target.searchParams.set("nossso", "1");
  }
  window.location.assign(target.pathname + target.search);
}

type AuthLoginViewProps = {
  context: AuthContext;
  allowRegister?: boolean;
  title?: string;
  subtitle?: string;
  alternateLogin?: { href: string; label: string };
  /** Tema indigo/branco da área do cliente (agência). */
  variant?: "default" | "crm";
};

export function AuthLoginView({
  context,
  allowRegister = false,
  title,
  subtitle,
  alternateLogin,
  variant = "default"
}: AuthLoginViewProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = (location.state ?? {}) as AuthRouteState;
  const fromQuery = new URLSearchParams(location.search).get("from") || undefined;
  const returnPath = routeState.from ?? fromQuery;
  const setSession = useAuthStore((s) => s.setSession);
  const agencySession = useAgencySession();
  const academySession = useAcademySession();
  const sessionForContext = context === "agency" ? agencySession : academySession;
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const isAgency = context === "agency";
  const isCrm = variant === "crm";
  const heading = title ?? (isCrm ? null : isAgency ? "Sistema da agência" : "Academia interna");
  const description =
    subtitle ??
    (isCrm
      ? null
      : isAgency
        ? "Acesso à operação e ao sistema da agência Ederson Programador."
        : "Acesso restrito a alunos matriculados. Use o e-mail cadastrado pelo administrador.");
  const crmSubtitle =
    subtitle ??
    (isAgency
      ? mode === "login"
        ? "Equipe, clientes e freelancers — o destino segue o seu perfil."
        : "Cadastro de cliente na agência"
      : "Acesse suas trilhas, acompanhe o progresso e baixe seus certificados.");

  async function goToDestination(role: LoginResponse["user"]["role"]) {
    if (!returnPath) {
      const { agency, academy } = useAuthStore.getState();
      const dualRealm =
        context === "agency"
          ? Boolean(academy?.user && getStoredToken("academy"))
          : Boolean(agency?.user && getStoredToken("agency"));
      if (dualRealm) {
        setRedirecting(true);
        navigate(ACCOUNT_HUB_PATH, { replace: true });
        return;
      }
    }

    const dest = resolvePostLoginPath(role, context, returnPath);
    const crmRoot = AGENCY_SYSTEM_HOME.split("?")[0] || "/agencia/admin/";
    // CRM é app em página cheia (sem iframe). Code Studio continua no React.
    if (context === "agency" && dest.startsWith(crmRoot.replace(/\/?$/, "")) && !dest.includes("/studio")) {
      setRedirecting(true);
      await assignCrmWithSso(dest);
      return;
    }
    navigate(dest, { replace: true });
  }

  useEffect(() => {
    if (!sessionForContext?.user || redirecting) return;
    // Após logout, não reentrar automático (agência SSO / academia).
    if (context === "agency" && sessionStorage.getItem("agency_logged_out") === "1") {
      return;
    }
    if (context === "academy" && sessionStorage.getItem("academy_logged_out") === "1") {
      return;
    }
    void goToDestination(sessionForContext.user.role);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- session/context drive redirect
  }, [sessionForContext, context, returnPath]);

  useEffect(() => {
    // Só em background — nunca no caminho crítico do login (API remota já adiciona latência).
    if (context === "academy") void warmAcademyStoreTestAccount();
  }, [context]);

  async function goAfterAuth(data: LoginResponse) {
    await goToDestination(data.user.role);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(event.currentTarget);

    try {
      if (mode === "login") {
        const { email, password } = normalizeAuthFields(form.get("email"), form.get("password"));
        sessionStorage.removeItem("agency_logged_out");
        sessionStorage.removeItem("academy_logged_out");
        const data = await apiPost<LoginResponse>("/auth/login", {
          email,
          password,
          context
        });
        setSession(context, data);
        await goAfterAuth(data);
        return;
      }

      const companyVal = form.get("company");
      const githubVal = form.get("github");
      const data = await apiPost<LoginResponse>("/auth/register", {
        name: String(form.get("name") ?? "").trim(),
        email: String(form.get("email") ?? "").trim(),
        password: String(form.get("password") ?? ""),
        role: "CLIENT",
        company: companyVal == null || String(companyVal).trim() === "" ? undefined : String(companyVal).trim(),
        github: githubVal == null ? "" : String(githubVal).trim(),
        acceptTerms: form.get("acceptTerms") === "on",
        context: "agency"
      });
      setSession("agency", data);
      goAfterAuth(data);
    } catch (err) {
      const raw = err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Falha na autenticação.";
      const hint =
        context === "academy" && err instanceof ApiError && err.status === 401
          ? " Compradores: use aluno@gmail.com / 123465 ou cadastre-se em /cursos/finalizar."
          : "";
      const safe =
        raw.length > 180 || /prisma|invocation|\.ts:\d+/i.test(raw)
          ? "Não foi possível entrar agora. Confira e-mail e senha ou tente de novo em instantes."
          : `${raw}${hint}`;
      setError(safe);
    } finally {
      setLoading(false);
    }
  }

  if (isCrm) {
    if (redirecting) {
      return (
        <div className="crm-auth">
          <div className="crm-auth__brand">
            <div className="crm-auth__mark" aria-hidden>
              <Zap className="h-7 w-7" />
            </div>
            <h1 className="crm-auth__title">
              {BRAND_IDENTITY.nameDisplay.primary}{" "}
              <span>{BRAND_IDENTITY.nameDisplay.secondary}</span>
            </h1>
            <p className="crm-auth__subtitle">Abrindo o sistema…</p>
          </div>
        </div>
      );
    }
    return (
      <div className="crm-auth">
        <div className="crm-auth__brand">
          <div className="crm-auth__mark" aria-hidden>
            <Zap className="h-7 w-7" />
          </div>
          <h1 className="crm-auth__title">
            {BRAND_IDENTITY.nameDisplay.primary}{" "}
            <span>{BRAND_IDENTITY.nameDisplay.secondary}</span>
          </h1>
          <p className={`crm-auth__subtitle${!isAgency ? " crm-auth__subtitle--sentence" : ""}`}>{crmSubtitle}</p>
        </div>

        <div className="crm-auth__card">
          {allowRegister ? (
            <div className="crm-auth__tabs" role="tablist" aria-label="Modo de acesso">
              <button
                type="button"
                role="tab"
                aria-selected={mode === "login"}
                className={`crm-auth__tab${mode === "login" ? " is-active" : ""}`}
                onClick={() => setMode("login")}
              >
                Login
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "register"}
                className={`crm-auth__tab${mode === "register" ? " is-active" : ""}`}
                onClick={() => setMode("register")}
              >
                Cadastro
              </button>
            </div>
          ) : null}

          <form className="crm-auth__form" onSubmit={onSubmit}>
            {mode === "register" && allowRegister ? (
              <>
                <div>
                  <label className="crm-auth__label" htmlFor="crm-auth-name">
                    Nome completo
                  </label>
                  <div className="crm-auth__field">
                    <span className="crm-auth__icon">
                      <LogIn size={18} aria-hidden />
                    </span>
                    <input
                      id="crm-auth-name"
                      className="crm-auth__input"
                      name="name"
                      placeholder="Seu nome"
                      required
                    />
                  </div>
                </div>
                <input type="hidden" name="role" value="CLIENT" />
              </>
            ) : null}

            <div>
              <label className="crm-auth__label" htmlFor="crm-auth-email">
                {isAgency ? "E-mail corporativo" : "E-mail da matrícula"}
              </label>
              <div className="crm-auth__field">
                <span className="crm-auth__icon">
                  <Mail size={18} aria-hidden />
                </span>
                <input
                  id="crm-auth-email"
                  className="crm-auth__input"
                  type="email"
                  name="email"
                  placeholder="seu@email.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="crm-auth__label" htmlFor="crm-auth-password">
                Senha de acesso
              </label>
              <div className="crm-auth__field">
                <span className="crm-auth__icon">
                  <Lock size={18} aria-hidden />
                </span>
                <input
                  id="crm-auth-password"
                  className="crm-auth__input"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </div>
            </div>

            {mode === "register" && allowRegister ? (
              <label className="flex items-start gap-2 text-xs font-medium text-gray-600">
                <input type="checkbox" name="acceptTerms" className="mt-0.5" required />
                Li e concordo com os Termos de Uso e a política de privacidade.
              </label>
            ) : null}

            {error ? <p className="crm-auth__error">{error}</p> : null}

            <button type="submit" className="crm-auth__submit" disabled={loading}>
              {loading ? (
                "Aguarde…"
              ) : (
                <>
                  {mode === "login"
                    ? isAgency
                      ? "Entrar no sistema"
                      : "Entrar na Academia"
                    : "Criar minha conta"}
                  <LogIn size={20} aria-hidden />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="crm-auth__footer">
          <p className="crm-auth__hint">Agência · Academia · {BRAND_IDENTITY.name}</p>
          {alternateLogin ? (
            <p>
              <Link to={alternateLogin.href} state={returnPath ? { from: returnPath } : undefined}>
                {alternateLogin.label}
              </Link>
            </p>
          ) : null}
          <p>
            <Link to={context === "academy" ? ACADEMY_STORE_BASE : "/"}>
              {context === "academy" ? "Retornar" : "Voltar ao site"}
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-4 text-center">
        <Link
          to={context === "academy" ? ACADEMY_STORE_BASE : "/"}
          className="inline-flex justify-center transition hover:opacity-90"
        >
          <BrandLogo size="md" />
        </Link>
        <h1 className="text-3xl font-bold text-[var(--app-text)]">
          {mode === "login" ? heading : "Criar conta — Agência"}
        </h1>
        <p className="text-sm text-[var(--app-text-muted)]">{description}</p>
      </div>

      {allowRegister ? (
        <div className="flex rounded-xl border border-[var(--app-border)] p-1">
          <button
            type="button"
            className={`flex-1 rounded-lg px-3 py-2 text-sm ${mode === "login" ? "bg-[var(--app-hover)]" : ""}`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`flex-1 rounded-lg px-3 py-2 text-sm ${mode === "register" ? "bg-[var(--app-hover)]" : ""}`}
            onClick={() => setMode("register")}
          >
            Cadastro
          </button>
        </div>
      ) : null}

      <form className="panel space-y-4 p-6" onSubmit={onSubmit}>
        {mode === "register" && allowRegister ? (
          <>
            <input className="input" name="name" placeholder="Nome completo" required />
            <input type="hidden" name="role" value="CLIENT" />
            <input className="input" name="company" placeholder="Empresa (opcional)" />
            <input className="input" name="github" placeholder="GitHub (opcional)" />
          </>
        ) : null}

        <input className="input" type="email" name="email" placeholder="E-mail" required autoComplete="email" />
        <input
          className="input"
          type="password"
          name="password"
          placeholder="Senha (mín. 6)"
          required
          minLength={6}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />

        {mode === "register" && allowRegister ? (
          <label className="flex items-start gap-2 text-sm text-[var(--app-text-muted)]">
            <input type="checkbox" name="acceptTerms" className="mt-1" required />
            Aceito os termos de uso e a política de privacidade.
          </label>
        ) : null}

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar conta"}
        </button>
      </form>

      <div className="space-y-2 text-center text-sm text-[var(--app-text-muted)]">
        {alternateLogin ? (
          <p>
            <Link
              to={alternateLogin.href}
              state={returnPath ? { from: returnPath } : undefined}
              className="text-brand-primary hover:underline"
            >
              {alternateLogin.label}
            </Link>
          </p>
        ) : null}
        <p>
          <Link
            to={context === "academy" ? ACADEMY_STORE_BASE : "/"}
            className="text-brand-primary hover:underline"
          >
            {context === "academy" ? "Retornar" : "Voltar ao site"}
          </Link>
        </p>
        {!allowRegister && mode === "login" ? (
          <p className="text-xs text-[var(--app-text-subtle)]">
            Sem matrícula?{" "}
            <Link to={loginPathForContext("agency")} className="underline">
              Contato comercial
            </Link>{" "}
            ou fale com o administrador.
          </p>
        ) : null}
      </div>
    </div>
  );
}
