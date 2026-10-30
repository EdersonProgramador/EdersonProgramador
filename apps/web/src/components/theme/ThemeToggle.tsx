import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "../../stores/themeStore";

type ThemeToggleProps = {
  className?: string;
  compact?: boolean;
  /** Barra escura (vitrine Academia) — sem .btn-secondary global */
  variant?: "default" | "chrome";
};

export function ThemeToggle({ className = "", compact, variant = "default" }: ThemeToggleProps) {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isDay = theme === "day";
  const actionLabel = isDay ? "Alternar para modo escuro" : "Alternar para modo claro";

  const styleClass =
    variant === "chrome"
      ? "theme-toggle theme-toggle--chrome inline-flex min-h-11 items-center justify-center gap-2"
      : "theme-toggle btn-secondary inline-flex min-h-11 items-center justify-center gap-2";

  return (
    <button
      type="button"
      className={`${styleClass} ${compact ? "min-w-11 p-2" : "px-3"} ${className}`}
      onClick={toggleTheme}
      aria-label={actionLabel}
      aria-pressed={!isDay}
      title={actionLabel}
    >
      {isDay ? <Moon className="h-4 w-4" aria-hidden /> : <Sun className="h-4 w-4" aria-hidden />}
      {!compact ? <span className="text-xs font-semibold">{isDay ? "Escuro" : "Claro"}</span> : null}
    </button>
  );
}
