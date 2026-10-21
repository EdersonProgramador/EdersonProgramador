/** Copy comercial — AIDA + gatilhos mentais (prova social, escassez, autoridade, reciprocidade, aversão à perda). */

export const MARKETING_COPY = {
  brand: "Ederson Programador",
  domainLabel: "edersonprogramador.com.br",

  /** AIDA — arco emocional → racional → decisão */
  aida: {
    attention: {
      eyebrow: "Software sob medida · do briefing ao domínio no ar",
      title: "Pare de remendar. Construa o sistema que a operação já pediu há meses.",
      subtitle:
        "Sites e plataformas feitos para converter, escalar e não te deixar refém de template. Um engenheiro no comando — escopo fechado, entregas que você vê, código que aguenta a próxima fase do negócio.",
      ctaPrimary: "Reservar diagnóstico gratuito",
      ctaSecondary: "Ver as 4 fases do método"
    },
    interest: {
      label: "Custo de esperar",
      title: "Cada semana sem sistema certo é receita, foco e credibilidade indo embora.",
      subtitle:
        "Não é falta de vontade — é acúmulo de atalhos: planilha que virou “sistema”, site que não gera lead, dev que sumiu no meio do caminho. O mercado não pausa enquanto você organiza o caos.",
      pains: [
        "Visitante entra, não entende a oferta em 5 segundos e some — você paga tráfego para aquecer concorrente",
        "Time repete o mesmo cadastro em três lugares; erro humano vira retrabalho e cliente irritado na fila",
        "Deploy feito, documentação zero: qualquer mudança vira negociação cara ou dependência de quem não responde"
      ],
      pivot:
        "Trocamos improviso por roteiro: escopo aprovado por fase, homologação antes do go-live e stack moderna (React, APIs, cloud). Você decide com dados — não com promessa bonita no slide."
    },
    desire: {
      label: "Prova + processo",
      title: "Não é portfólio de mockup. É produto rodando e método que você acompanha.",
      subtitle:
        "Cases publicados, código no GitHub e um pipeline de quatro etapas: nada avança sem o seu “ok”. Autoridade técnica com transparência — o oposto do escuro “confia em mim”."
    },
    action: {
      label: "Decisão simples",
      title: "30 minutos. Você sai sabendo se vale a pena, quanto custa e por onde começar.",
      subtitle:
        "Diagnóstico sem cartão e sem contrato automático. Se fizer sentido para os dois lados, proposta formal — assinatura e pagamento só depois do alinhamento por escrito.",
      urgencyNote: "Abro poucas vagas de projeto por mês para manter acompanhamento próximo e prazo cumprido."
    }
  },

  stats: [
    { value: "2+", label: "Produtos reais em produção hoje" },
    { value: "~40d", label: "Referência para MVP enxuto aprovado" },
    { value: "4", label: "Marcos com entrega e aprovação sua" },
    { value: "0", label: "Surpresa de escopo após proposta assinada*" }
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
    title: "Quem já confia no ar não precisa de discurso",
    subtitle:
      "Estes produtos estão publicados, recebendo tráfego e evoluindo — prova social concreta de entrega fim a fim, não só layout exportado do Figma."
  },

  services: {
    title: "O que resolvemos",
    subtitle: "Quatro frentes para tirar o digital do modo “gambiarra” e colocar no modo operação.",
    items: [
      {
        title: "Sistemas web sob medida",
        text: "Painéis, permissões, fluxos e relatórios desenhados em cima do seu processo — não do template genérico. Arquitetura pronta para crescer sem reescrever tudo.",
        mood: "trust" as const
      },
      {
        title: "Sites e landing pages que vendem",
        text: "Rápidos, responsivos e guiados por copy e hierarquia visual — para visitante entender, confiar e clicar, não só admirar animação.",
        mood: "desire" as const
      },
      {
        title: "Integrações & automação",
        text: "Pagamento, WhatsApp, e-mail, ERP, planilha ou API: menos copiar-colar, mais evento automático no lugar certo.",
        mood: "logic" as const
      },
      {
        title: "Evolução pós-lançamento",
        text: "Correção, feature nova e observabilidade — para o sistema continuar útil depois do “parabéns, foi pro ar”.",
        mood: "calm" as const
      }
    ]
  },

  process: {
    title: "Método em 4 fases",
    subtitle:
      "Compromisso progressivo: você aprova cada marco antes do próximo. Reduz medo de investir no escuro e ativa consistência — o projeto anda porque você valida, não porque eu sumi.",
    steps: [
      {
        phase: "01",
        title: "Briefing & escopo fechado",
        days: "1–3 dias",
        text: "Mapeamos objetivo, usuários, must-have e prazo. Você recebe proposta com investimento, marcos e o que fica explicitamente fora — clareza antes do código.",
        deliverables: ["Mapa de escopo e prioridades", "Proposta comercial detalhada", "Cronograma com marcos de pagamento"],
        mood: "trust" as const
      },
      {
        phase: "02",
        title: "Interface & experiência",
        days: "~10 dias",
        text: "Direção visual e fluxos principais alinhados à marca. Só depois do seu ok formal entra desenvolvimento — evita refazer tela inteira na reta final.",
        deliverables: ["Layout / wireframe navegável", "Fluxos críticos validados", "Registro de aprovação da UI"],
        mood: "desire" as const
      },
      {
        phase: "03",
        title: "Desenvolvimento & homologação",
        days: "~15 dias",
        text: "Código limpo, performance e regras de negócio testadas em ambiente de homologação. Você vê funcionando antes do domínio oficial.",
        deliverables: ["URL de homologação", "Integrações acordadas ativas", "Checklist dos fluxos críticos"],
        mood: "logic" as const
      },
      {
        phase: "04",
        title: "Deploy, domínio & handoff",
        days: "~15 dias",
        text: "Conteúdo ajustado, publicação, testes finais e orientação de operação. Sistema no ar, domínio configurado — handoff para você não ficar refém.",
        deliverables: ["Produção no ar", "DNS / SSL configurados", "Handoff + orientação de uso"],
        mood: "launch" as const
      }
    ]
  },

  meeting: {
    title: "Agendar reunião de diagnóstico",
    subtitle: "Reciprocidade na prática: você traz o contexto; eu trago viabilidade, ordem de prioridade e faixa de investimento. Confirmamos por e-mail ou WhatsApp.",
    options: [
      {
        title: "Videoconferência",
        duration: "30 min",
        text: "Melhor para alinhar tela compartilhada, referências e estimativa rápida — ideal se você já tem ideia do escopo.",
        cta: "Solicitar horário"
      },
      {
        title: "Briefing por mensagem",
        duration: "Assíncrono",
        text: "Prefere escrever com calma? Formulário abaixo — respondo com perguntas objetivas ou proposta de call, no seu ritmo.",
        cta: "Enviar briefing"
      }
    ],
    agenda: [
      "O que o negócio precisa resolver nos próximos 90 dias",
      "Must-have vs. “fase 2” (para não inflar orçamento)",
      "Prazo realista e faixa de investimento que faz sentido",
      "Próximo passo: proposta, POC ou “ainda não é hora” — sem pressão"
    ]
  },

  pricing: {
    title: "Investimento",
    subtitle: "Ancoragem honesta: projetos sob medida a partir de um patamar claro; o valor final depende do que entra no escopo — nunca do “achismo”.",
    highlight: "A partir de R$ 3.000",
    note: "Entrada alinhada ao marco 1; saldo atrelado a entregas aprovadas. Integrações complexas, conteúdo e prazo apertado ajustam a proposta — tudo documentado antes de começar.",
    bullets: [
      "Proposta por escrito antes de qualquer cobrança",
      "Pagamento amarrado a marcos — não tudo adiantado no escuro",
      "Hora técnica para demandas fora do escopo (tabela na proposta)",
      "Uma linha de produto principal; expansões orçadas com novo aceite"
    ]
  },

  faq: [
    {
      q: "Quanto tempo leva um sistema?",
      a: "MVP enxuto e escopo travado: referência em torno de 40 dias. Projetos maiores ganham cronograma próprio na proposta — com datas, não “em breve”."
    },
    {
      q: "Preciso ter logo, textos e identidade prontos?",
      a: "Quanto mais material, mais rápido. Se faltar algo, indico o que priorizar ou orço produção de conteúdo — sem te vender pacote que você não pediu."
    },
    {
      q: "Você publica e configura domínio?",
      a: "Sim. Deploy, DNS e SSL entram na fase final. Objetivo: você clicar no link e ver seu produto no ar, não um zip na mão."
    },
    {
      q: "Atende empresa pequena e profissional solo?",
      a: "Sim. De landing de alta conversão a plataforma com login, pagamentos e painel — o formato muda; o padrão de clareza e entrega, não."
    },
    {
      q: "E se eu só quiser conversar e não fechar agora?",
      a: "Perfeito. A reunião não gera contrato automático. Proposta só se houver fit dos dois lados — respeito seu tempo e o meu."
    },
    {
      q: "O que significa o “0” nas estatísticas?",
      a: "Compromisso de escopo: o que está na proposta assinada é o que será entregue nesse pacote. Mudança de rota = novo aceite e ajuste formal — sem cobrança surpresa escondida."
    }
  ],

  cta: {
    title: "Seu próximo passo cabe em um formulário",
    subtitle:
      "Conte objetivo, prazo e quem usa o sistema. Retorno com leitura honesta do caminho — diagnóstico inicial, não spam de vendas.",
    formTitle: "Briefing & orçamento"
  },

  footer: {
    tagline: "Engenharia de produto digital — do primeiro commit ao domínio no ar.",
    rights: "Todos os direitos reservados.",
    legalLinks: [
      { id: "privacidade", label: "Privacidade" },
      { id: "termos", label: "Termos de uso" }
    ] as const
  },

  loginCta: "Área do cliente"
} as const;
