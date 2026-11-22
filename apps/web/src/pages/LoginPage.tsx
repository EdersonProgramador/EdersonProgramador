import { AuthLoginView } from "../components/auth/AuthLoginView";

/** Login principal — Amplifica CRM / Agência. */
export function AgencyLoginPage() {
  return (
    <AuthLoginView
      context="agency"
      variant="crm"
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
