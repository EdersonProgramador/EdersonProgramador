/**
 * Copy comercial — App do Zero ao Lançamento (Ederson Programador).
 *
 * Estrutura de jornada (`process.steps`, seções da landing): alinhada ao framework ROMA
 * (ideia → projeto → planejamento → desenvolvimento → testes → lançamento).
 * Uso interno apenas — nenhum texto exibido ao cliente deve nomear ROMA ou a técnica.
 */

export const MARKETING_COPY = {
  brand: "Ederson Programador",
  domainLabel: "edersonprogramador.com.br",

  offer: {
    productName: "App do Zero ao Lançamento",
    productByline: "Ederson Programador · Desenvolvimento de Sistemas e Soluções Tecnológicas",
    productSubtitle:
      "Desenvolvimento de aplicativos e sistemas sob medida, da concepção à implantação, com escopo definido e entrega profissional.",
    promise:
      "Apoiamos empreendedores e empresas a colocar projetos digitais em operação com planejamento técnico, desenvolvimento estruturado e preparação para o mercado.",
    salesSummary: {
      promise:
        "Transformar sua ideia em um aplicativo funcional, com percurso técnico claro do planejamento à implantação.",
      includes:
        "Pacote Essencial, Profissional ou Avançado — cada um com diagnóstico, escopo, desenvolvimento, testes e implantação conforme contrato.",
      bonuses: "Benefícios complementares por pacote (validação, lançamento, evolução e transferência técnica).",
      investment:
        "Referências iniciais: R$ 5.900 (Essencial), R$ 12.900 (Profissional) e a partir de R$ 24.900 (Avançado), sujeitas à avaliação de escopo.",
      guarantee:
        "Garantia de conformidade técnica: 30 dias após entrega e aceite para correção de defeitos previstos no contrato, respeitada a legislação aplicável."
    }
  },

  aida: {
    attention: {
      eyebrow: "App do Zero ao Lançamento",
      title: "Desenvolvimento sob medida, da ideia à implantação.",
      subtitle:
        "Aplicativos e sistemas para empreendedores e empresas — com escopo definido, pacotes claros e acompanhamento técnico em todas as fases.",
      ctaPrimary: "Solicitar proposta",
      ctaSecondary: "Ver como funciona"
    },
    interest: {
      label: "Para quem é",
      title: "Projetos digitais com escopo claro e investimento previsível",
      subtitle:
        "Indicado para quem precisa de execução técnica confiável, sem abrir mão de transparência sobre entregas, prazos e condições comerciais.",
      highlights: [
        "Empreendedores que desejam testar uma solução com um MVP junto a usuários reais",
        "Empresas que necessitam de aplicativo, portal ou sistema com fluxos e integrações definidos",
        "Organizações com regras de negócio, módulos ou integrações que exigem projeto personalizado"
      ],
      pivot:
        "Não é necessário dominar programação. Basta apresentar o contexto do negócio; a proposta formal indicará pacote, escopo, investimento e cronograma."
    },
    desire: {
      label: "Referências",
      title: "Projetos em produção",
      subtitle: "Soluções publicadas e em uso — demonstração de capacidade de entrega ponta a ponta."
    },
    action: {
      label: "Próximo passo",
      title: "Solicite uma proposta para o seu projeto",
      subtitle:
        "Análise inicial, indicação de pacote e condições por escrito — sem compromisso de contratação na primeira conversa.",
      urgencyNote: "Ideia · escopo · desenvolvimento · testes · implantação"
    }
  },

  motivation: {
    label: "Transparência",
    title: "Investimento alinhado ao escopo contratado",
    paragraphs: [
      "Os valores publicados são referências para projetos de escopo controlado. Orçamento definitivo depende de complexidade, integrações, design, plataformas e prazo.",
      "Aplicativos nativos em múltiplas plataformas, sistemas financeiros, plataformas de grande porte e integrações críticas podem demandar investimento superior ao indicado nos pacotes."
    ]
  },

  stats: [
    { value: "5", label: "Etapas", emphasis: "Da ideia ao lançamento", href: "#processo" },
    { value: "3", label: "Pacotes", emphasis: "Essencial · Profissional · Avançado", href: "#pacotes" },
    { value: "2+", label: "Em produção", emphasis: "Cases publicados", href: "#producao" },
    { value: "30d", label: "Conformidade", emphasis: "Garantia contratual", href: "#garantia" }
  ],

  hero: {
    mockupLabel: "Seu aplicativo",
    mockupHint: "Pacotes com escopo fechado · pagamento por marcos · MVP ou produto completo"
  },

  trust: {
    title: "Experiência comprovada em produção",
    subtitle: "Plataformas publicadas, em operação e em evolução contínua."
  },

  process: {
    label: "Como funciona",
    title: "Cinco etapas até o lançamento do seu aplicativo",
    subtitle:
      "Do diagnóstico à implantação, com entregas combinadas e critérios de aceite formalizados no contrato.",
    body:
      "Cada fase avança após alinhamento: requisitos de negócio viram especificação, arquitetura e software testado no escopo acordado.",
    punchline:
      "Você concentra-se no negócio e nas prioridades; a execução técnica conduz o projeto até o ambiente de produção definido.",
    steps: [
      {
        phase: "01",
        title: "Da ideia ao projeto",
        days: "Diagnóstico",
        text: "Compreensão do problema, do público-alvo e da proposta de valor do aplicativo.",
        deliverables: ["Diagnóstico do projeto", "Mapa do problema e personas", "Proposta de valor do produto"],
        mood: "trust" as const
      },
      {
        phase: "02",
        title: "Do projeto ao planejamento",
        days: "Especificação",
        text: "Definição de funcionalidades, requisitos, escopo, prioridades e arquitetura técnica.",
        deliverables: ["Documento de escopo e prioridades", "Planejamento técnico", "Interfaces das telas principais"],
        mood: "desire" as const
      },
      {
        phase: "03",
        title: "Do planejamento ao desenvolvimento",
        days: "Implementação",
        text: "Construção da solução, implementação das funcionalidades e validação da experiência de uso.",
        deliverables: ["Desenvolvimento conforme escopo", "Integrações previstas", "Ambiente de homologação"],
        mood: "logic" as const
      },
      {
        phase: "04",
        title: "Do desenvolvimento aos testes",
        days: "Qualidade",
        text: "Verificação de fluxos, correção de falhas e validação dos requisitos acordados.",
        deliverables: ["Testes funcionais no escopo", "Correções de conformidade", "Registro de aceite por marco"],
        mood: "vault" as const
      },
      {
        phase: "05",
        title: "Dos testes ao lançamento",
        days: "Implantação",
        text: "Preparação do ambiente de produção e, quando contratado, publicação nas plataformas definidas.",
        deliverables: ["Implantação acordada", "Documentação de uso", "Entrega técnica e transferência"],
        mood: "launch" as const
      }
    ]
  },

  deliverables: {
    label: "Base comum",
    title: "O que todos os pacotes observam",
    subtitle:
      "Conteúdo específico de cada tier está descrito nos cartões Essencial, Profissional e Avançado. Itens não listados no contrato não fazem parte do escopo.",
    note:
      "Publicação em lojas, infraestrutura dedicada, integrações com custo de terceiros e manutenção contínua são tratados expressamente na proposta e no contrato.",
    items: [
      "Escopo e entregas definidos antes da assinatura",
      "Desenvolvimento alinhado aos requisitos acordados",
      "Testes e implantação conforme o pacote escolhido",
      "Documentação compatível com a complexidade do projeto",
      "Suporte pós-entrega disponível mediante contrato separado"
    ]
  },

  bonuses: {
    label: "Benefícios complementares",
    title: "Inclusos conforme o pacote contratado",
    items: [
      {
        title: "Validação e evolução",
        text: "Checklist de validação da ideia e mapa de evolução do produto (Essencial e superiores, conforme escopo)."
      },
      {
        title: "Lançamento",
        text: "Checklist de preparação, testes e etapas para disponibilização (Profissional e superiores, conforme escopo)."
      },
      {
        title: "Transferência técnica",
        text: "Demonstração, treinamento de entrega, orientação técnica ou reunião de transferência (conforme pacote)."
      }
    ]
  },

  packages: {
    label: "Pacotes",
    title: "Essencial, Profissional e Avançado",
    subtitle:
      "Preços iniciais sugeridos por projeto, sujeitos à avaliação de escopo. Escolha o pacote mais adequado ao momento do seu negócio.",
    comparison: {
      title: "Comparativo dos pacotes",
      columns: ["Essencial", "Profissional", "Avançado"] as const,
      rows: [
        {
          feature: "Diagnóstico e planejamento",
          essential: "Básico",
          professional: "Completo",
          advanced: "Aprofundado"
        },
        {
          feature: "Desenvolvimento",
          essential: "MVP",
          professional: "Produto mais completo",
          advanced: "Solução personalizada"
        },
        {
          feature: "Integrações",
          essential: "Simples, se previstas",
          professional: "Conforme escopo",
          advanced: "Complexas, se contratadas"
        },
        {
          feature: "Testes e implantação",
          essential: "Básicos",
          professional: "Estruturados",
          advanced: "Definidos por projeto"
        },
        {
          feature: "Documentação",
          essential: "Básica",
          professional: "Técnica básica",
          advanced: "Conforme arquitetura"
        },
        {
          feature: "Suporte após entrega",
          essential: "Contratável à parte",
          professional: "Contratável à parte",
          advanced: "Contratável à parte"
        },
        {
          feature: "Investimento inicial",
          essential: "R$ 5.900",
          professional: "R$ 12.900",
          advanced: "R$ 24.900+"
        }
      ]
    },
    tiers: [
      {
        id: "essential",
        name: "Essencial",
        badge: "Entrada",
        tagline: "Para validar uma ideia",
        audience:
          "Indicado para empreendedores que precisam transformar uma ideia em um MVP — produto mínimo viável — para testar a solução com usuários reais.",
        price: "R$ 5.900",
        priceNote: "Preço inicial sugerido por projeto, sujeito à avaliação de escopo.",
        deliverables: [
          "Diagnóstico inicial do projeto",
          "Definição das funcionalidades essenciais",
          "Planejamento técnico básico",
          "Interface das telas principais",
          "Desenvolvimento de um MVP com escopo limitado",
          "Testes funcionais e correções",
          "Implantação em um ambiente acordado",
          "Orientação básica de utilização"
        ],
        bonus: "Checklist de validação da ideia e mapa de evolução do produto.",
        timeline: "Prazo ilustrativo: 4–6 semanas, após definição dos requisitos e disponibilidade dos materiais."
      },
      {
        id: "professional",
        name: "Profissional",
        badge: "Recomendado",
        recommended: true,
        tagline: "Para construir um produto mais completo",
        audience:
          "Indicado para empresas e empreendedores que necessitam de aplicativo ou sistema com fluxos mais completos e funcionalidades integradas.",
        price: "R$ 12.900",
        priceNote: "Preço inicial sugerido por projeto, sujeito à avaliação de escopo.",
        deliverables: [
          "Diagnóstico e levantamento de requisitos",
          "Especificação funcional do projeto",
          "Arquitetura técnica da solução",
          "Design das principais interfaces",
          "Desenvolvimento do aplicativo ou sistema acordado",
          "Banco de dados e autenticação, quando necessários",
          "Integrações previamente especificadas",
          "Testes e correções de conformidade",
          "Implantação e documentação técnica básica",
          "Demonstração e treinamento de entrega"
        ],
        bonus: "Checklist de lançamento, mapa de evolução e uma sessão de orientação técnica.",
        timeline: "Prazo ilustrativo: 6–10 semanas, dependendo do escopo."
      },
      {
        id: "advanced",
        name: "Avançado",
        badge: "Personalizado",
        tagline: "Para projetos de maior complexidade",
        audience:
          "Indicado para empresas que necessitam de solução personalizada, com múltiplos módulos, regras de negócio específicas ou integrações mais complexas.",
        price: "A partir de R$ 24.900",
        priceNote: "Investimento definido após análise técnica.",
        deliverables: [
          "Descoberta e análise aprofundada do negócio",
          "Especificação detalhada de requisitos",
          "Arquitetura de software e planejamento de dados",
          "Desenvolvimento de módulos personalizados",
          "Integrações com APIs e serviços externos previstos",
          "Painel administrativo, conforme escopo",
          "Testes, validações e correções",
          "Preparação de implantação e documentação",
          "Planejamento de escalabilidade e evolução"
        ],
        bonus: "Roadmap de evolução, reunião de transferência técnica e plano inicial de melhorias.",
        timeline: "Prazo e investimento definidos após análise de complexidade, riscos e requisitos."
      }
    ]
  },

  pricing: {
    label: "Investimento",
    title: "Valores de referência",
    subtitle:
      "Os valores não garantem que qualquer aplicativo possa ser entregue por esses preços. São referências para projetos de escopo controlado.",
    rows: [
      { offer: "Pacote Essencial", range: "R$ 5.900" },
      { offer: "Pacote Profissional", range: "R$ 12.900" },
      { offer: "Pacote Avançado", range: "A partir de R$ 24.900" },
      { offer: "Manutenção e evolução contínua", range: "Proposta mensal" }
    ],
    disclaimer:
      "Aplicativos nativos para múltiplas plataformas, sistemas financeiros, plataformas de grande porte e integrações críticas podem exigir orçamento superior.",
    bullets: [
      "Proposta formal antes da contratação",
      "Escopo fechado por pacote ou aditivo contratual",
      "Critérios de aceite por marco de entrega"
    ]
  },

  commercialTerms: {
    label: "Condições comerciais",
    title: "Como formalizamos a parceria",
    items: [
      {
        title: "Pagamento por marcos",
        body:
          "Exemplo: 40% na contratação, 30% na validação intermediária e 30% na entrega final. Percentuais e marcos são formalizados em contrato, vinculados a entregas e aceite."
      },
      {
        title: "Garantia de conformidade",
        body:
          "30 dias após entrega e aceite para correção de defeitos reproduzíveis que contrariem os requisitos contratados, sem prejuízo dos direitos legais aplicáveis."
      },
      {
        title: "Manutenção recorrente",
        body:
          "Contrato separado para suporte, atualizações e melhorias, com horas, limites de atendimento e serviços incluídos definidos por escrito."
      },
      {
        title: "Custos externos",
        body:
          "Responsabilidade por hospedagem, domínio, APIs, serviços de IA, contas de publicação em lojas e licenças de terceiros definida expressamente na proposta e no contrato."
      }
    ]
  },

  guarantee: {
    label: "Garantia",
    title: "Garantia de conformidade técnica",
    period: "30 dias após entrega e aceite",
    body:
      "Correção, sem custo adicional, de defeitos reproduzíveis que representem descumprimento dos requisitos acordados no contrato.",
    excludes: [
      "Novas funcionalidades ou alteração de escopo",
      "Problemas causados por modificações de terceiros",
      "Indisponibilidade de serviços externos (APIs, lojas, hospedagem)",
      "Custos de hospedagem, APIs, lojas ou licenças de terceiros"
    ],
    legalNote:
      "Início, cobertura e procedimento de atendimento constam do contrato. Quando aplicável, o Código de Defesa do Consumidor prevalece sobre prazos comerciais."
  },

  services: {
    title: "Pilares da entrega",
    subtitle: "Quatro frentes presentes em todos os pacotes, em níveis distintos de profundidade.",
    items: [
      { title: "Diagnóstico e escopo", text: "Clareza antes da implementação.", mood: "trust" as const },
      { title: "Produto e interfaces", text: "Fluxos alinhados ao usuário final.", mood: "desire" as const },
      { title: "Engenharia", text: "Software sustentável e testável.", mood: "logic" as const },
      { title: "Implantação", text: "Testes, deploy e transferência.", mood: "launch" as const }
    ]
  },

  meeting: {
    title: "Apresente seu projeto",
    subtitle: "Primeira etapa: entender fit, complexidade e pacote recomendado.",
    options: [
      {
        title: "Videoconferência de diagnóstico",
        duration: "30 min",
        text: "Alinhamento de objetivos, referências e encaminhamento para proposta com pacote indicado.",
        cta: "Solicitar horário"
      },
      {
        title: "Briefing por mensagem",
        duration: "Assíncrono",
        text: "Descrição do projeto no formulário — retorno com perguntas objetivas ou convite para reunião.",
        cta: "Acessar formulário"
      }
    ],
    agenda: [
      "Problema, público e proposta de valor",
      "Funcionalidades prioritárias da primeira versão",
      "Pacote sugerido e referência de investimento",
      "Próximo passo: proposta formal ou pausa, conforme sua decisão"
    ]
  },

  faq: [
    {
      q: "O que é o App do Zero ao Lançamento?",
      a: "Serviço de desenvolvimento sob medida da Ederson Programador: três pacotes (Essencial, Profissional e Avançado) que cobrem diagnóstico, desenvolvimento, testes e implantação conforme contrato."
    },
    {
      q: "Preciso saber programar?",
      a: "Não. São necessários o contexto de negócio e as decisões de produto; a execução técnica, especificação e entrega ficam a cargo do serviço contratado."
    },
    {
      q: "Qual a diferença entre os pacotes?",
      a: "Essencial entrega MVP para validação (referência R$ 5.900). Profissional cobre produto mais completo com integrações previstas (R$ 12.900). Avançado trata complexidade e personalização (a partir de R$ 24.900)."
    },
    {
      q: "Publicação na App Store ou Play Store está incluída?",
      a: "Somente se constar no escopo contratado. Muitos projetos iniciam em web ou MVP sem lojas na primeira versão."
    },
    {
      q: "Como funciona o pagamento?",
      a: "Recomenda-se pagamento por marcos (ex.: 40% / 30% / 30%), com percentuais e entregas definidos em contrato e aceite por fase."
    },
    {
      q: "Como funciona a garantia?",
      a: "30 dias após aceite para correção de defeitos de conformidade com o contratado — não inclui escopo novo. Detalhes e legislação aplicável constam do contrato."
    }
  ],

  cta: {
    title: "Solicitar proposta",
    subtitle: "Informe seu projeto, pacote de interesse (se já definido) e prazo desejado. Resposta objetiva, sem envio indiscriminado de mensagens.",
    formTitle: "Formulário de contato"
  },

  footer: {
    tagline: "Desenvolvimento de Sistemas e Soluções Tecnológicas.",
    rights: "Todos os direitos reservados.",
    legalLinks: [
      { id: "privacidade", label: "Privacidade" },
      { id: "termos", label: "Termos de uso" }
    ] as const
  },

  loginCta: "Área do cliente"
} as const;
