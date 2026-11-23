import { AuthLoginView } from "../components/auth/AuthLoginView";

/** Login interno — Academia (cursos matriculados). */
export function AcademyLoginPage() {
  return (
    <AuthLoginView
      context="academy"
      variant="crm"
      allowRegister={false}
      subtitle="Acesse suas trilhas, acompanhe o progresso e baixe seus certificados."
    />
  );
}