/** Visão do processo de criação de marcas (12 etapas) — conteúdo de referência na UI. */

export type BrandingProcessStep = {
  order: number;
  etapaId: string;
  title: string;
  objective: string;
  deliverables: string[];
  investigate?: string[];
  note?: string;
};

export const BRANDING_PROCESS_INTRO =
  "Diagnóstico → Estratégia → Plataforma → Naming → Identidade verbal → Identidade visual → Experiência → Implementação → Gestão e evolução. O processo é estratégico e iterativo: pesquisas e testes podem levar a revisões nas etapas anteriores.";

export const BRANDING_PROCESS_STEPS: readonly BrandingProcessStep[] = [
  {
    order: 1,
    etapaId: "alinhamento",
    title: "Alinhamento e definição do projeto",
    objective:
      "Entender por que a marca será criada ou transformada, o que precisa mudar e como o projeto será considerado bem-sucedido.",
    investigate: [
      "A marca é nova, reposicionada ou precisa de atualização?",
      "Qual problema de negócio o projeto deve resolver?",
      "Produtos, serviços, públicos e decisores no escopo",
      "Restrições de prazo, orçamento, tecnologia ou legislação",
      "Como o resultado será avaliado"
    ],
    deliverables: [
      "Briefing aprovado",
      "Escopo e objetivos com indicadores",
      "Mapa de envolvidos",
      "Cronograma e critérios de aprovação"
    ]
  },
  {
    order: 2,
    etapaId: "diagnostico",
    title: "Diagnóstico e pesquisa",
    objective: "Compreender empresa, pessoas e mercado antes de propor uma marca.",
    investigate: [
      "Organização: história, portfólio, cultura, percepção interna e experiência atual",
      "Mercado: categoria, concorrentes, códigos visuais/verbais e diferenciação",
      "Públicos: necessidades, barreiras, hábitos e percepção da marca"
    ],
    deliverables: [
      "Diagnóstico e síntese de pesquisas",
      "Mapa de públicos",
      "Análise de concorrência",
      "Hipóteses estratégicas a validar"
    ]
  },
  {
    order: 3,
    etapaId: "estrategia",
    title: "Estratégia de negócio e posicionamento",
    objective: "Definir o espaço que a marca ocupa e por que as pessoas devem escolhê-la.",
    deliverables: [
      "Declaração de posicionamento",
      "Proposta de valor e diferenciadores",
      "Prioridades de público",
      "Síntese das escolhas estratégicas"
    ],
    note: "Posicionamento não é slogan — é orientação para produto, comunicação, experiência e negócio."
  },
  {
    order: 4,
    etapaId: "plataforma",
    title: "Plataforma de marca",
    objective: "Transformar estratégia em princípios que orientem criação e comportamento.",
    deliverables: ["Plataforma de marca", "Princípios de decisão", "Hierarquia de mensagens"]
  },
  {
    order: 5,
    etapaId: "arquitetura",
    title: "Arquitetura de marca e portfólio",
    objective: "Organizar relação entre marca principal, produtos, linhas e submarcas.",
    deliverables: ["Modelo de arquitetura", "Mapa de marcas", "Regras de hierarquia e endosso"]
  },
  {
    order: 6,
    etapaId: "naming",
    title: "Naming e disponibilidade",
    objective: "Criar nome adequado à estratégia e avaliar viabilidade.",
    deliverables: ["Critérios de naming", "Shortlist com avaliação", "Recomendação de nome"],
    note: "Buscas preliminares não substituem análise jurídica de registro em cada mercado."
  },
  {
    order: 7,
    etapaId: "identidade-verbal",
    title: "Identidade verbal",
    objective: "Definir como a marca se expressa — tom, vocabulário e mensagens.",
    deliverables: ["Guia de identidade verbal", "Mensagens principais", "Exemplos por canal"]
  },
  {
    order: 8,
    etapaId: "identidade-visual",
    title: "Identidade visual",
    objective: "Sistema visual reconhecível e coerente com estratégia e personalidade.",
    deliverables: ["Sistema de identidade visual", "Manual de aplicação", "Arquivos finais e componentes"]
  },
  {
    order: 9,
    etapaId: "experiencia",
    title: "Experiência e expressão da marca",
    objective: "Fazer a promessa aparecer em todos os pontos de contato — não só na publicidade.",
    deliverables: ["Jornada da experiência", "Princípios de experiência", "Aplicações prioritárias"]
  },
  {
    order: 10,
    etapaId: "implementacao",
    title: "Aplicações, produção e implementação",
    objective: "Transformar o sistema em materiais reais e prontos para uso.",
    deliverables: ["Templates de produção", "Biblioteca de elementos", "Plano de lançamento"]
  },
  {
    order: 11,
    etapaId: "governanca",
    title: "Governança da marca",
    objective: "Manter consistência sem impedir evolução entre equipes.",
    deliverables: ["Guia de governança", "Repositório oficial", "Fluxo de aprovação e treinamento"]
  },
  {
    order: 12,
    etapaId: "medicao",
    title: "Medição e evolução",
    objective: "Verificar compreensão, uso correto e contribuição aos objetivos.",
    deliverables: ["Indicadores de marca", "Linha de base", "Plano de acompanhamento e revisão"]
  }
] as const;

export const BRANDING_APPROVAL_GATES: readonly { question: string; etapaIds: string[] }[] = [
  { question: "Pesquisa: entendemos problema, público e contexto?", etapaIds: ["diagnostico"] },
  { question: "Estratégia: há posicionamento e diferenciação claros?", etapaIds: ["estrategia"] },
  { question: "Plataforma: princípios orientam decisões?", etapaIds: ["plataforma"] },
  { question: "Naming: nome adequado e avaliado quanto à disponibilidade?", etapaIds: ["naming"] },
  { question: "Identidade: expressão verbal e visual traduz a estratégia?", etapaIds: ["identidade-verbal", "identidade-visual"] },
  { question: "Experiência: a promessa aparece nos pontos de contato?", etapaIds: ["experiencia"] },
  { question: "Implementação: equipes conseguem aplicar o sistema?", etapaIds: ["implementacao"] },
  { question: "Gestão: responsáveis, indicadores e rotina de evolução?", etapaIds: ["governanca", "medicao"] }
] as const;

export const BRANDING_FINAL_DELIVERABLES: readonly string[] = [
  "Diagnóstico e pesquisa",
  "Estratégia e posicionamento",
  "Plataforma de marca",
  "Arquitetura de marcas",
  "Naming (quando necessário)",
  "Identidade verbal e visual",
  "Jornada e princípios de experiência",
  "Aplicações prioritárias",
  "Guias de uso e governança",
  "Plano de lançamento",
  "Indicadores e plano de evolução"
] as const;
