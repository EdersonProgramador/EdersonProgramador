/** Playbook operacional — Fórmula de Lançamento (6 fases) no admin da agência. */

export type LaunchOperationSection = {
  heading: string;
  items: string[];
};

export type LaunchOperationPhase = {
  id: string;
  order: number;
  emoji: string;
  navLabel: string;
  title: string;
  subtitle: string;
  sections: LaunchOperationSection[];
  relatedAdminPaths?: { label: string; pathSuffix: string }[];
};

export const LAUNCH_OPERATION_PHASES: readonly LaunchOperationPhase[] = [
  {
    id: "fase-1",
    order: 1,
    emoji: "🎯",
    navLabel: "Fase 1 — Fundação",
    title: "Fase 1: Fundação, posicionamento e estratégia do lançamento",
    subtitle:
      "Branding, planejamento de marketing e arquitetura do lançamento — produto, oferta irrecusável e desenho do funil.",
    sections: [
      {
        heading: "Alinhamento e diagnóstico da marca",
        items: [
          "Entrevistas de imersão para extrair a história do especialista ou da empresa.",
          "Definir propósito, missão, visão e valores (branding)."
        ]
      },
      {
        heading: "Persona e transformação",
        items: [
          "Mapear dores e desejos do avatar.",
          "Formular a promessa: qual transformação o produto ou infoproduto gera?"
        ]
      },
      {
        heading: "Arquitetura do produto e oferta",
        items: [
          "Estruturar o que será vendido (curso, mentoria, software, comunidade).",
          "Definir preço, bônus exclusivos, ancoragem de preço e garantias."
        ]
      },
      {
        heading: "Tipo de lançamento",
        items: [
          "Decidir se o primeiro tiro será Lançamento Semente (validar oferta antes de gravar) ou Lançamento Interno (base já validada)."
        ]
      },
      {
        heading: "Desenho do funil de lançamento",
        items: [
          "Mapear a jornada do lead: anúncio de captação até página de obrigado.",
          "Planejar grupos de WhatsApp, CPLs (conteúdos pré-lançamento) e página de vendas."
        ]
      }
    ],
    relatedAdminPaths: [{ label: "Funil comercial", pathSuffix: "funil" }]
  },
  {
    id: "fase-2",
    order: 2,
    emoji: "🎨",
    navLabel: "Fase 2 — Identidade",
    title: "Fase 2: Identidade, conceito verbal e linha editorial teaser",
    subtitle: "A marca ganha forma visual e o conteúdo orgânico prepara o terreno antes do evento.",
    sections: [
      {
        heading: "Identidade visual e verbal",
        items: [
          "Logotipo, paleta, tipografias e manifesto da marca.",
          "Identidade visual do evento de lançamento (ex.: “Semana da Evolução Digital”)."
        ]
      },
      {
        heading: "Palavras-chave e SEO inicial",
        items: ["Mapear termos relacionados à promessa para blog, YouTube e conteúdos."]
      },
      {
        heading: "Aquecimento orgânico",
        items: [
          "Produzir conteúdo de topo e meio de funil nas redes.",
          "Gerar autoridade, quebrar objeções iniciais e aumentar engajamento antes do evento."
        ]
      }
    ]
  },
  {
    id: "fase-3",
    order: 3,
    emoji: "💻",
    navLabel: "Fase 3 — Infra PPL",
    title: "Fase 3: Infraestrutura digital, automação e tráfego de captação (PPL)",
    subtitle: "Pré-pré-lançamento: ativos digitais, automação, pixels e tráfego para captar leads.",
    sections: [
      {
        heading: "Ativos do lançamento",
        items: [
          "Landing page de captação (inscrição no evento).",
          "Páginas dos CPLs/aulas e página de vendas final."
        ]
      },
      {
        heading: "Automação de inbound",
        items: [
          "Integrar e-mail marketing (RD Station, ActiveCampaign ou similar).",
          "Fluxos: confirmação de inscrição, alertas de aulas e direcionamento a grupos VIP de WhatsApp."
        ]
      },
      {
        heading: "Rastreamento",
        items: [
          "Pixels e tags (Meta, Google) em todas as páginas.",
          "Criar públicos de remarketing a partir de inscritos."
        ]
      },
      {
        heading: "Tráfego pago — captação (PPL)",
        items: [
          "Campanhas Meta Ads e Google Ads para o evento gratuito.",
          "Otimizar custo por lead (CPL)."
        ]
      }
    ],
    relatedAdminPaths: [
      { label: "Funil comercial", pathSuffix: "funil" },
      { label: "Leads", pathSuffix: "leads" }
    ]
  },
  {
    id: "fase-4",
    order: 4,
    emoji: "⚙️",
    navLabel: "Fase 4 — Pré-lançamento",
    title: "Fase 4: Pré-lançamento (PL) — gatilhos mentais",
    subtitle: "Entrega dos CPLs estratégicos, tráfego de consumo e nutrição da comunidade.",
    sections: [
      {
        heading: "Execução dos CPLs",
        items: [
          "CPL 1 — A oportunidade: problema ou oportunidade que o lead não via; urgência.",
          "CPL 2 — A transformação/atalho: resultado é possível; ganho prático; eliminar caminhos errados.",
          "CPL 3 — O evento/a virada: o “como”; comunidade; plot twist antes da abertura de vagas."
        ]
      },
      {
        heading: "Tráfego pago — consumo",
        items: ['Anúncios para quem se inscreveu assistir (“Aula 1 no ar”, “Não perca o CPL 2”).']
      },
      {
        heading: "Nutrição e comunidade",
        items: [
          "E-mails e WhatsApp diários com resumos, iscas e PDFs.",
          "Gestão de grupos (Facebook/WhatsApp) para depoimentos e prova social."
        ]
      }
    ],
    relatedAdminPaths: [{ label: "Funil comercial (live)", pathSuffix: "funil" }]
  },
  {
    id: "fase-5",
    order: 5,
    emoji: "🚀",
    navLabel: "Fase 5 — Lançamento",
    title: "Fase 5: Lançamento (L) — carrinho e oferta irrecusável",
    subtitle: "Abertura de vagas, checkout, tráfego de conversão e inbound de vendas.",
    sections: [
      {
        heading: "CPL 4 / live de abertura",
        items: [
          "Roteiro FL: produto, preço, bônus para primeiros compradores (escassez) e abertura oficial."
        ]
      },
      {
        heading: "Página de vendas e checkout",
        items: [
          "Liberar vendas integradas ao gateway (Hotmart, Kiwify, Eduzz, PIX no funil, etc.).",
          "UX do checkout para reduzir desistência."
        ]
      },
      {
        heading: "Tráfego pago — vendas",
        items: [
          "Público geral: “Inscrições abertas”.",
          "Remarketing: garantia, acesso imediato, iniciantes, contagem regressiva e últimas vagas."
        ]
      },
      {
        heading: "Inbound de vendas",
        items: [
          "Régua de escassez, bônus expirando, depoimentos e suporte chat/WhatsApp.",
          "Recuperação de carrinhos abandonados."
        ]
      }
    ],
    relatedAdminPaths: [
      { label: "Funil comercial", pathSuffix: "funil" },
      { label: "Projetos", pathSuffix: "projetos" }
    ]
  },
  {
    id: "fase-6",
    order: 6,
    emoji: "📊",
    navLabel: "Fase 6 — Pós-lançamento",
    title: "Fase 6: Pós-lançamento, fechamento e debriefing",
    subtitle: "Escassez real, onboarding, métricas e transição para perpetuo ou SEO.",
    sections: [
      {
        heading: "Fechamento de carrinho",
        items: ["Encerrar inscrições no horário prometido; reforçar integridade da marca."]
      },
      {
        heading: "Onboarding e entrega",
        items: [
          "Fluxo de boas-vindas para novos alunos.",
          "Acelerar consumo do produto e reduzir churn/reembolso."
        ]
      },
      {
        heading: "Debriefing",
        items: [
          "Analisar ROI, ROAS, CPL, taxa de conversão da página de vendas e faturamento.",
          "Reunião estratégica para o próximo ciclo."
        ]
      },
      {
        heading: "Perpetuo e SEO",
        items: [
          "Leads que não compraram seguem na base com conteúdo orgânico e SEO até o próximo lançamento."
        ]
      }
    ],
    relatedAdminPaths: [{ label: "Clientes", pathSuffix: "clientes" }]
  }
] as const;

export function getLaunchOperationPhase(id: string): LaunchOperationPhase | undefined {
  return LAUNCH_OPERATION_PHASES.find((p) => p.id === id);
}

export function launchOperationTaskId(phaseId: string, sectionIndex: number, itemIndex: number): string {
  return `${phaseId}:s${sectionIndex}:i${itemIndex}`;
}

export function parseLaunchOpCheckedJson(value: unknown): Record<string, boolean> {
  if (value === null || value === undefined) return {};
  if (typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, boolean> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (typeof val === "boolean") out[key] = val;
  }
  return out;
}

export function launchOperationAllTaskIds(): string[] {
  return LAUNCH_OPERATION_PHASES.flatMap((phase) =>
    phase.sections.flatMap((section, sectionIndex) =>
      section.items.map((_item, itemIndex) => launchOperationTaskId(phase.id, sectionIndex, itemIndex))
    )
  );
}

export function launchOperationProgress(checked: Record<string, boolean>): {
  total: number;
  done: number;
  percent: number;
} {
  const ids = launchOperationAllTaskIds();
  const done = ids.filter((id) => checked[id]).length;
  const total = ids.length;
  return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export function launchOperationPhaseProgress(
  phase: LaunchOperationPhase,
  checked: Record<string, boolean>
): { total: number; done: number; percent: number } {
  let total = 0;
  let done = 0;
  phase.sections.forEach((section, sectionIndex) => {
    section.items.forEach((_item, itemIndex) => {
      total += 1;
      const id = launchOperationTaskId(phase.id, sectionIndex, itemIndex);
      if (checked[id]) done += 1;
    });
  });
  return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}
