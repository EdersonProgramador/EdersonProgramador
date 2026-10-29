import { AuthLoginView } from "../components/auth/AuthLoginView";

/** Login principal — Agência (projetos, pacotes, operação). */
export function AgencyLoginPage() {
  return (
    <AuthLoginView
      context="agency"
      allowRegister
      alternateLogin={{
        href: "/academia/entrar",
        label: "Sou aluno — entrar na Academia"
      }}
    />
  );
}

/** @deprecated alias — use AgencyLoginPage */
export function LoginPage() {
  return <AgencyLoginPage />;
}
