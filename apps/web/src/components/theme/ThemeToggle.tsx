import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "../../stores/themeStore";

type ThemeToggleProps = {
  className?: string;
  compact?: boolean;
};

export function ThemeToggle({ className = "", compact }: ThemeToggleProps) {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isDay = theme === "day";

  return (
    <button
      type="button"
      className={`theme-toggle btn-secondary inline-flex min-h-11 items-center justify-center gap-2 ${compact ? "min-w-11 p-2" : "px-3"} ${className}`}
      onClick={toggleTheme}
      aria-label={isDay ? "Ativar modo noite" : "Ativar modo dia"}
      aria-pressed={isDay}
      title={isDay ? "Modo dia" : "Modo noite"}
    >
      {isDay ? <Moon className="h-4 w-4" aria-hidden /> : <Sun className="h-4 w-4" aria-hidden />}
      {!compact ? <span className="text-xs font-semibold">{isDay ? "Noite" : "Dia"}</span> : null}
    </button>
  );
}
