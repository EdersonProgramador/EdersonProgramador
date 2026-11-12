/**
 * Copy funil agressivo — estrutura inspirada em LP de comunidade/low ticket,
 * adaptada ao App do Zero ao Lançamento (Ederson Programador).
 */

export const LAUNCH_FUNNEL_COPY = {
  marqueeSymbols: "✦" as const,

  marquee: [
    "FUNIL DE CAPTAÇÃO NO AR",
    "LANDING QUE CONVERTE",
    "APP E SISTEMA SOB MEDIDA",
    "LANÇAMENTO DIGITAL E FÍSICO",
    "AUTOMAÇÃO E-MAIL E WHATSAPP",
    "ESCOPO FECHADO · CONTRATO",
    "DIAGNÓSTICO GRÁTIS NO CADASTRO",
    "CASES EM PRODUÇÃO"
  ],

  heroVsl: {
    pretitle: "Da ideia ao lançamento sem enrolação",
    headline:
      "COLOQUE SEU APP, PORTAL OU FUNIL NO AR — COM PACOTE FECHADO, MARCO A MARCO, DO ZERO ATÉ A PRIMEIRA VERSÃO PUBLICADA!",
    subhead:
      "Bora para um diagnóstico de 30 minutos comigo? Assista ao vídeo, entende o processo e só avança se fizer sentido pro seu negócio.",
    videoCta: "Ativar som",
    videoHint: "Clique para assistir com áudio e ver como funciona a jornada.",
    youtubeLabel: "Mais vídeos no YouTube",
    /** Defina VITE_FUNNEL_VSL_YOUTUBE_ID no front ou troque aqui. */
    youtubeVideoId: "",
    primaryCta: "QUERO MINHA VAGA NO LOTE",
    secondaryCta: "Ver pacotes e valores"
  },

  community: {
    kicker: "c o m u n i d a d e",
    brand: "Ederson",
    brandSuffix: "Programador®",
    memberCount: "+120",
    memberLabel: "projetos e empreendedores acompanhados",
    title: "Não é curioso. É pra quem vai executar.",
    body:
      "Todo dia estratégia nova de produto, funil e entrega técnica. Aqui o foco é um ajudar o outro a colocar oferta no ar — sem guru, sem promessa milagrosa, com contrato e escopo.",
    ruleTitle: "A única regra aqui é essa:",
    ruleBody: "Traga contexto de negócio,\ne nós entregamos o software alinhado ao modelo.",
    cta: "Continuar",
    subtitle:
      "Para quem não quer só “um site bonito”, mas validar oferta, captar demanda e entregar software alinhado ao modelo de receita."
  },

  forWho: {
    label: "É pra quem",
    title: "Empreendedores que vão lançar de verdade",
    items: [
      "Sonha em sair do improviso e ter app, portal ou loja funcionando com escopo claro.",
      "Quer lançar infoproduto, serviço ou produto físico com vitrine e captação profissionais.",
      "Se sente sozinho e quer um parceiro técnico que fala a língua do negócio.",
      "Está perdido entre no-code, freelancer barato e proposta que não fecha.",
      "Já vende algo digital mas travou em integração, automação ou publicação.",
      "É iniciante e quer ir do zero ao MVP com marcos e aceite formal."
    ],
    notFor: [
      "Quem busca app grátis ou resultado sem investir tempo e dinheiro.",
      "Quem não topa contrato, escopo fechado e pagamento por marcos.",
      "Curioso que não vai responder briefing nem participar do alinhamento."
    ],
    notForTitle: "Não é pra você se…"
  },

  pipeline: {
    title: "Por que isso pode mudar o seu negócio?",
    steps: [
      { key: "ideia", label: "Ideia", tier: "iniciante" as const },
      { key: "plano", label: "Plano de negócio", tier: "estrategia" as const },
      { key: "mvp", label: "MVP", tier: "construcao" as const },
      { key: "lancamento", label: "Lançamento", tier: "impulso" as const },
      { key: "validacao", label: "Validação", tier: "maestria" as const }
    ],
    tagline: "Aqui ninguém entrega escopo que você não pediu.",
    victoryTitle: "Validação concluída",
    victorySubtitle: "Ideia validada — produto no ar com escopo fechado."
  },

  /** Variantes para notificações sociais (sorteadas no front — nunca fixas). */
  saleToastVariants: {
    firstNames: [
      "Ana",
      "Bruno",
      "Carla",
      "Diego",
      "Elena",
      "Felipe",
      "Giovana",
      "Henrique",
      "Isabela",
      "João",
      "Larissa",
      "Marcos",
      "Natália",
      "Paulo",
      "Rafaela",
      "Thiago"
    ],
    cities: ["Belém", "Ananindeua", "São Paulo", "Curitiba", "Recife", "Manaus", "Goiânia", "Fortaleza"],
    lead: {
      titles: ["Lead capturado!", "Novo lead!", "Formulário recebido!", "Cadastro no funil!", "Interesse registrado!"],
      valueTemplates: [
        "Formulário #{n}",
        "WhatsApp — {name}",
        "{name} · {city}",
        "Popup · #{n}",
        "VSL · {name}"
      ]
    },
    proposal: {
      titles: [
        "Proposta enviada!",
        "Orçamento no e-mail!",
        "Proposta recebida!",
        "Pacote indicado!",
        "Follow-up enviado!"
      ],
      valueTemplates: [
        "Pacote Essencial",
        "Pacote Profissional",
        "Pacote Avançado",
        "MVP · escopo fechado",
        "Proposta · {name}",
        "Reunião agendada · {name}"
      ]
    },
    contract: {
      titles: ["Contrato assinado!", "Entrada confirmada!", "Vaga reservada!", "Marco 1 liberado!"],
      valueTemplates: [
        "Entrada confirmada",
        "Pacote Profissional",
        "Kick-off agendado",
        "{name} · contrato ativo",
        "Essencial · assinado"
      ]
    }
  },

  socialProof: {
    title: "Projetos publicados — operação real",
    subtitle:
      "Plataformas e sites no ar hoje. Não é mockup: é link que você abre, testa e valida antes de contratar.",
    kicker: "☞ ninguém fica sem direção técnica!",
    cta: "Ver todos os cases",
    /** Rostos no marquee (ilustrativo — satisfação de clientes). */
    clientAvatars: [
      { src: "/funnel/avatars/client-01.jpg", alt: "Cliente satisfeito com o projeto entregue" },
      { src: "/funnel/avatars/client-02.jpg", alt: "Empreendedor após implantação do app" },
      { src: "/funnel/avatars/client-03.jpg", alt: "Cliente feliz com suporte e entrega" },
      { src: "/funnel/avatars/client-04.jpg", alt: "Gestor validando o sistema em produção" },
      { src: "/funnel/avatars/client-05.jpg", alt: "Cliente recomendando o pacote Profissional" },
      { src: "/funnel/avatars/client-06.jpg", alt: "Fundador após lançamento do MVP" },
      { src: "/funnel/avatars/client-07.jpg", alt: "Cliente satisfeita com prazo e escopo" },
      { src: "/funnel/avatars/client-08.jpg", alt: "Parceiro com projeto publicado" }
    ]
  },

  benefits: {
    title: "O que você leva na prática",
    items: [
      {
        icon: "play",
        title: "Briefing que você entende",
        text: "Sem juridiquês técnico. Você sai da call sabendo pacote, prazo e próximo passo."
      },
      {
        icon: "live",
        title: "Alinhamento ao vivo por marco",
        text: "Demo e validação a cada fase — não some no meio do projeto."
      },
      {
        icon: "box",
        title: "Landing e captação prontas",
        text: "Funil com formulário, leads no painel e gancho pra automação n8n."
      },
      {
        icon: "users",
        title: "Parceiro, não só executor",
        text: "Ajustamos oferta e fluxo antes de codar o que não vende."
      },
      {
        icon: "message",
        title: "Contato direto",
        text: "Você fala com quem arquiteta e desenvolve — sem camadas de “equipe”."
      },
      {
        icon: "refresh",
        title: "Evolução pós-lançamento",
        text: "Manutenção e melhorias contratáveis com roadmap claro."
      }
    ]
  },

  bmc: {
    label: "Modelo de negócio",
    title: "Do Canvas ao lançamento",
    subtitle:
      "Antes de codar: segmentos, proposta de valor, canais e receita. O código implementa o modelo — não o contrário.",
    pillars: [
      {
        step: "01",
        title: "Segmentos & proposta",
        text: "Para quem é, dor, promessa e diferencial — digital, físico ou ambos."
      },
      {
        step: "02",
        title: "Canais & relacionamento",
        text: "Landing, captura, nutrição (e-mail/WhatsApp), comunidade e pós-venda."
      },
      {
        step: "03",
        title: "Receita & recursos",
        text: "Precificação, lotes, escassez ética e custos (hospedagem, APIs, estoque)."
      },
      {
        step: "04",
        title: "MVP & validação",
        text: "Entrega mínima testável, métricas e iteração até o lançamento oficial."
      }
    ],
    footnote:
      "Baseado no Business Model Canvas, aplicado à execução técnica da Ederson Programador."
  },

  guarantee: {
    days: 30,
    badge: "30 DIAS",
    title: "Garantia de conformidade técnica — sem frescura",
    body:
      "Entra, acompanha a entrega, testa no escopo contratado. Se em 30 dias após aceite houver defeito reproduzível fora do combinado, corrigimos conforme contrato. Isso é seriedade — não promessa de ficar rico overnight.",
    cta: "Termos da garantia",
    trust: ["Proposta por escrito", "Contrato digital", "Pagamento por marcos"] as const
  },

  topics: [
    "Infoprodutos",
    "SaaS",
    "Lojas físicas",
    "Apps",
    "Funis",
    "Landing pages",
    "Automação",
    "WhatsApp",
    "n8n",
    "MVP",
    "Integrações",
    "Pagamentos"
  ],

  scarcity: {
    label: "Lote 1 · Encerrando",
    title: "Vagas limitadas pra novos projetos neste mês",
    slotsLeft: 12,
    body:
      "Pra manter qualidade, fechamos um número fixo de contratos por lote. Cadastrou, entrou na fila de diagnóstico e na sequência automática.",
    cta: "QUERO COMEÇAR HOJE",
    note: "Valores de referência — orçamento final após escopo."
  },

  pricingFunnel: {
    promoBadge: "Aniversário do método · condição por tempo limitado",
    installmentNote: "Pagamento por marcos — entrada + entregas (ex.: 40% / 30% / 30%)",
    secure: "🔒 Dados LGPD · Proposta formal · Sem compromisso na primeira conversa"
  },

  captureModal: {
    title: "Solicitar proposta",
    subtitle:
      "Informe nome, e-mail e WhatsApp. Sua solicitação será registrada e nossa equipe retornará com orientação sobre pacotes e próximos passos.",
    consent:
      "Autorizo o tratamento dos meus dados e o contato comercial sobre o programa App do Zero ao Lançamento, conforme a LGPD e a Política de Privacidade.",
    submit: "Enviar solicitação",
    success: "Recebemos seu cadastro. Em breve entraremos em contato por e-mail ou WhatsApp.",
    fields: {
      name: "Nome completo",
      email: "E-mail",
      phone: "WhatsApp (com DDD)"
    }
  },

  stickyCta: "Reservar vaga agora",

  disclaimer:
    "Este site não promete ganhos fáceis nem resultados garantidos de vendas. Resultados dependem de execução, mercado e investimento em produto e tráfego. Serviço de desenvolvimento sob contrato."
} as const;
