/**
 * Hub de marketing — estrutura visual e rotas (pilares Brevo-like, multi-provedor).
 */

export const MARKETING_PLATFORM_FEATURES = [
  {
    id: "campaigns",
    title: "Campanhas e automação",
    description: "Aumente as conversões com jornadas multicanal. Editor de fluxos e campanhas na agência.",
    adminPath: "marketing/campanhas",
    icon: "megaphone"
  },
  {
    id: "transactional",
    title: "Mensagens transacionais",
    description: "E-mail, SMS e WhatsApp em tempo real — SMTP, API ou provedores conectados.",
    adminPath: "marketing/transacional",
    icon: "mail-cog"
  },
  {
    id: "crm",
    title: "Gestão de vendas",
    description: "Pipeline de leads, conversão em projeto e acompanhamento comercial.",
    adminPath: "marketing/crm",
    icon: "funnel"
  },
  {
    id: "cdp",
    title: "Plataforma de dados (CDP)",
    description: "Unifique contatos, atributos e eventos para marketing mais inteligente.",
    adminPath: "marketing/cdp",
    icon: "database"
  },
  {
    id: "loyalty",
    title: "Fidelização do cliente",
    description: "Programa de recompensas e níveis ligados a projetos e compras.",
    adminPath: "marketing/fidelidade",
    icon: "award"
  },
  {
    id: "integrations",
    title: "Integrações",
    description: "Brevo, Resend, n8n, Leadlovers, gateways de pagamento e webhooks.",
    adminPath: "marketing/integracoes",
    icon: "plug"
  }
] as const;

export const MARKETING_PLATFORM_CHANNELS = [
  { id: "email", label: "E-mail", description: "Transacional e campanhas", icon: "mail" },
  { id: "sms", label: "SMS", description: "Via provedor conectado", icon: "smartphone" },
  { id: "whatsapp", label: "WhatsApp", description: "API Business / provedor", icon: "message-circle" },
  { id: "push", label: "Notificações web e push", description: "In-app + navegador", icon: "bell" },
  { id: "chat", label: "Chat ao vivo", description: "Atendimento embarcado", icon: "headphones" },
  { id: "chatbot", label: "Chatbot", description: "Fluxos automatizados", icon: "bot" },
  { id: "wallet", label: "Wallet", description: "Passes e carteiras digitais", icon: "wallet" },
  { id: "voip", label: "Telefone VoIP", description: "Chamadas integradas", icon: "phone" }
] as const;

export const MARKETING_PLATFORM_AUDIENCES = [
  {
    id: "smb",
    title: "Empreendedores e PMEs",
    description: "Crie campanhas, automatize o marketing e gerencie contatos com facilidade.",
    icon: "shopping-bag"
  },
  {
    id: "enterprise",
    title: "Médio porte e enterprise",
    description: "Onboarding, controle de dados e segurança — funil e contratos formais.",
    icon: "briefcase"
  },
  {
    id: "ecommerce",
    title: "E-commerce e varejo",
    description: "Recuperação de carrinho, ofertas personalizadas e webhooks de venda.",
    icon: "shopping-cart"
  },
  {
    id: "developers",
    title: "Desenvolvedores",
    description: "API aberta, automações, SDKs e exemplos — integre ao seu stack.",
    icon: "code"
  }
] as const;

export const MARKETING_PLATFORM_RESOURCES = [
  { id: "automacoes", label: "Editor de automações", adminPath: "automacoes" },
  { id: "funil", label: "Funil comercial", adminPath: "funil" },
  { id: "leads", label: "Leads", adminPath: "leads" },
  { id: "launch-kit", label: "Templates de e-mail", adminPath: "operacao/launch-kit" },
  { id: "api", label: "Referência de APIs de mensageria", href: "https://developers.brevo.com/docs/getting-started" },
  { id: "help", label: "Guias externos (exemplos)", href: "https://help.brevo.com/hc/pt-br" }
] as const;

export type MarketingCampaignStatus = "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "CANCELLED";

export type MarketingCampaignChannel = "email" | "sms" | "whatsapp" | "push";
