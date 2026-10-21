import { create } from "zustand";
import type { AuthUser } from "@ederson-agencia/shared";
import { apiGet, setAuthToken, type LoginResponse } from "../api";

type AuthState = {
  booting: boolean;
  user: AuthUser | null;
  token: string | null;
  error: string | null;
  setSession: (payload: LoginResponse) => void;
  clearSession: () => void;
  bootstrap: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  booting: true,
  user: null,
  token: localStorage.getItem("ea_token"),
  error: null,
  setSession: (payload) => {
    setAuthToken(payload.token);
    set({ user: payload.user, token: payload.token, error: null, booting: false });
  },
  clearSession: () => {
    setAuthToken(null);
    set({ user: null, token: null, error: null, booting: false });
  },
  bootstrap: async () => {
    const token = localStorage.getItem("ea_token");
    if (!token) {
      set({ booting: false, user: null, token: null });
      return;
    }
    try {
      setAuthToken(token);
      const data = await apiGet<{ user: AuthUser }>("/auth/me");
      set({ user: data.user, token, booting: false, error: null });
    } catch {
      setAuthToken(null);
      set({ user: null, token: null, booting: false });
    }
  }
}));
