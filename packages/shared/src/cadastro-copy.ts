/**
 * Página /cadastro — estrutura tipo funil ao vivo (marquee, VSL, formulário, autoridade).
 */

export const CADASTRO_PATH = "/cadastro";

export const CADASTRO_COPY = {
  meta: {
    title: "Workshop App do Zero ao Lançamento | Ederson Programador",
    description:
      "Cadastro gratuito: aula ao vivo sobre MVP, escopo e as 5 etapas para colocar seu app no ar. Vagas limitadas."
  },

  marquee: ["EDERSON PROGRAMADOR", "APP DO ZERO AO LANÇAMENTO", "AULA GRATUITA AO VIVO"] as const,

  workshop: {
    badge: "Workshop",
    titleLine1: "APP DO ZERO",
    titleLine2: "AO LANÇAMENTO"
  },

  /** Imagens estáticas — arquivos em apps/web/public/cadastro/ (mesmos nomes). */
  images: {
    workshopLockup: {
      path: "/cadastro/workshop-lockup.webp",
      src: null as string | null,
      alt: "App do Zero ao Lançamento — identidade visual do workshop",
      label: "Arte do workshop (topo)",
      hint: "WebP/PNG ~1200×420 px — equivalente ao título gráfico da página de referência"
    },
    vslPoster: {
      path: "/cadastro/vsl-poster.webp",
      src: null as string | null,
      alt: "Capa do vídeo de apresentação",
      label: "Imagem / capa do VSL",
      hint: "16:9 — 1920×1080 px. Usada quando não há embed YouTube/Vimeo no admin"
    },
    hostPrimary: {
      path: "/cadastro/host-ederson.webp",
      src: null as string | null,
      alt: "Ederson Programador",
      label: "Foto — anfitrião 1",
      hint: "Retrato 4:5 — ~900×1125 px"
    },
    hostSecondary: {
      path: "/cadastro/host-plataforma.webp",
      src: null as string | null,
      alt: "Plataforma e funil do cliente",
      label: "Foto — anfitrião 2 / parceiro",
      hint: "Retrato 4:5 — ~900×1125 px"
    },
    footerLockup: {
      path: "/cadastro/footer-logos.webp",
      src: null as string | null,
      alt: "Logos Ederson Programador",
      label: "Logos no rodapé",
      hint: "PNG/WebP largo ~800×120 px (duas marcas lado a lado, como na referência)"
    }
  },

  urgency: {
    dates: "Próxima turma · em breve",
    time: "Às 19h30",
    free: "100% gratuito",
    liveTag: "Ao vivo · SEM replay",
    limited: "Vagas limitadas. Inscreva-se para garantir sua participação."
  },

  /** Texto descritivo abaixo da barra de datas/horário no topo. */
  descriptiveHeadline:
    "Workshop gratuito para quem quer lançar app ou sistema: da ideia ao MVP, com as 5 etapas usadas em projetos reais — escopo fechado, prazo claro e próximo passo na plataforma após a live.",

  descriptiveHeadlineSupport:
    "Sem promessa vazia: você entende diagnóstico, especificação, desenvolvimento, testes e implantação antes de investir no pacote certo.",

  video: {
    unmuteHint: "Assista à apresentação antes de se cadastrar",
    fallbackTitle: "App do Zero ao Lançamento — aula gratuita",
    explanatoryHeadline:
      "Nesta apresentação você entende o caminho da ideia ao produto no ar: MVP, marcos de entrega, critérios de aceite e como evitar escopo infinito ou fornecedor errado.",
    explanatorySupport:
      "Ao terminar, use o formulário abaixo para garantir sua vaga na live e criar acesso à Área do cliente (senha, confirmação e próximos passos do funil)."
  },

  hero: {
    lead:
      "Universo digital + método profissional: como transformar sua ideia em um produto no ar, com escopo fechado e investimento previsível — sem contratar errado.",
    hook:
      "Você já pensou em lançar um app ou sistema. Agora descubra o caminho completo da ideia ao MVP, com as 5 etapas usadas em projetos reais em produção.",
    body:
      "No workshop de lançamento App do Zero ao Lançamento, você entende diagnóstico, especificação, desenvolvimento, testes e implantação — e como continuar no funil da plataforma após a live (pacote, contrato e checkout).",
    bullets: [
      "Como transformar sua ideia em escopo mínimo testável (MVP).",
      "As 5 etapas do App do Zero ao Lançamento.",
      "Lançamento de produtos digitais com marcos e critérios de aceite."
    ]
  },

  hosts: [
    {
      name: "Ederson Programador",
      tag: "Desenvolvimento sob medida",
      bio:
        "Prestação de serviços de software com projetos em produção e método em 5 etapas (Ideia → Plano → Build → QA → Lançamento). Foco em escopo fechado, prazo e entrega — não é curso genérico de programação.",
      stat: { value: "5", label: "etapas do método" }
    },
    {
      name: "Plataforma do cliente",
      tag: "Funil integrado",
      bio:
        "Após o cadastro, você acessa a Área do cliente: confirma a live, escolhe pacote, assina contrato PF/PJ e conclui checkout — tudo sincronizado com a operação da agência.",
      stat: { value: "1", label: "cadastro · live · contrato" }
    }
  ] as const,

  stats: [
    { value: "5", label: "Etapas", detail: "Ideia → lançamento" },
    { value: "3+", label: "Pacotes", detail: "Essencial a Avançado" },
    { value: "90 min", label: "Live", detail: "Aula gratuita" }
  ] as const,

  closing:
    "Com este roteiro, em uma aula ao vivo você conhece o caminho para colocar seu produto digital no ar com clareza de escopo e próximo passo dentro da plataforma — para quem se encaixa no perfil e nas vagas abertas.",

  form: {
    title: "Garanta sua vaga gratuita",
    subtitle: "Leva menos de 1 minuto. Após o cadastro, acesse a Área do cliente com o e-mail e a senha abaixo.",
    submit: "Quero participar de graça",
    submitSticky: "QUERO PARTICIPAR DE GRAÇA",
    passwordLegend: "Crie sua senha para acessar a Área do cliente após o cadastro",
    successHint: "Redirecionando para a Área do cliente…",
    fields: {
      name: "Seu nome",
      email: "Seu melhor e-mail",
      phone: "Seu WhatsApp (DDD + Telefone)",
      password: "Senha (mín. 6 caracteres)",
      passwordConfirm: "Confirme a senha",
      company: "Empresa (opcional)",
      challenge: "Qual seu maior desafio com o app ou a ideia? (opcional)"
    }
  },

  footer: {
    copyright: "© Ederson Programador — Todos os direitos reservados",
    site: "edersonprogramador.com.br",
    disclaimer:
      "Não há garantia de resultados financeiros, profissionais ou comerciais. Os resultados podem variar conforme escopo, investimento e execução do projeto.",
    metaDisclaimer:
      "Este site não é afiliado, patrocinado ou endossado pelo Google ou pela Meta. Google e Meta são marcas de seus respectivos proprietários.",
    backHome: "Site institucional"
  }
} as const;
