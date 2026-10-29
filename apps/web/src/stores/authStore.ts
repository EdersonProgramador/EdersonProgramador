import { create } from "zustand";
import type { AuthContext, AuthUser } from "@ederson-agencia/shared";
import {
  fetchAuthMe,
  getStoredToken,
  migrateLegacyAuthToken,
  setAuthToken,
  type LoginResponse
} from "../api";

type RealmSession = { user: AuthUser; token: string };

type AuthState = {
  booting: boolean;
  agency: RealmSession | null;
  academy: RealmSession | null;
  setSession: (context: AuthContext, payload: LoginResponse) => void;
  clearSession: (context?: AuthContext) => void;
  bootstrap: () => Promise<void>;
};

async function loadRealm(context: AuthContext): Promise<RealmSession | null> {
  const token = getStoredToken(context);
  if (!token) return null;
  try {
    const data = await fetchAuthMe(token);
    return { user: data.user, token };
  } catch {
    setAuthToken(context, null);
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  booting: true,
  agency: null,
  academy: null,
  setSession: (context, payload) => {
    setAuthToken(context, payload.token);
    const session = { user: payload.user, token: payload.token };
    if (context === "agency") {
      set({ agency: session, booting: false });
    } else {
      set({ academy: session, booting: false });
    }
  },
  clearSession: (context) => {
    if (!context || context === "agency") {
      setAuthToken("agency", null);
      set({ agency: null });
    }
    if (!context || context === "academy") {
      setAuthToken("academy", null);
      set({ academy: null });
    }
    set({ booting: false });
  },
  bootstrap: async () => {
    migrateLegacyAuthToken();
    const [agency, academy] = await Promise.all([loadRealm("agency"), loadRealm("academy")]);
    set({ agency, academy, booting: false });
  }
}));

/** Sessão da Agência (projetos, admin comercial). */
export function useAgencySession() {
  return useAuthStore((s) => s.agency);
}

/** Sessão da Academia (cursos matriculados). */
export function useAcademySession() {
  return useAuthStore((s) => s.academy);
}
