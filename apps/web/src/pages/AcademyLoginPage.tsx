import { AuthLoginView } from "../components/auth/AuthLoginView";

/** Login interno — Academia (cursos matriculados). */
export function AcademyLoginPage() {
  return (
    <AuthLoginView
      context="academy"
      allowRegister={false}
      alternateLogin={{
        href: "/login",
        label: "Sou cliente — entrar na Agência"
      }}
    />
  );
}
