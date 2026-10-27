/** Textos da área de cursos (portal + catálogo + player). */

/** Padrão de mercado (Udemy, Hotmart, Kiwify): capa 16:9 em 1280×720 px. */
export const COURSE_COVER = {
  aspectRatio: "16:9",
  width: 1280,
  height: 720,
  adminHint:
    "URL da capa em 1280×720 px (16:9), JPG/PNG/WebP. Use CDN, Vercel Blob ou link público estável."
} as const;

export const FL_COURSE = {
  slug: "fl-formula-de-lancamento",
  title: "Academia interna — Fórmula de Lançamento (6 em 7)",
  summary:
    "Trilha completa na ordem oficial do método: alicerce, audiência, lançamentos e execução. Assista às aulas pelo Telegram (canal de estudos) e acompanhe seu progresso aqui no portal.",
  coverUrl: "/course-covers/fl-formula-de-lancamento.png"
} as const;

export const COURSES_UI = {
  hub: {
    cardTitle: "Academia & cursos",
    cardBody:
      "Trilhas de formação do time, com progresso salvo na sua conta. Novos conteúdos entram pelo administrador."
  },
  catalog: {
    title: "Academia",
    subtitle:
      "Cursos internos da Ederson Programador. Escolha uma trilha e continue de onde parou.",
    badgeInternal: "Equipe",
    badgeSale: "Em breve — venda online",
    lockedHint: "Este curso será liberado após a compra (pagamento ainda em preparação).",
    enter: "Acessar trilha",
    contentNotReady: "Trilha ainda sem conteúdo vinculado (contentKey fl no admin).",
    openFlTrail: "Abrir trilha FL",
    empty: "Nenhum curso publicado ainda.",
    loading: "Carregando cursos…"
  },
  study: {
    loading: "Carregando trilha…",
    sidebarEyebrow: "Trilha de estudos",
    sidebarSubtitle: "Siga a ordem das aulas",
    searchPlaceholder: "Buscar por código (F042) ou palavra-chave…",
    progressLabel: "Aulas concluídas",
    welcomeHint:
      "As videoaulas estão no canal de estudos no Telegram. Em cada aula, use o botão Abrir no Telegram (mesma conta com acesso ao grupo).",
    startButton: "Iniciar pela primeira aula",
    bonusModule: "Bônus",
    markDone: "Marcar aula como concluída",
    markUndone: "Desmarcar conclusão",
    lessonCompleted: "Aula concluída",
    lessonPending: "Ainda não concluída",
    statusDone: "Concluída",
    statusPending: "Pendente",
    statusActive: "Em andamento",
    moduleProgress: (done: number, total: number) => `${done}/${total} aulas`,
    pdfFallback: "PDF ainda não está no servidor — abra a aula no Telegram ou veja os materiais abaixo.",
    telegramPrimary:
      "Assista no Telegram: canal privado de estudos. Entre com a conta que tem acesso ao grupo.",
    telegramBackup: "Também disponível no Telegram, caso prefira assistir por lá.",
    telegramOpen: "Abrir no Telegram",
    telegramIndex: "Índice no Telegram",
    telegramRef: "Ref. da aula"
  }
} as const;
