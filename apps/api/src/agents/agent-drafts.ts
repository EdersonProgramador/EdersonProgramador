import {
  getAgencyAgentTemplate,
  proposalPackFromTier,
  parsePackageTier,
  type AgencyAgentTemplateId,
  type PackageTierId
} from "@ederson-agencia/shared";

export type AgentDraftContext = {
  templateId: string;
  brandVoice?: string | null;
  offerSummary?: string | null;
  guardrails?: string | null;
  clientName?: string;
  projectTitle?: string;
  input?: Record<string, unknown>;
};

export function buildStructuredAgentDraft(ctx: AgentDraftContext): Record<string, unknown> {
  const tpl = getAgencyAgentTemplate(ctx.templateId);
  const voice = ctx.brandVoice?.trim() || "tom profissional e direto";
  const offer = ctx.offerSummary?.trim() || ctx.projectTitle || "App do Zero ao Lançamento";
  const client = ctx.clientName?.trim() || "Cliente";
  const topic = typeof ctx.input?.topic === "string" ? ctx.input.topic : "proposta e próximo passo";
  const leadName = typeof ctx.input?.leadName === "string" ? ctx.input.leadName : client;
  const tierRaw = typeof ctx.input?.packageTier === "string" ? ctx.input.packageTier : "professional";
  const tier = (parsePackageTier(tierRaw) ?? "professional") as PackageTierId;

  const base = {
    deliverableKind: tpl?.deliverableKind ?? "content_draft",
    domain: tpl?.domain ?? "conteudo",
    templateId: ctx.templateId,
    guardrails: ctx.guardrails ?? tpl?.defaultGuardrails ?? null,
    skills: tpl?.skills ?? []
  };

  switch (ctx.templateId as AgencyAgentTemplateId) {
    case "brand_discovery":
      return {
        ...base,
        brandingPatch: {
          "discovery.stakeholders": `${client}: decisor, operador e influenciador a mapear em call.`,
          "discovery.competitors": `Hipótese: concorrentes diretos no nicho de ${offer}. Validar na discovery.`,
          "discovery.audience": `Público que busca ${offer}; dor principal: clareza de escopo e prazo.`,
          "discovery.notes": `Brief inicial para ${client} — ${topic}.`
        },
        summary: `Discovery estruturado para ${client}.`
      };
    case "brand_strategist":
      return {
        ...base,
        brandingPatch: {
          "strategy.positioning": `${client} entrega ${offer} com método claro App do Zero ao Lançamento.`,
          "strategy.valueProp": `Do zero ao lançamento com fases, aprovação e pacotes START/BUSINESS/ENTERPRISE.`,
          "strategy.differentiation": "Operação + entrega técnica + funil comercial no mesmo sistema.",
          "strategy.promise": "Proposta objetiva, cronograma e entregáveis por fase."
        },
        summary: "Posicionamento e proposta de valor."
      };
    case "brand_naming":
      return {
        ...base,
        brandingPatch: {
          "naming.options": `1) ${client} Core\n2) ${client} Lab\n3) ${client} Launch`,
          "naming.tagline": `${offer} — do zero ao ar.`,
          "naming.risks": "Evitar nomes genéricos demais para modelos de IA/search."
        },
        summary: "Opções de naming e tagline."
      };
    case "brand_verbal":
      return {
        ...base,
        brandingPatch: {
          "verbal.voice": voice,
          "verbal.dos": "Frases curtas; benefício antes da ferramenta; CTA único.",
          "verbal.donts": "Jargão vazio; promessas sem prazo; pressão agressiva.",
          "verbal.exampleGood": `Com o ${offer}, você sai com proposta, fases e entrega acompanhável.`,
          "verbal.exampleBad": "Sinergias disruptivas omnichannel para alavancar ROI."
        },
        summary: "Identidade verbal e guardrails de voz."
      };
    case "brand_visual":
      return {
        ...base,
        brandingPatch: {
          "visual.logoBrief": `Marca ${client}: símbolo simples, legível em favicon e app.`,
          "visual.palette": "Primária: #0F172A · Acento: #10B981 · Neutro: #F8FAFC",
          "visual.typography": "Display: Syne · Corpo: DM Sans · Mono: IBM Plex Mono",
          "visual.tokens": JSON.stringify({
            color: { bg: "#0F172A", accent: "#10B981", text: "#F8FAFC" },
            radius: "0.75rem"
          })
        },
        summary: "Brief visual e tokens."
      };
    case "brand_guidelines":
      return {
        ...base,
        brandingPatch: {
          "guidelines.usage": "Logo com área de proteção 1x; não distorcer; contraste AA.",
          "guidelines.brandbookOutline":
            "1. Essência 2. Posicionamento 3. Verbal 4. Visual 5. Aplicações 6. Governança",
          "guidelines.checklist": "PDF brandbook · arquivos de logo · tokens · tom de voz"
        },
        summary: "Guidelines e outline de brandbook."
      };
    case "proposal_architect": {
      const pack = proposalPackFromTier(tier);
      return {
        ...base,
        proposalPack: pack,
        subject: `Proposta ${pack.packageName} — ${client}`,
        body: [
          `Olá ${leadName},`,
          "",
          `Segue a proposta alinhada à página App do Zero ao Lançamento para ${offer}.`,
          "",
          `Pacote recomendado: ${pack.packageName} (${pack.tagline}).`,
          `Valor total: R$ ${(pack.totalValueCents / 100).toLocaleString("pt-BR")} · Entrada ${pack.entryPercent}%: R$ ${(pack.entryValueCents / 100).toLocaleString("pt-BR")}.`,
          "",
          "Entregáveis por fase (resumo):",
          ...pack.deliverables.slice(0, 12).map((d) => `- [${d.phase}] ${d.label}`),
          pack.deliverables.length > 12 ? `… +${pack.deliverables.length - 12} itens` : "",
          "",
          "Próximo passo: call curta ou assinatura do contrato com cronograma de fases.",
          "",
          `Tom: ${voice}.`
        ]
          .filter(Boolean)
          .join("\n"),
        channel: "email",
        summary: `Pacote de proposta ${pack.packageName}.`
      };
    }
    case "receptionist":
      return {
        ...base,
        channel: "whatsapp",
        subject: null,
        body: `${leadName}, obrigado pelo contato. Sobre ${offer}: posso te orientar no pacote (START / BUSINESS / ENTERPRISE) e no próximo passo (${topic}). Prefere WhatsApp ou e-mail?`
      };
    case "marketer":
      return {
        ...base,
        channel: "email",
        subject: `${topic} — proposta objetiva`,
        body: `Oi${leadName !== client ? ` ${leadName}` : ""},\n\nVi o interesse em ${offer}. Em poucas linhas: montamos a proposta com escopo, fases e valores oficiais.\n\nTom: ${voice}.\n\nResponda “quero proposta” que eu envio o pacote.`
      };
    case "campaign_runner":
      return {
        ...base,
        channel: "email",
        subject: "Sequência drip — aquisição → proposta",
        body: null,
        campaignDraft: {
          name: `Aquisição · ${client}`,
          kind: "ACQUISITION",
          channel: "email",
          sequence: [
            {
              dayOffset: 0,
              channel: "email",
              subject: `Bem-vindo — ${offer}`,
              bodyHtml: `<p>Olá {{LEAD_NAME}},</p><p>Recebemos seu interesse. Em breve a proposta alinhada aos pacotes START/BUSINESS/ENTERPRISE.</p>`
            },
            {
              dayOffset: 2,
              channel: "email",
              subject: "Como funciona o método",
              bodyHtml: `<p>Fases com aprovação, stack e lançamento — ${voice}.</p>`
            },
            {
              dayOffset: 5,
              channel: "email",
              subject: "Pronto para a proposta?",
              bodyHtml: `<p>Responda este e-mail para receber o pacote comercial.</p>`
            }
          ]
        },
        summary: "Sequência drip de aquisição."
      };
    case "sales_closer":
      return {
        ...base,
        salesScript: {
          opening: `Agradecer ${leadName}; confirmar entendimento de ${offer}.`,
          discovery: ["Qual resultado em 90 dias?", "Há prazo de lançamento?", "Preferência START/BUSINESS/ENTERPRISE?"],
          pitch: "Mostrar pacote oficial, fases, entrada % e entregáveis.",
          objections: {
            preco: "Comparar escopo por fase; oferecer START para validar.",
            prazo: "Cronograma com buffer; dependência de materiais do cliente."
          },
          close: "Agendar assinatura ou enviar proposta escrita hoje."
        },
        summary: "Script de fechamento."
      };
    case "loyalty_keeper":
      return {
        ...base,
        channel: "email",
        subject: `Check-in — ${client}`,
        body: `Olá ${leadName},\n\nPassando para garantir que as fases de ${offer} estão claras. Se quiser evoluir de pacote, alinhamos com transparência.\n\nTom: ${voice}.`
      };
    case "launch_planner":
      return {
        ...base,
        launchPlan: {
          phases: [
            { id: "prep", label: "Preparação", items: ["Brief", "Stack", "Assets do cliente"] },
            { id: "build", label: "Construção", items: ["MVP", "Funil", "Automações"] },
            { id: "launch", label: "Lançamento", items: ["Go-live", "Campanha", "Suporte"] },
            { id: "pos", label: "Pós", items: ["Métricas", "Otimização", "Upsell responsável"] }
          ],
          assetsNeeded: ["Logo", "Textos", "Fotos", "Acessos"]
        },
        summary: "Plano de lançamento."
      };
    case "stack_architect":
      return {
        ...base,
        stackPick: {
          "front-end": "react-vite",
          "back-end": "node-ts",
          dados: "postgres",
          infra: "render",
          notes: `Stack padrão agência para ${offer}.`
        },
        summary: "Sugestão de stack."
      };
    case "code_studio_pair":
      return {
        ...base,
        codeSnippet: {
          path: "src/pages/LandingHero.tsx",
          language: "tsx",
          content: `export function LandingHero() {\n  return (\n    <section>\n      <h1>${client}</h1>\n      <p>${offer}</p>\n      <a href="/formulario">Quero proposta</a>\n    </section>\n  );\n}\n`
        },
        summary: "Snippet para o Studio."
      };
    case "content_writer":
      return {
        ...base,
        channel: "inbox",
        subject: `Copy — ${topic}`,
        body: `Headline: ${offer}\n\nSub: Do zero ao lançamento com proposta clara.\n\nProva: fases, aprovação e pacotes oficiais.\n\nCTA: Quero minha proposta\n\nTom: ${voice}.`
      };
    case "review_responder":
    default:
      return {
        ...base,
        channel: "inbox",
        subject: "Resposta a avaliação",
        body: `Obrigado pelo feedback, ${leadName}. Sobre ${offer}: vamos cuidar com atenção. Me conta o detalhe por aqui.`
      };
  }
}
