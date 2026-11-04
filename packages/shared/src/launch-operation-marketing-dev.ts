/** Marketing · Desenvolvimento — trilhas técnicas do lançamento (Operação admin). */

import type { LaunchOperationChecklistItem } from "./launch-operation-phases.js";

export type MarketingDevStackId = "front-end" | "back-end" | "banco-de-dados";

export type MarketingDevStack = {
  id: MarketingDevStackId;
  navLabel: string;
  title: string;
  subtitle: string;
  items: LaunchOperationChecklistItem[];
};

export const MARKETING_DEV_STACKS: readonly MarketingDevStack[] = [
  {
    id: "front-end",
    navLabel: "Front-end",
    title: "Marketing · Desenvolvimento — Front-end",
    subtitle:
      "LPs, CPLs, página de vendas e checkout: performance, identidade de marca e pixels — prontos para pico de tráfego.",
    items: [
      {
        text: "Landing de captação responsiva (mobile-first), alinhada ao branding do evento.",
        pillars: ["marketing-tech", "branding"]
      },
      {
        text: "Páginas dos CPLs e replay com player estável e CTA claro para o próximo passo da FL.",
        pillars: ["marketing-tech", "formula"]
      },
      {
        text: "Página de vendas e checkout: UX enxuta, prova social, garantia e identidade visual High Ticket.",
        pillars: ["marketing-tech", "branding", "formula"]
      },
      {
        text: "Web Vitals e CDN: LCP/CLS ok com milhares de acessos simultâneos (PPL/PL/L).",
        pillars: ["marketing-tech"]
      },
      {
        text: "Pixels e tags (Meta, Google) + eventos de lead/view nos componentes certos.",
        pillars: ["marketing-tech"]
      }
    ]
  },
  {
    id: "back-end",
    navLabel: "Back-end",
    title: "Marketing · Desenvolvimento — Back-end",
    subtitle:
      "API, automações, integrações e filas — e-mails na caixa de entrada e funil comercial sincronizado com o portal.",
    items: [
      {
        text: "API estável (auth, leads, funil) com CORS e health check para produção.",
        pillars: ["marketing-tech"]
      },
      {
        text: "Integração e-mail marketing (webhooks/API): confirmação, lembretes de CPL e régua de vendas.",
        pillars: ["marketing-tech", "formula"]
      },
      {
        text: "Endpoints de captação (/cadastro, seed) alinhados ao funil admin e origem de lead.",
        pillars: ["marketing-tech", "formula"]
      },
      {
        text: "Checkout/gateway (PIX, Hotmart, etc.) ou stub documentado até go-live.",
        pillars: ["marketing-tech", "formula"]
      },
      {
        text: "Observabilidade: logs, alertas de erro 5xx e plano de escala no host (ex.: Render).",
        pillars: ["marketing-tech"]
      }
    ]
  },
  {
    id: "banco-de-dados",
    navLabel: "Banco de dados",
    title: "Marketing · Desenvolvimento — Banco de dados",
    subtitle: "Postgres, migrations e dados de leads/projetos/checklist FL persistidos para a operação inteira.",
    items: [
      {
        text: "Postgres em produção com migrations aplicadas (leads, funil, projetos, checklist FL).",
        pillars: ["marketing-tech"]
      },
      {
        text: "Backup/snapshot e política de retenção antes do PPL.",
        pillars: ["marketing-tech"]
      },
      {
        text: "Índices e consultas críticas (leads por status, projetos por cliente) validadas.",
        pillars: ["marketing-tech"]
      },
      {
        text: "Dados sensíveis: sem secrets no repo; env vars no servidor.",
        pillars: ["marketing-tech", "branding"]
      }
    ]
  }
] as const;

export function getMarketingDevStack(id: string): MarketingDevStack | undefined {
  return MARKETING_DEV_STACKS.find((s) => s.id === id);
}

export function marketingDevTaskId(stackId: MarketingDevStackId, itemIndex: number): string {
  return `marketing-dev:${stackId}:i${itemIndex}`;
}

export function marketingDevAllTaskIds(): string[] {
  return MARKETING_DEV_STACKS.flatMap((stack) =>
    stack.items.map((_item, index) => marketingDevTaskId(stack.id, index))
  );
}
