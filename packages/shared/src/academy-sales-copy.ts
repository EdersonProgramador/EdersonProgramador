/** Página institucional de vendas — Academia Ederson Programador */

export const ACADEMY_SALES = {
  brand: "Academia Ederson Programador",
  nav: [
    { href: "#instituicao", label: "A Academia" },
    { href: "#programas", label: "Programas" },
    { href: "#proposta", label: "Contato" }
  ] as const,
  hero: {
    headline: "Formação em tecnologia e execução digital",
    subheadline:
      "Ambiente de estudos com trilhas publicadas, corpo docente orientado à prática e matrícula digital — como uma faculdade online enxuta, focada em quem precisa aplicar.",
    trustLine: "Matrícula online · Trilhas na plataforma · Acompanhamento de progresso",
    primaryCta: "Conhecer os programas"
  },
  institute: {
    title: "Ambiente de formação contínua",
    body:
      "Cada programa possui página própria com objetivo da formação, entregas, complementos, investimento e condições — tudo organizado para você decidir com clareza, sem ruído.",
    pillars: [
      { title: "Trilhas publicadas", body: "Conteúdo em módulos, ordem recomendada e evolução registrada na sua conta." },
      { title: "Matrícula digital", body: "Inscrição e pagamento online; acesso liberado na Academia após confirmação." },
      { title: "Certificação", body: "Emissão de certificado verificável quando a trilha exigir conclusão integral." }
    ]
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
    title: "Programas abertos para matrícula",
    subtitle: "Selecione um programa para ver a página completa da formação.",
    openProgram: "Ver formação",
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
