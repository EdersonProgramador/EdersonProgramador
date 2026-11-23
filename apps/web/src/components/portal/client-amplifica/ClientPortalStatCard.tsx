import type { LucideIcon } from "lucide-react";

type ClientPortalStatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: string;
};

export function ClientPortalStatCard({
  label,
  value,
  icon: Icon,
  accent = "#6366f1"
}: ClientPortalStatCardProps) {
  return (
    <div className="acp-stat">
      <div className="acp-stat__icon" style={{ backgroundColor: `${accent}18`, color: accent }}>
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div className="acp-stat__copy">
        <p className="acp-stat__label">{label}</p>
        <p className="acp-stat__value">{value}</p>
      </div>
    </div>
  );
}