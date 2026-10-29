/** Página institucional de vendas — Academia Ederson Programador */

export const ACADEMY_SALES = {
  brand: "Academia Ederson Programador",
  nav: [
    { href: "#caminho", label: "Seu caminho" },
    { href: "#cursos", label: "Cursos" },
    { href: "#proposta", label: "Proposta" },
    { href: "#bonus", label: "Bônus" },
    { href: "#garantia", label: "Garantia" }
  ] as const,
  hero: {
    headline: "Formação prática para quem quer executar — não só assistir aula",
    subheadline:
      "Programas publicados pela Academia Ederson Programador: trilhas organizadas, progresso na plataforma e suporte para aplicar o método no seu ritmo.",
    trustLine: "Garantia de 7 dias · Acesso imediato · PIX e cartão",
    primaryCta: "Ver cursos disponíveis"
  },
  path: {
    title: "Transformação / Caminho",
    subtitle: "Do interesse à matrícula, você sabe exatamente o que acontece em cada etapa.",
    steps: [
      {
        title: "Escolha o programa",
        body: "Compare objetivos, investimento e o que está incluso. Cada curso na vitrine é publicado pelo admin com preço e conteúdo ativo."
      },
      {
        title: "Receba a proposta",
        body: "Deixe nome, e-mail e WhatsApp na lista. Enviamos orientações e condições do programa que você selecionou."
      },
      {
        title: "Checkout seguro",
        body: "Quando decidir, finalize na página de compra do curso com PIX ou cartão — matrícula vinculada à sua conta na Academia."
      },
      {
        title: "Estude com progresso salvo",
        body: "Aulas, fichamento e certificado (quando aplicável) ficam na sua conta — continue de onde parou."
      }
    ]
  },
  courses: {
    title: "Cursos em destaque",
    subtitle: "Programas da Academia — escolha um card para ver a oferta completa.",
    instructor: "Academia Ederson Programador",
    badgeActive: "Conteúdo ativo",
    badgePreparing: "Em breve",
    loading: "Carregando cursos…",
    loadError: "A vitrine está temporariamente indisponível. Atualize a página ou peça sua proposta abaixo.",
    loadErrorCta: "Receber proposta",
    empty: "Novos programas em breve. Acompanhe esta página ou fale conosco.",
    offerTitle: "Oferta do programa",
    offerHint: "Finalize a matrícula na página de checkout do programa.",
    acquireCta: "Ir para checkout",
    selectPrompt: "Clique em um curso acima para ver a oferta completa.",
    contentReady: "Conteúdo disponível na plataforma",
    contentPending: "Conteúdo em preparação — compra liberada conforme publicação",
    loginCta: "Já recebeu? Entrar na Academia"
  },
  lead: {
    formTitle: "Receba a proposta e entre na lista",
    name: "Nome completo",
    email: "E-mail",
    phone: "WhatsApp",
    terms:
      "Autorizo contato por e-mail e WhatsApp sobre cursos da Academia e aceito o uso dos dados conforme a política de privacidade.",
    submit: "Quero receber a proposta",
    submitting: "Enviando…",
    successTitle: "Dados recebidos!",
    successBody: "Em breve você recebe a proposta e orientações no e-mail informado."
  },
  checkout: {
    backToStore: "Voltar aos cursos",
    title: "Finalizar matrícula",
    summaryTitle: "Resumo do pedido",
    formTitle: "Dados para matrícula e nota fiscal",
    name: "Nome completo",
    email: "E-mail (receberá o acesso)",
    phone: "WhatsApp (opcional)",
    payment: "Forma de pagamento",
    pix: "PIX",
    card: "Cartão",
    terms:
      "Li e aceito os termos: acesso digital à plataforma Academia, uso pessoal e política de reembolso conforme garantia.",
    submit: "Confirmar compra",
    submitting: "Processando…",
    successTitle: "Compra registrada!",
    successBody:
      "Enviamos as instruções de acesso para o e-mail informado. Se não encontrar, verifique spam ou promoções.",
    notFound: "Curso não encontrado ou indisponível para compra.",
    secureNote: "Ambiente seguro · confirmação imediata da matrícula (pagamento simulado até integração do gateway)"
  },
  bonus: {
    title: "Bônus",
    subtitle: "Benefícios inclusos na experiência Academia (conforme programa adquirido).",
    items: [
      {
        title: "Plataforma de estudos",
        body: "Player de trilha, sumário, progresso e fichamento integrados — tudo na mesma conta."
      },
      {
        title: "Atualizações do programa",
        body: "Enquanto o curso estiver ativo na vitrine, você acessa melhorias publicadas na trilha."
      },
      {
        title: "Certificado de conclusão",
        body: "Ao completar 100% da trilha, emita certificado verificável com código público."
      }
    ]
  },
  guarantee: {
    title: "Garantia",
    subtitle: "Compromisso claro para você decidir com segurança.",
    body:
      "Garantia incondicional de 7 dias a partir da confirmação do pagamento. Se o programa não fizer sentido para você, solicite reembolso pelo e-mail de suporte informado na mensagem de boas-vindas. Após o prazo, permanece o acesso conforme contrato digital da compra.",
    supportEmail: "contato@edersonprogramador.com.br"
  },
  footer: {
    portal: "Área do aluno",
    agency: "Agência / projetos"
  }
} as const;
