import { useEffect } from "react";
import { applySiteTheme, useThemeStore } from "../../stores/themeStore";

/** Mantém `data-theme` no `<html>` alinhado ao store (ex.: após hidratação). */
export function ThemeSync() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    // Agency OS forces its own light canvas — don't fight it with night funnel theme.
    if (document.body.classList.contains("agency-os-opus-active")) {
      applySiteTheme("day");
      return;
    }
    applySiteTheme(theme);
  }, [theme]);

  return null;
}
