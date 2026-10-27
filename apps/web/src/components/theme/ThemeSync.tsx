import { useEffect } from "react";
import { applySiteTheme, useThemeStore } from "../../stores/themeStore";

/** Mantém `data-theme` no `<html>` alinhado ao store (ex.: após hidratação). */
export function ThemeSync() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    applySiteTheme(theme);
  }, [theme]);

  return null;
}
