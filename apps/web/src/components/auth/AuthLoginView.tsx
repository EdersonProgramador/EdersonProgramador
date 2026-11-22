import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { AuthContext, AuthRouteState } from "@ederson-agencia/shared";
import { ACADEMY_STORE_BASE, loginPathForContext, resolvePostLoginPath } from "@ederson-agencia/shared";
import { Lock, LogIn, Mail, Zap } from "lucide-react";
import { ApiError, apiPost, type LoginResponse } from "../../api";
import { normalizeAuthFields, warmAcademyStoreTestAccount } from "../../lib/academy-store-auth";
import { BrandLogo } from "../brand/BrandLogo";
import { useAcademySession, useAgencySession, useAuthStore } from "../../stores/authStore";
import "../../styles/crm-auth-login.css";

type AuthLoginViewProps = {
  context: AuthContext;
  allowRegister?: boolean;
  title?: string;
  subtitle?: string;
  alternateLogin?: { href: string; label: string };
  /** Amplifica CRM visual theme (agency admin entry). */
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
  const returnPath = routeState.from;
  const setSession = useAuthStore((s) => s.setSession);
  const agencySession = useAgencySession();
  const academySession = useAcademySession();
  const sessionForContext = context === "agency" ? agencySession : academySession;
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isAgency = context === "agency";
  const isCrm = variant === "crm" && isAgency;
  const heading = title ?? (isCrm ? null : isAgency ? "Área do cliente — Agência" : "Academia interna");
  const description =
    subtitle ??
    (isCrm
      ? null
      : isAgency
        ? "Acompanhe pacotes, etapas e entregas do seu projeto contratado."
        : "Acesso restrito a alunos matriculados. Use o e-mail cadastrado pelo administrador.");

  useEffect(() => {
    if (!sessionForContext?.user) return;
    navigate(resolvePostLoginPath(sessionForContext.user.role, context, returnPath), { replace: true });
  }, [sessionForContext, context, navigate, returnPath]);

  useEffect(() => {
    if (context === "academy") void warmAcademyStoreTestAccount();
  }, [context]);

  function goAfterAuth(data: LoginResponse) {
    navigate(resolvePostLoginPath(data.user.role, context, returnPath), { replace: true });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(event.currentTarget);

    try {
      if (mode === "login") {
        const { email, password } = normalizeAuthFields(form.get("email"), form.get("password"));
        if (context === "academy") await warmAcademyStoreTestAccount();
        const data = await apiPost<LoginResponse>("/auth/login", {
          email,
          password,
          context
        });
        setSession(context, data);
        goAfterAuth(data);
        return;
      }

      const data = await apiPost<LoginResponse>("/auth/register", {
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        role: form.get("role") ?? "CLIENT",
        company: form.get("company"),
        github: form.get("github"),
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
    return (
      <div className="crm-auth">
        <div className="crm-auth__brand">
          <div className="crm-auth__mark" aria-hidden>
            <Zap className="h-7 w-7" />
          </div>
          <h1 className="crm-auth__title">
            Amplifica <span>CRM</span>
          </h1>
          <p className="crm-auth__subtitle">
            {mode === "login" ? "Autenticação de usuário" : "Novo registro"}
          </p>
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
                E-mail corporativo
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
                  {mode === "login" ? "Entrar no Sistema" : "Criar minha conta"}
                  <LogIn size={20} aria-hidden />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="crm-auth__footer">
          {alternateLogin ? (
            <p>
              <Link to={alternateLogin.href} state={returnPath ? { from: returnPath } : undefined}>
                {alternateLogin.label}
              </Link>
            </p>
          ) : null}
          <p>
            <Link to="/">Voltar ao site</Link>
          </p>
          <p className="crm-auth__hint">Acesso à operação Amplifica CRM</p>
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
            <select className="input" name="role" defaultValue="CLIENT">
              <option value="CLIENT">Sou cliente</option>
              <option value="FREELANCER">Sou freelancer</option>
            </select>
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
          <Link to="/" className="text-brand-primary hover:underline">
            Voltar ao site
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
