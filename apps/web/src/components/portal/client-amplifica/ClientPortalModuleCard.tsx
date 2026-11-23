import { Link } from "react-router-dom";
import { ArrowRight, type LucideIcon } from "lucide-react";

type ClientPortalModuleCardProps = {
  to: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export function ClientPortalModuleCard({ to, title, description, icon: Icon }: ClientPortalModuleCardProps) {
  return (
    <Link to={to} className="acp-module">
      <span className="acp-module__icon" aria-hidden>
        <Icon className="h-6 w-6" />
      </span>
      <h2 className="acp-module__title">{title}</h2>
      <p className="acp-module__desc">{description}</p>
      <span className="acp-module__cta">
        Acessar
        <ArrowRight className="h-4 w-4" aria-hidden />
      </span>
    </Link>
  );
}