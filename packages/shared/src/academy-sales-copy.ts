/** Página institucional de vendas — Academia Ederson Programador */

export const ACADEMY_SALES = {
  brand: "Academia Ederson Programador",
  nav: [
    { href: "#caminho", label: "Seu caminho" },
    { href: "#cursos", label: "Cursos" },
    { href: "#bonus", label: "Bônus" },
    { href: "#garantia", label: "Garantia" }
  ] as const,
  hero: {
    headline: "Formação prática para quem quer executar — não só assistir aula",
    subheadline:
      "Programas publicados pela Academia Ederson Programador: trilhas organizadas, progresso na plataforma e suporte para aplicar o método no seu ritmo."
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
        title: "Finalize com PIX ou cartão",
        body: "Informe nome e e-mail. Os dados da compra ficam vinculados à sua conta de aluno na Academia."
      },
      {
        title: "Receba o acesso por e-mail",
        body: "Enviamos login, link da plataforma e orientações para entrar em Meus cursos e iniciar a trilha."
      },
      {
        title: "Estude com progresso salvo",
        body: "Aulas, fichamento e certificado (quando aplicável) ficam na sua conta — continue de onde parou."
      }
    ]
  },
  courses: {
    title: "Cursos e preços",
    subtitle: "Valores publicados na vitrine. Matrícula liberada após confirmação do pagamento.",
    empty: "Novos programas em breve. Acompanhe esta página ou fale conosco.",
    selectLabel: "Quero este curso",
    formTitle: "Dados para matrícula e nota fiscal",
    name: "Nome completo",
    email: "E-mail (receberá o acesso)",
    phone: "WhatsApp (opcional)",
    payment: "Forma de pagamento",
    pix: "PIX",
    card: "Cartão",
    terms:
      "Li e aceito os termos: acesso digital à plataforma Academia, uso pessoal e política de reembolso conforme garantia abaixo.",
    submit: "Confirmar compra",
    submitting: "Processando…",
    successTitle: "Compra registrada!",
    successBody:
      "Enviamos as instruções de acesso para o e-mail informado. Se não encontrar, verifique spam ou promoções.",
    loginCta: "Já recebeu? Entrar na Academia"
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
