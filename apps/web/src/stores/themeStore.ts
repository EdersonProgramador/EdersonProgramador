import { create } from "zustand";

export type SiteTheme = "day" | "night";

const STORAGE_KEY = "ea_theme";

export function readStoredTheme(): SiteTheme {
  if (typeof window === "undefined") return "night";
  return localStorage.getItem(STORAGE_KEY) === "day" ? "day" : "night";
}

export function applySiteTheme(theme: SiteTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme === "day" ? "light" : "dark";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "day" ? "#f1f5f9" : "#020617");
}

type ThemeState = {
  theme: SiteTheme;
  setTheme: (theme: SiteTheme) => void;
  toggleTheme: () => void;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: readStoredTheme(),
  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEY, theme);
    applySiteTheme(theme);
    set({ theme });
  },
  toggleTheme: () => {
    const next = get().theme === "day" ? "night" : "day";
    get().setTheme(next);
  }
}));
