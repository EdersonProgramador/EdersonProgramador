/** Playbook operacional — 6 fases FL encaixadas nos Três Pilares (admin da agência). */

import { MARKETING_DEV_STACKS, marketingDevAllTaskIds, marketingDevTaskId } from "./launch-operation-marketing-dev.js";

export type LaunchOperationPillarId = "branding" | "marketing-tech" | "formula";

export type LaunchOperationPillar = {
  id: LaunchOperationPillarId;
  shortLabel: string;
  title: string;
  description: string;
};

export const LAUNCH_OPERATION_PILLARS: Record<LaunchOperationPillarId, LaunchOperationPillar> = {
  branding: {
    id: "branding",
    shortLabel: "Branding",
    title: "Pilar Branding",
    description:
      "Quando o especialista abrir a boca no CPL 1, o público precisa sentir autoridade confiável e íntegra — base para cobrar High Ticket com legitimidade."
  },
  "marketing-tech": {
    id: "marketing-tech",
    shortLabel: "Marketing & Tech",
    title: "Pilar Marketing Digital e Tecnologia",
    description:
      "Suporte operacional: site estável sob pico de tráfego, e-mails na caixa de entrada (não no spam) e mídia paga encontrando o avatar certo."
  },
  formula: {
    id: "formula",
    shortLabel: "Fórmula de Lançamento",
    title: "Pilar Fórmula de Lançamento",
    description:
      "Ritmo psicológico e roteiro persuasivo (CPLs, escassez, abertura de carrinho) que gera o pico de faturamento para financiar o crescimento contínuo."
  }
};

export const LAUNCH_OPERATION_PILLAR_ORDER: LaunchOperationPillarId[] = ["branding", "marketing-tech", "formula"];

export type LaunchOperationChecklistItem = {
  text: string;
  pillars: LaunchOperationPillarId[];
};

export type LaunchOperationSection = {
  heading: string;
  primaryPillar: LaunchOperationPillarId;
  items: LaunchOperationChecklistItem[];
};

export type LaunchOperationPhase = {
  id: string;
  order: number;
  emoji: string;
  navLabel: string;
  title: string;
  subtitle: string;
  /** Pilares dominantes nesta fase (encaixe estratégico). */
  pillarFocus: LaunchOperationPillarId[];
  pillarBridge: string;
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
      "O encontro dos três pilares: marca (autoridade), oferta FL (promessa e funil) e desenho técnico da jornada rastreável.",
    pillarFocus: ["branding", "formula", "marketing-tech"],
    pillarBridge:
      "Branding define quem fala; a Fórmula define o que vender e em que ordem; Marketing & Tech desenham como o lead percorre do anúncio ao obrigado.",
    sections: [
      {
        heading: "Alinhamento e diagnóstico da marca",
        primaryPillar: "branding",
        items: [
          {
            text: "Entrevistas de imersão para extrair a história do especialista ou da empresa (voz autêntica para o CPL 1).",
            pillars: ["branding"]
          },
          {
            text: "Definir propósito, missão, visão e valores — critérios de integridade para promessas e preço premium.",
            pillars: ["branding"]
          }
        ]
      },
      {
        heading: "Persona e transformação",
        primaryPillar: "branding",
        items: [
          {
            text: "Mapear dores e desejos do avatar (linguagem que o tráfego e os CPLs vão espelhar).",
            pillars: ["branding", "marketing-tech"]
          },
          {
            text: "Formular a promessa FL: qual transformação gera reciprocidade e justifica High Ticket?",
            pillars: ["branding", "formula"]
          }
        ]
      },
      {
        heading: "Arquitetura do produto e oferta",
        primaryPillar: "formula",
        items: [
          {
            text: "Estruturar o produto (curso, mentoria, software, comunidade) alinhado à autoridade da marca.",
            pillars: ["branding", "formula"]
          },
          {
            text: "Preço, bônus, ancoragem e garantias — roteiro de valor da abertura de carrinho.",
            pillars: ["formula", "branding"]
          }
        ]
      },
      {
        heading: "Tipo de lançamento",
        primaryPillar: "formula",
        items: [
          {
            text: "Lançamento Semente (validar antes de gravar) ou Interno (base validada) — ritmo FL adequado ao estágio.",
            pillars: ["formula"]
          }
        ]
      },
      {
        heading: "Desenho do funil de lançamento",
        primaryPillar: "marketing-tech",
        items: [
          {
            text: "Jornada do lead: captação → obrigado → grupos → CPLs → vendas (mapa para páginas e automação).",
            pillars: ["marketing-tech", "formula"]
          },
          {
            text: "Pontos de rastreamento (pixels, UTMs) previstos desde o desenho — remarketing e públicos quentes.",
            pillars: ["marketing-tech"]
          }
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
    subtitle: "Branding visível + conteúdo orgânico que aquece antes do PPL — autoridade antes do microfone ligado.",
    pillarFocus: ["branding", "marketing-tech"],
    pillarBridge:
      "Branding materializa confiança (visual + manifesto); Marketing & Tech distribui teaser e SEO para o avatar certo encontrar a marca.",
    sections: [
      {
        heading: "Identidade visual e verbal",
        primaryPillar: "branding",
        items: [
          {
            text: "Logotipo, paleta, tipografias e manifesto — coerência em LP, CPLs e checkout (High Ticket exige polish).",
            pillars: ["branding", "marketing-tech"]
          },
          {
            text: "Identidade do evento de lançamento (ex.: “Semana da Evolução Digital”) alinhada ao roteiro FL.",
            pillars: ["branding", "formula"]
          }
        ]
      },
      {
        heading: "Palavras-chave e SEO inicial",
        primaryPillar: "marketing-tech",
        items: [
          {
            text: "Mapear termos da promessa para blog/YouTube — tráfego orgânico e remarketing futuro mais baratos.",
            pillars: ["marketing-tech", "branding"]
          }
        ]
      },
      {
        heading: "Aquecimento orgânico",
        primaryPillar: "branding",
        items: [
          {
            text: "Conteúdo topo/meio de funil: quebrar objeções e provar autoridade antes do CPL 1.",
            pillars: ["branding", "formula"]
          },
          {
            text: "Calendário editorial integrado às datas do evento (ritmo FL no orgânico).",
            pillars: ["formula", "marketing-tech"]
          }
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
    subtitle: "Marketing & Tech em produção: páginas que aguentam pico, e-mails que entregam, tráfego que captura.",
    pillarFocus: ["marketing-tech", "formula"],
    pillarBridge:
      "Tecnologia e mídia sustentam o PPL; Branding aparece na consistência visual das LPs; a FL marca o timing da captação em massa.",
    sections: [
      {
        heading: "Ativos do lançamento",
        primaryPillar: "marketing-tech",
        items: [
          {
            text: "Landing de captação responsiva, rápida e com identidade de marca (CDN/hosting para milhares de acessos).",
            pillars: ["marketing-tech", "branding"]
          },
          {
            text: "Páginas dos CPLs e página de vendas (estrutura FL pronta antes do PL).",
            pillars: ["marketing-tech", "formula"]
          }
        ]
      },
      {
        heading: "Automação de inbound",
        primaryPillar: "marketing-tech",
        items: [
          {
            text: "E-mail marketing (RD Station, ActiveCampaign, etc.) com SPF/DKIM/DMARC revisados — caixa de entrada, não spam.",
            pillars: ["marketing-tech"]
          },
          {
            text: "Fluxos: confirmação, lembretes de aula e direcionamento a grupos VIP (ritmo FL automatizado).",
            pillars: ["marketing-tech", "formula"]
          }
        ]
      },
      {
        heading: "Rastreamento",
        primaryPillar: "marketing-tech",
        items: [
          {
            text: "Pixels e tags (Meta, Google) em todas as páginas; eventos de lead e view content.",
            pillars: ["marketing-tech"]
          },
          {
            text: "Públicos de remarketing a partir de inscritos (base para fases 4 e 5).",
            pillars: ["marketing-tech", "formula"]
          }
        ]
      },
      {
        heading: "Tráfego pago — captação (PPL)",
        primaryPillar: "marketing-tech",
        items: [
          {
            text: "Campanhas Meta/Google com criativos alinhados ao branding e copy da promessa FL.",
            pillars: ["marketing-tech", "branding", "formula"]
          },
          {
            text: "Otimizar CPL: segmentação do avatar, não só volume (pessoas certas na lista).",
            pillars: ["marketing-tech", "branding"]
          }
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
    subtitle: "Coração da FL: CPLs no ritmo psicológico, com marca forte no CPL 1 e tech garantindo consumo.",
    pillarFocus: ["formula", "branding", "marketing-tech"],
    pillarBridge:
      "Branding faz o especialista soar íntegro no CPL 1; a FL conduz oportunidade → transformação → virada; Tech empurra consumo (e-mail, ads, grupos).",
    sections: [
      {
        heading: "Execução dos CPLs",
        primaryPillar: "formula",
        items: [
          {
            text: "CPL 1 — Oportunidade: problema/oportunidade + autoridade de marca (tom confiável, High Ticket).",
            pillars: ["formula", "branding"]
          },
          {
            text: "CPL 2 — Transformação/atalho: prova de que o resultado é possível; eliminar caminhos errados.",
            pillars: ["formula", "branding"]
          },
          {
            text: "CPL 3 — Virada: o “como”, comunidade, plot twist antes da abertura de vagas.",
            pillars: ["formula"]
          }
        ]
      },
      {
        heading: "Tráfego pago — consumo",
        primaryPillar: "marketing-tech",
        items: [
          {
            text: "Anúncios para inscritos assistirem (“Aula 1 no ar”, “Não perca o CPL 2”) — infra aguentando pico.",
            pillars: ["marketing-tech", "formula"]
          }
        ]
      },
      {
        heading: "Nutrição e comunidade",
        primaryPillar: "formula",
        items: [
          {
            text: "E-mails e WhatsApp diários (resumos, PDFs) — reciprocidade e prova social alinhadas à marca.",
            pillars: ["formula", "branding", "marketing-tech"]
          },
          {
            text: "Moderação de grupos para depoimentos e engajamento (comunidade FL).",
            pillars: ["formula", "branding"]
          }
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
    subtitle: "Pico de faturamento FL com marca que sustenta preço, tech que não quebra checkout e ads de conversão.",
    pillarFocus: ["formula", "branding", "marketing-tech"],
    pillarBridge:
      "A FL executa escassez e roteiro de vendas; Branding valida o ticket alto; Marketing & Tech converte tráfego e recupera carrinho.",
    sections: [
      {
        heading: "CPL 4 / live de abertura",
        primaryPillar: "formula",
        items: [
          {
            text: "Roteiro FL ao vivo: produto, preço, bônus escassez — especialista como autoridade (Branding).",
            pillars: ["formula", "branding"]
          }
        ]
      },
      {
        heading: "Página de vendas e checkout",
        primaryPillar: "marketing-tech",
        items: [
          {
            text: "Gateway integrado (Hotmart, Kiwify, Eduzz, PIX no funil) com UX testada sob carga.",
            pillars: ["marketing-tech"]
          },
          {
            text: "Prova social, garantia e identidade visual reforçando confiança no ticket.",
            pillars: ["marketing-tech", "branding"]
          }
        ]
      },
      {
        heading: "Tráfego pago — vendas",
        primaryPillar: "marketing-tech",
        items: [
          {
            text: "Campanhas “Inscrições abertas” + remarketing quebrando objeções (garantia, iniciantes, prazo).",
            pillars: ["marketing-tech", "formula", "branding"]
          }
        ]
      },
      {
        heading: "Inbound de vendas",
        primaryPillar: "formula",
        items: [
          {
            text: "Régua de escassez, bônus expirando e depoimentos — ritmo psicológico até fechar carrinho.",
            pillars: ["formula", "branding"]
          },
          {
            text: "Suporte chat/WhatsApp e recuperação de carrinho (entrega técnica + persuasão).",
            pillars: ["marketing-tech", "formula"]
          }
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
    subtitle: "Integridade de marca no fechamento, onboarding tech e debriefing FL para o próximo ciclo.",
    pillarFocus: ["branding", "formula", "marketing-tech"],
    pillarBridge:
      "Branding fecha com escassez real; FL mede o ciclo e planeja o próximo; Tech entrega onboarding e nutre a base (perpetuo/SEO).",
    sections: [
      {
        heading: "Fechamento de carrinho",
        primaryPillar: "branding",
        items: [
          {
            text: "Encerrar vagas no horário prometido — integridade que sustenta o próximo High Ticket.",
            pillars: ["branding", "formula"]
          }
        ]
      },
      {
        heading: "Onboarding e entrega",
        primaryPillar: "marketing-tech",
        items: [
          {
            text: "Fluxo automático de boas-vindas (e-mail/WhatsApp) — experiência de marca pós-compra.",
            pillars: ["marketing-tech", "branding"]
          },
          {
            text: "Reduzir churn/reembolso com consumo rápido do produto (protege o faturamento do pico).",
            pillars: ["formula", "branding"]
          }
        ]
      },
      {
        heading: "Debriefing",
        primaryPillar: "formula",
        items: [
          {
            text: "ROI, ROAS, CPL, conversão da PV e faturamento — matemática FL para financiar crescimento.",
            pillars: ["formula", "marketing-tech"]
          },
          {
            text: "Reunião estratégica: o que repetir nos três pilares no próximo lançamento.",
            pillars: ["branding", "marketing-tech", "formula"]
          }
        ]
      },
      {
        heading: "Perpetuo e SEO",
        primaryPillar: "marketing-tech",
        items: [
          {
            text: "Leads que não compraram: conteúdo orgânico, SEO e redes até o próximo evento FL.",
            pillars: ["marketing-tech", "branding", "formula"]
          }
        ]
      }
    ],
    relatedAdminPaths: [{ label: "Clientes", pathSuffix: "clientes" }]
  }
] as const;

export function getLaunchOperationPhase(id: string): LaunchOperationPhase | undefined {
  return LAUNCH_OPERATION_PHASES.find((p) => p.id === id);
}

export function adjacentLaunchOperationPhase(
  phaseId: string,
  direction: "prev" | "next"
): LaunchOperationPhase | undefined {
  const index = LAUNCH_OPERATION_PHASES.findIndex((p) => p.id === phaseId);
  if (index === -1) return undefined;
  const nextIndex = direction === "prev" ? index - 1 : index + 1;
  return LAUNCH_OPERATION_PHASES[nextIndex];
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

function iterPhaseTasks(
  phase: LaunchOperationPhase,
  fn: (phaseId: string, sectionIndex: number, itemIndex: number, item: LaunchOperationChecklistItem) => void
) {
  phase.sections.forEach((section, sectionIndex) => {
    section.items.forEach((item, itemIndex) => fn(phase.id, sectionIndex, itemIndex, item));
  });
}

export function launchOperationAllTaskIds(): string[] {
  const phaseIds = LAUNCH_OPERATION_PHASES.flatMap((phase) => {
    const ids: string[] = [];
    iterPhaseTasks(phase, (phaseId, si, ii) => {
      ids.push(launchOperationTaskId(phaseId, si, ii));
    });
    return ids;
  });
  return [...phaseIds, ...marketingDevAllTaskIds()];
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
  iterPhaseTasks(phase, (phaseId, si, ii) => {
    total += 1;
    const id = launchOperationTaskId(phaseId, si, ii);
    if (checked[id]) done += 1;
  });
  return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export function launchOperationPillarProgress(
  pillarId: LaunchOperationPillarId,
  checked: Record<string, boolean>
): { total: number; done: number; percent: number } {
  let total = 0;
  let done = 0;
  for (const phase of LAUNCH_OPERATION_PHASES) {
    iterPhaseTasks(phase, (phaseId, si, ii, item) => {
      if (!item.pillars.includes(pillarId)) return;
      total += 1;
      const id = launchOperationTaskId(phaseId, si, ii);
      if (checked[id]) done += 1;
    });
  }
  for (const stack of MARKETING_DEV_STACKS) {
    stack.items.forEach((item, index) => {
      if (!item.pillars.includes(pillarId)) return;
      total += 1;
      const id = marketingDevTaskId(stack.id, index);
      if (checked[id]) done += 1;
    });
  }
  return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}
