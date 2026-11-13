import {
  Award,
  Bell,
  Bot,
  Briefcase,
  Code,
  Database,
  Filter,
  Headphones,
  Mail,
  Megaphone,
  MessageCircle,
  Phone,
  Plug,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Wallet,
  type LucideIcon
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  megaphone: Megaphone,
  "mail-cog": Settings,
  funnel: Filter,
  database: Database,
  award: Award,
  plug: Plug,
  mail: Mail,
  smartphone: Smartphone,
  "message-circle": MessageCircle,
  bell: Bell,
  headphones: Headphones,
  bot: Bot,
  wallet: Wallet,
  phone: Phone,
  "shopping-bag": ShoppingBag,
  briefcase: Briefcase,
  "shopping-cart": ShoppingCart,
  code: Code,
  voip: Phone,
  push: Bell,
  sms: Smartphone,
  whatsapp: MessageCircle
};

export function MarketingPlatformIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Mail;
  return <Icon className={className ?? "h-5 w-5"} strokeWidth={1.6} aria-hidden />;
}
