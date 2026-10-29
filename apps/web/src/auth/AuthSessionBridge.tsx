import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginPathForContext } from "@ederson-agencia/shared";
import { useAuthStore } from "../stores/authStore";
import { realmForSessionExpiry, setSessionExpiredHandler } from "./sessionNavigation";

/** Liga 401 da API ao fluxo de login do contexto (Agência / Academia) com URL de retorno. */
export function AuthSessionBridge() {
  const navigate = useNavigate();
  const clearSession = useAuthStore((s) => s.clearSession);

  useEffect(() => {
    setSessionExpiredHandler(({ realm, returnPath }) => {
      const context = realmForSessionExpiry(realm, returnPath);
      clearSession(context);
      navigate(loginPathForContext(context), { replace: true, state: { from: returnPath } });
    });
    return () => setSessionExpiredHandler(null);
  }, [clearSession, navigate]);

  return null;
}
