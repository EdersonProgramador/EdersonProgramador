import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost, type LoginResponse } from "../api";
import { useAuthStore } from "../stores/authStore";

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(event.currentTarget);

    try {
      if (mode === "login") {
        const data = await apiPost<LoginResponse>("/auth/login", {
          email: form.get("email"),
          password: form.get("password")
        });
        setSession(data);
        navigate(data.homePath);
        return;
      }

      const data = await apiPost<LoginResponse>("/auth/register", {
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        role: form.get("role") ?? "CLIENT",
        company: form.get("company"),
        github: form.get("github"),
        acceptTerms: form.get("acceptTerms") === "on"
      });
      setSession(data);
      navigate(data.homePath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha na autenticação.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">{mode === "login" ? "Entrar" : "Criar conta"}</h1>
        <p className="text-sm text-white/60">
          Acesse sua área para acompanhar etapas e andamento do projeto contratado.
        </p>
      </div>

      <div className="flex rounded-xl border border-white/10 p-1">
        <button
          type="button"
          className={`flex-1 rounded-lg px-3 py-2 text-sm ${mode === "login" ? "bg-white/10" : ""}`}
          onClick={() => setMode("login")}
        >
          Login
        </button>
        <button
          type="button"
          className={`flex-1 rounded-lg px-3 py-2 text-sm ${mode === "register" ? "bg-white/10" : ""}`}
          onClick={() => setMode("register")}
        >
          Cadastro
        </button>
      </div>

      <form className="panel space-y-4 p-6" onSubmit={onSubmit}>
        {mode === "register" ? (
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

        <input className="input" type="email" name="email" placeholder="E-mail" required />
        <input className="input" type="password" name="password" placeholder="Senha (mín. 6)" required minLength={6} />

        {mode === "register" ? (
          <label className="flex items-start gap-2 text-sm text-white/70">
            <input type="checkbox" name="acceptTerms" className="mt-1" required />
            Aceito os termos de uso e a política de privacidade.
          </label>
        ) : null}

        {error ? <p className="text-sm text-red-300">{error}</p> : null}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar conta"}
        </button>
      </form>

      <p className="text-center text-sm text-white/60">
        <Link to="/" className="text-blue-glow hover:underline">
          Voltar ao site
        </Link>
      </p>
    </div>
  );
}
