/**
 * Copy — funil Lançamento Semente (App do Zero ao Lançamento).
 * Página de captura + aquecimento; preços e pacotes ficam fora deste fluxo.
 */

export const SEED_LAUNCH_PATH = "/lancamento";

export const SEED_LAUNCH_COPY = {
  meta: {
    title: "Aula gratuita · App do Zero ao Lançamento",
    description:
      "Cadastre-se na aula ao vivo: como estruturar seu aplicativo da ideia ao MVP com escopo e investimento previsível."
  },

  event: {
    /** Atualize antes de cada semente (data/hora no fuso do público). */
    badge: "Aula gratuita · ao vivo",
    dateLine: "Próxima turma: em breve — vagas limitadas",
    duration: "90 minutos",
    format: "Online · link enviado por e-mail e WhatsApp"
  },

  hero: {
    eyebrow: "Lançamento semente",
    title: "Do zero ao MVP: o mapa para colocar seu app no ar sem contratar errado.",
    subtitle:
      "Para empreendedores e empresas com ideia ou produto digital travado — uma aula prática sobre escopo, etapas e o que priorizar antes de investir pesado em desenvolvimento.",
    ctaPrimary: "Quero minha vaga gratuita",
    ctaSecondary: "Ver programação da semana",
    trustLine: "Ederson Programador · projetos em produção · método em 5 etapas"
  },

  avatar: {
    label: "Para quem é",
    title: "Esta aula é para você se…",
    items: [
      "Tem uma ideia de app ou sistema e não sabe por onde começar nem quanto investir de forma realista.",
      "Já gastou tempo ou dinheiro e o projeto não saiu do papel — quer um roteiro claro antes da próxima decisão.",
      "Precisa apresentar um MVP a sócios, investidores ou clientes, com escopo fechado e prazo definido."
    ],
    notFor: "Não é curso genérico de programação: foco em decisão de produto, escopo e implantação com apoio técnico profissional."
  },

  cpl: {
    label: "Antes da live",
    title: "Conteúdos de aquecimento na sua caixa de entrada",
    subtitle: "Quem se inscreve recebe a sequência para chegar preparado na aula.",
    items: [
      {
        step: "CPL 1",
        title: "Oportunidade",
        text: "Por que a maioria dos apps trava antes do MVP — e a janela para validar com usuários reais."
      },
      {
        step: "CPL 2",
        title: "Transformação",
        text: "As 5 etapas do App do Zero ao Lançamento: da ideia validada à implantação, com critérios de aceite."
      },
      {
        step: "CPL 3",
        title: "Prova e live",
        text: "Cases em produção, bastidores do método e o que vamos decidir juntos na aula ao vivo."
      }
    ]
  },

  live: {
    label: "Na aula ao vivo",
    title: "O que você vai sair sabendo",
    bullets: [
      "Como transformar sua ideia em escopo mínimo testável (MVP) sem feature creep.",
      "Ordem correta: diagnóstico, especificação, desenvolvimento, testes e implantação.",
      "Sinais de alerta ao contratar desenvolvimento (e como pedir proposta com critérios claros).",
      "Próximo passo possível após a aula — apenas para quem se encaixar no perfil e nas vagas abertas."
    ],
    note: "Na live, quem estiver alinhado poderá conhecer condições especiais para vagas limitadas de implementação — sem compromisso na inscrição gratuita."
  },

  proof: {
    label: "Prova",
    title: "Método aplicado em projetos reais",
    stats: [
      { value: "5", label: "Etapas", detail: "Ideia → implantação" },
      { value: "2+", label: "Produção", detail: "Cases publicados" },
      { value: "90", label: "Minutos", detail: "Aula ao vivo" }
    ]
  },

  faq: [
    {
      q: "A inscrição é gratuita?",
      a: "Sim. Você entra na lista, recebe os conteúdos de aquecimento e o link da aula. Não há cobrança na inscrição."
    },
    {
      q: "Preciso saber programar?",
      a: "Não. A aula é voltada a decisões de produto e projeto; a execução técnica é conduzida por profissionais no escopo contratado."
    },
    {
      q: "Vou receber proposta ou preço na inscrição?",
      a: "Não. Valores e pacotes são apresentados apenas na fase de abertura de vagas, após a aula, para quem participou do processo."
    },
    {
      q: "Como recebo o link da live?",
      a: "Por e-mail e, se informar WhatsApp, também por lá. Guarde nossos contatos na caixa de entrada para não perder os CPLs."
    }
  ],

  form: {
    label: "Inscrição",
    title: "Cadastre-se na plataforma",
    subtitle:
      "Um único cadastro: você entra na lista da live e já cria sua conta para assistir à apresentação e contratar dentro do sistema.",
    submit: "Criar conta e entrar na lista",
    successHint: "Redirecionando para a Área do cliente…",
    fields: {
      challenge: "Qual seu maior desafio hoje com o app ou a ideia? (opcional)"
    }
  },

  nav: [
    { href: "#aula", label: "A aula" },
    { href: "#aquecimento", label: "Aquecimento" },
    { href: "#prova", label: "Prova" },
    { href: "#inscricao", label: "Inscrição" }
  ] as const,

  footer: {
    backHome: "Site institucional",
    institutionalNote: "Desenvolvimento sob medida · pacotes e propostas completas no site principal."
  }
} as const;
