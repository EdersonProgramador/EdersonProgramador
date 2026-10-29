import { ACADEMY_SALES } from "./academy-sales-copy.js";

/** Conteúdo da página pública de cada programa (sem rótulos de seção na UI). */

export type CourseProgramBonus = {
  title: string;
  body: string;
};

export type CourseProgramContent = {
  promise: string;
  deliverables: string[];
  bonus: CourseProgramBonus[];
  guarantee: string;
};

export type PublicCourseProgram = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  priceCents: number;
  currency: string;
  coverUrl?: string | null;
  contentReady?: boolean;
  program: CourseProgramContent;
};

export function academyCourseProgramPath(courseSlug: string): string {
  const slug = courseSlug.replace(/^\/+|\/+$/g, "");
  return `/cursos/${encodeURIComponent(slug)}`;
}

export function buildDefaultCourseProgramContent(course: {
  slug: string;
  title: string;
  summary: string | null;
}): CourseProgramContent {
  const preset = ACADEMY_COURSE_PROGRAM_PRESETS[course.slug];
  if (preset) return preset;

  const summary =
    course.summary?.trim() ||
    `Formação completa em ${course.title}, com trilha guiada, material organizado e acompanhamento na plataforma Academia.`;

  return {
    promise: summary,
    deliverables: [
      "Acesso integral à trilha na Academia Ederson Programador",
      "Progresso salvo e retomada das aulas a qualquer momento",
      "Conteúdo organizado em módulos na ordem recomendada",
      "Certificado digital ao completar 100% (quando disponível no programa)"
    ],
    bonus: ACADEMY_SALES.bonus.items.map((item) => ({
      title: item.title,
      body: item.body
    })),
    guarantee: ACADEMY_SALES.guarantee.body
  };
}

/** Garante `program` mesmo quando a API ainda não envia o campo (deploy pendente). */
export function normalizePublicCourseProgram(
  raw: Omit<PublicCourseProgram, "program"> & { program?: CourseProgramContent | null }
): PublicCourseProgram {
  const base = buildDefaultCourseProgramContent(raw);
  const program = raw.program;
  if (!program?.promise?.trim()) {
    return { ...raw, program: base };
  }
  return {
    ...raw,
    program: {
      promise: program.promise.trim(),
      deliverables: program.deliverables?.length ? program.deliverables : base.deliverables,
      bonus: program.bonus?.length ? program.bonus : base.bonus,
      guarantee: program.guarantee?.trim() || base.guarantee
    }
  };
}

/** Presets por slug — admin pode sobrescrever via `Course.salesPage` no banco. */
export const ACADEMY_COURSE_PROGRAM_PRESETS: Record<string, CourseProgramContent> = {
  "fl-formula-de-lancamento": {
    promise:
      "Sair do zero ao lançamento estruturado: audiência, oferta e execução na ordem do método 6 em 7, com trilha oficial e progresso salvo na plataforma.",
    deliverables: [
      "Trilha completa em módulos sequenciais, do alicerce ao lançamento",
      "Aulas integradas ao canal de estudos com acompanhamento de progresso",
      "Fichamento e organização do aprendizado dentro da Academia",
      "Certificado verificável ao concluir 100% da trilha"
    ],
    bonus: [
      {
        title: "Plataforma de estudos",
        body: "Player, sumário, marcas de conclusão e retomada automática de onde parou."
      },
      {
        title: "Atualizações publicadas",
        body: "Melhorias e ajustes da trilha enquanto o programa estiver ativo na vitrine."
      },
      {
        title: "Suporte por e-mail",
        body: "Canal oficial para dúvidas de acesso e matrícula."
      }
    ],
    guarantee:
      "Sete dias após a confirmação do pagamento para experimentar a plataforma. Se não fizer sentido, solicite reembolso pelo e-mail de suporte indicado na boas-vindas."
  }
};
