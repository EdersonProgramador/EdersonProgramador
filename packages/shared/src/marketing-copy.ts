/** Copy comercial — landing AIDA + processo + agendamento (sem substituir contrato). */

export const MARKETING_COPY = {
  brand: "Ederson Programador",
  domainLabel: "edersonprogramador.com.br",

  /** AIDA — estrutura narrativa da página */
  aida: {
    attention: {
      eyebrow: "Engenharia de produto digital",
      title: "Seu sistema no ar com clareza, ritmo e código que aguenta crescer.",
      subtitle:
        "Do diagnóstico à publicação: sites e plataformas sob medida para quem precisa de resultado — não de mais uma página genérica.",
      ctaPrimary: "Agendar conversa estratégica",
      ctaSecondary: "Ver passo a passo do método"
    },
    interest: {
      label: "Por que agora",
      title: "Enquanto o projeto trava, o mercado não espera.",
      subtitle:
        "Planilha, retrabalho e “jeitinho” custam caro: tempo da equipe, confiança do cliente e oportunidades que passam.",
      pains: [
        "Site lento ou desatualizado que não converte visitante em lead",
        "Processos manuais que repetem erro e consomem horas da operação",
        "Fornecedor que some depois do deploy — e você fica refém do caos"
      ],
      pivot:
        "Invertemos o jogo com escopo claro, entregas parciais visíveis e stack moderna — para você decidir com segurança em cada fase."
    },
    desire: {
      label: "Prova & método",
      title: "Produtos reais. Processo que você enxerga.",
      subtitle:
        "Cases em produção, repositório público e um roteiro de quatro fases alinhado ao que você aprova antes de ir para o código."
    },
    action: {
      label: "Próximo passo",
      title: "30 minutos para mapear viabilidade, prazo e investimento.",
      subtitle:
        "Reunião de diagnóstico sem compromisso de contratação. Se fizer sentido, você recebe proposta formal — assinatura e pagamento só depois de alinhados.",
      urgencyNote: "Agenda limitada por mês para manter qualidade de entrega e acompanhamento próximo."
    }
  },

  stats: [
    { value: "2+", label: "Produtos em produção citados" },
    { value: "40d", label: "Referência para MVP enxuto" },
    { value: "4", label: "Fases com entregáveis claros" },
    { value: "100%", label: "Transparência antes de codar" }
  ],

  hero: {
    eyebrow: "Desenvolvimento de sistemas & software sob medida",
    title: "Transforme sua ideia em um sistema profissional, rápido e pronto para crescer.",
    subtitle:
      "Projeto, desenvolvimento e publicação de sites e sistemas web com foco em performance, experiência do usuário e código sustentável — do MVP ao produto em produção.",
    ctaPrimary: "Quero um orçamento",
    ctaSecondary: "Ver projetos publicados"
  },

  trust: {
    title: "Projetos que já estão no ar",
    subtitle: "Experiência real entregando produtos digitais usados por pessoas e empresas todos os dias."
  },

  services: {
    title: "O que desenvolvemos",
    subtitle: "Soluções completas para quem precisa de presença digital séria — não apenas uma página bonita.",
    items: [
      {
        title: "Sistemas web sob medida",
        text: "Painéis, cadastros, fluxos de negócio, permissões e relatórios — arquitetura pensada para evoluir com você.",
        mood: "trust" as const
      },
      {
        title: "Sites e landing pages premium",
        text: "Páginas rápidas, responsivas e orientadas a conversão, com identidade visual alinhada à sua marca.",
        mood: "desire" as const
      },
      {
        title: "Integrações & automação",
        text: "Pagamentos, APIs, WhatsApp, e-mail, planilhas e serviços externos conectados ao seu produto.",
        mood: "logic" as const
      },
      {
        title: "Evolução & suporte",
        text: "Ajustes, novas funcionalidades e acompanhamento pós-lançamento para manter tudo estável em produção.",
        mood: "calm" as const
      }
    ]
  },

  process: {
    title: "Passo a passo do projeto",
    subtitle:
      "Quatro fases sequenciais — cada uma com aprovação sua antes de avançar. É assim que reduzimos surpresa e retrabalho.",
    steps: [
      {
        phase: "01",
        title: "Briefing & escopo",
        days: "1–3 dias",
        text: "Entendemos objetivo, público, funcionalidades e prazo. Você recebe proposta com investimento e cronograma.",
        deliverables: ["Mapa de escopo", "Proposta comercial", "Cronograma macro"],
        mood: "trust" as const
      },
      {
        phase: "02",
        title: "Interface & experiência",
        days: "~10 dias",
        text: "Layout e navegação alinhados à sua marca. Você aprova a direção visual antes do desenvolvimento.",
        deliverables: ["Wireframes / layout", "Fluxos principais", "Aprovação formal da UI"],
        mood: "desire" as const
      },
      {
        phase: "03",
        title: "Desenvolvimento",
        days: "~15 dias",
        text: "Código moderno, boas práticas e foco em velocidade. Integrações e regras de negócio com qualidade.",
        deliverables: ["Ambiente de homologação", "Integrações acordadas", "Testes de fluxo crítico"],
        mood: "logic" as const
      },
      {
        phase: "04",
        title: "Conteúdo, deploy & handoff",
        days: "~15 dias",
        text: "Ajuste de conteúdo, publicação, testes finais e orientação para operação. Sistema no ar e documentado.",
        deliverables: ["Deploy produção", "Domínio configurado", "Handoff e orientação de uso"],
        mood: "launch" as const
      }
    ]
  },

  meeting: {
    title: "Agendar reunião de diagnóstico",
    subtitle: "Escolha o formato. Confirmamos por e-mail ou WhatsApp com link e pauta.",
    options: [
      {
        title: "Videoconferência",
        duration: "30 min",
        text: "Ideal para alinhar escopo, mostrar referências e estimar investimento.",
        cta: "Solicitar horário"
      },
      {
        title: "Mensagem detalhada",
        duration: "Assíncrono",
        text: "Prefere escrever? Envie o formulário e respondemos com perguntas objetivas ou proposta de call.",
        cta: "Enviar briefing"
      }
    ],
    agenda: [
      "Contexto do negócio e quem usa o sistema",
      "Funcionalidades essenciais vs. futuras",
      "Prazo desejado e faixa de investimento",
      "Próximos passos (proposta ou POC, se aplicável)"
    ]
  },

  pricing: {
    title: "Investimento",
    subtitle: "Pacotes flexíveis conforme complexidade. Transparência desde a primeira conversa.",
    highlight: "Projetos a partir de R$ 3.000",
    note: "Valores variam conforme escopo, integrações e prazo. Entrada facilitada e parcelamento do saldo conforme marcos do projeto.",
    bullets: [
      "Proposta detalhada antes de iniciar",
      "Pagamento alinhado às entregas",
      "Hora técnica para demandas extras (sob consulta)",
      "Uma versão principal inclusa; expansões orçadas à parte"
    ]
  },

  faq: [
    {
      q: "Quanto tempo leva um sistema?",
      a: "Projetos enxutos podem ficar prontos em cerca de 40 dias. Escopos maiores seguem cronograma customizado na proposta."
    },
    {
      q: "Preciso ter todo o conteúdo pronto?",
      a: "Textos, imagens e identidade visual aceleram o projeto. Podemos orientar o que falta ou incluir produção de conteúdo no orçamento."
    },
    {
      q: "Você publica e configura o domínio?",
      a: "Sim. A publicação e configuração inicial fazem parte da entrega final do projeto."
    },
    {
      q: "Atende empresas e profissionais autônomos?",
      a: "Sim. Atendemos desde landing pages até plataformas completas com login, pagamentos e painel administrativo."
    },
    {
      q: "O que acontece depois da reunião?",
      a: "Se houver fit, enviamos proposta comercial. Contrato e pagamento só após sua aprovação formal — nada automático."
    }
  ],

  cta: {
    title: "Vamos construir seu próximo sistema?",
    subtitle:
      "Conte sua ideia em poucos minutos. Retorno com diagnóstico inicial e caminhos possíveis — sem compromisso de contratação.",
    formTitle: "Briefing & orçamento"
  },

  footer: {
    tagline: "Desenvolvimento de sistemas web — do código à produção.",
    rights: "Todos os direitos reservados.",
    legalLinks: [
      { id: "privacidade", label: "Privacidade" },
      { id: "termos", label: "Termos de uso" }
    ] as const
  },

  loginCta: "Área do cliente"
} as const;
