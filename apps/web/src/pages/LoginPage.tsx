import { AuthLoginView } from "../components/auth/AuthLoginView";

/** Login único da Agência (admin, cliente, freelancer). */
export function AgencyLoginPage() {
  return (
    <AuthLoginView
      context="agency"
      variant="crm"
      allowRegister
      subtitle="Equipe, clientes e freelancers — o destino segue o seu perfil após o login."
      alternateLogin={{
        href: "/academia/entrar",
        label: "Entrar na Academia"
      }}
    />
  );
}

/** @deprecated alias — use AgencyLoginPage */
export function LoginPage() {
  return <AgencyLoginPage />;
}