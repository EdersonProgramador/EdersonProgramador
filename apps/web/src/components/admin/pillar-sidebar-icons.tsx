import {
  BarChart3,
  BookOpen,
  Building2,
  ClipboardList,
  Code2,
  Database,
  GitBranch,
  LineChart,
  MessageSquare,
  Monitor,
  Package,
  Palette,
  Pencil,
  Radio,
  Rocket,
  Scale,
  Server,
  Sparkles,
  Target,
  Workflow,
  type LucideIcon
} from "lucide-react";

export const MARKETING_SIDEBAR_ICONS: Record<string, LucideIcon> = {
  estatistica: BarChart3,
  sequencia: Workflow,
  automacoes: Radio,
  historico: ClipboardList,
  paginas: Monitor,
  formularios: ClipboardList,
  popups: Monitor,
  contatos: Target,
  "contas-envio": Radio,
  ajustes: Package
};

export const BRANDING_SIDEBAR_ICONS: Record<string, LucideIcon> = {
  estatistica: BarChart3,
  processo: BookOpen,
  alinhamento: ClipboardList,
  diagnostico: GitBranch,
  estrategia: Target,
  plataforma: Sparkles,
  arquitetura: Building2,
  naming: Pencil,
  "identidade-verbal": MessageSquare,
  "identidade-visual": Palette,
  experiencia: Monitor,
  implementacao: Package,
  governanca: Scale,
  medicao: LineChart,
  brandbook: BookOpen
};

export const DEVELOPMENT_SIDEBAR_ICONS: Record<string, LucideIcon> = {
  "stack-visao": Monitor,
  "stack-front-end": Monitor,
  "stack-back-end": Workflow,
  "stack-dados": Database,
  "stack-infra": Server,
  "stack-automacao": Workflow,
  "stack-pagamentos": Target,
  "stack-email": Radio,
  editor: Code2,
  estatistica: BarChart3,
  "front-end": Monitor,
  "back-end": Workflow,
  "banco-de-dados": Database,
  infra: Server
};

export const FORMULA_SIDEBAR_ICONS: Record<string, LucideIcon> = {
  estatistica: BarChart3,
  fundacao: Target,
  teaser: Palette,
  pl: Radio,
  lancamento: Rocket,
  "pos-lancamento": BarChart3
};
