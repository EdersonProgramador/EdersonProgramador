import { useEffect, useState } from "react";
import type { AuthContext, AuthUser } from "@ederson-agencia/shared";
import { isAcademyStoreCustomer } from "@ederson-agencia/shared";
import { ProfileAvatarEditor } from "../components/profile/ProfileAvatarEditor";
import { ApiError, apiPatch, type LoginResponse } from "../api";
import { useAcademySession, useAgencySession, useAuthStore } from "../stores/authStore";

const roleLabel: Record<AuthUser["role"], string> = {
  ADMIN: "Administrador",
  CLIENT: "Cliente",
  FREELANCER: "Freelancer"
};

export function UserProfilePage({ realm }: { realm: AuthContext }) {
  const agencySession = useAgencySession();
  const academySession = useAcademySession();
  const session = realm === "agency" ? agencySession : academySession;
  const patchSession = useAuthStore((s) => s.patchSession);
  const user = session?.user;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [github, setGithub] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const storeCustomer = user ? isAcademyStoreCustomer(user.company) : false;

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setPhone(user.phone ?? "");
    setCompany(storeCustomer ? "" : (user.company ?? ""));
    setGithub(user.github ?? "");
  }, [user, storeCustomer]);

  if (!user) {
    return null;
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword && newPassword !== confirmPassword) {
      setError("A confirmação da nova senha não confere.");
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, string | null | undefined> = {
        name: name.trim(),
        phone: phone.trim() || null,
        github: github.trim() || null
      };
      if (!storeCustomer) {
        payload.company = company.trim() || null;
      }
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const data = await apiPatch<LoginResponse & { message?: string }>("/auth/profile", payload);
      patchSession(realm, data);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(data.message ?? "Perfil salvo.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar o perfil.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--app-text)]">Meu perfil</h1>
        <p className="mt-2 text-sm text-[var(--app-text-muted)]">
          Atualize seus dados de contato. O e-mail de login não pode ser alterado aqui.
        </p>
      </div>

      <div className="panel p-6">
        <ProfileAvatarEditor user={user} realm={realm} />
      </div>

      <form className="panel space-y-4 p-6" onSubmit={onSubmit}>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--app-text-muted)]" htmlFor="profile-email">
            E-mail
          </label>
          <input id="profile-email" className="input opacity-80" type="email" value={user.email} disabled />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--app-text-muted)]" htmlFor="profile-role">
            Papel
          </label>
          <input id="profile-role" className="input opacity-80" value={roleLabel[user.role]} disabled />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--app-text-muted)]" htmlFor="profile-name">
            Nome completo
          </label>
          <input
            id="profile-name"
            className="input"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            autoComplete="name"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--app-text-muted)]" htmlFor="profile-phone">
            Telefone / WhatsApp
          </label>
          <input
            id="profile-phone"
            className="input"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Opcional"
            autoComplete="tel"
          />
        </div>

        {!storeCustomer ? (
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--app-text-muted)]" htmlFor="profile-company">
              Empresa
            </label>
            <input
              id="profile-company"
              className="input"
              name="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Opcional"
              autoComplete="organization"
            />
          </div>
        ) : null}

        {user.role === "FREELANCER" || user.role === "ADMIN" ? (
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--app-text-muted)]" htmlFor="profile-github">
              GitHub
            </label>
            <input
              id="profile-github"
              className="input"
              name="github"
              type="url"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="https://github.com/seu-usuario"
            />
          </div>
        ) : null}

        <hr className="border-[var(--app-border)]" />

        <p className="text-sm font-medium text-[var(--app-text)]">Alterar senha</p>
        <p className="text-xs text-[var(--app-text-muted)]">Deixe em branco se não quiser trocar a senha agora.</p>

        <input
          className="input"
          type="password"
          name="currentPassword"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Senha atual"
          autoComplete="current-password"
          minLength={newPassword ? 6 : undefined}
        />
        <input
          className="input"
          type="password"
          name="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Nova senha (mín. 6)"
          autoComplete="new-password"
          minLength={6}
        />
        <input
          className="input"
          type="password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirmar nova senha"
          autoComplete="new-password"
          minLength={6}
        />

        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-400">{success}</p> : null}

        <button type="submit" className="btn-primary w-full min-h-11" disabled={loading}>
          {loading ? "Salvando…" : "Salvar alterações"}
        </button>
      </form>
    </div>
  );
}
