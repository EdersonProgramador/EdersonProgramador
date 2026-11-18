/**
 * Quiz de qualificação — /formulario
 * Pesquisa dinâmica (estilo Forms/quiz) alinhada à proposta App do Zero ao Lançamento.
 */

export const QUALIFICATION_FORM_PATH = "/formulario";

/** URL pública para campanhas, bio e QR. */
export const QUALIFICATION_FORM_PUBLIC_URL = "https://www.edersonprogramador.com.br/formulario";

export const BR_UF_OPTIONS = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" }
] as const;

export const QUALIFICATION_FORM_COPY = {
  meta: {
    title: "Diagnóstico rápido | Ederson Programador",
    description:
      "Quiz de qualificação: perfil, objetivos e obstáculos para uma proposta alinhada ao seu momento."
  },

  brand: "Ederson Programador",
  kicker: "Diagnóstico de proposta",
  welcomeTitle: "Vamos entender o seu momento",
  welcomeBody:
    "Respostas rápidas, uma por vez. Em poucos minutos eu monto o próximo passo certo para a sua ideia — da clareza à proposta.",
  welcomeCta: "Começar o diagnóstico",
  progressLabel: "Progresso",
  back: "Voltar",
  next: "Continuar",
  submit: "Enviar diagnóstico",
  submitting: "Enviando…",
  successTitle: "Diagnóstico recebido",
  successBody:
    "Obrigado. Vou analisar suas respostas e entrar em contato com o próximo passo alinhado à sua proposta.",
  successCta: "Voltar ao início",
  requiredHint: "Selecione uma opção para continuar.",
  openRequiredHint: "Preencha este campo para continuar.",
  contactRequiredHint: "Preencha nome, e-mail e WhatsApp válidos.",

  sections: {
    contact: "Contato",
    demographics: "Perfil",
    time: "Contexto",
    specific: "Momento",
    open: "Direção"
  },

  questions: {
    name: {
      id: "name",
      section: "contact" as const,
      type: "text" as const,
      label: "Qual é o seu nome?",
      placeholder: "Seu nome completo",
      autoComplete: "name",
      required: true
    },
    email: {
      id: "email",
      section: "contact" as const,
      type: "email" as const,
      label: "Qual o melhor e-mail para retorno?",
      placeholder: "voce@empresa.com",
      autoComplete: "email",
      required: true
    },
    phone: {
      id: "phone",
      section: "contact" as const,
      type: "tel" as const,
      label: "WhatsApp para alinharmos a proposta?",
      placeholder: "(11) 99999-9999",
      autoComplete: "tel",
      required: true
    },
    sex: {
      id: "sex",
      section: "demographics" as const,
      type: "choice" as const,
      label: "Sexo",
      hint: "Dado demográfico para personalizar a comunicação.",
      required: true,
      options: [
        { value: "feminino", label: "Feminino" },
        { value: "masculino", label: "Masculino" },
        { value: "outro", label: "Outro" },
        { value: "nao_informar", label: "Prefiro não informar" }
      ]
    },
    age: {
      id: "age",
      section: "demographics" as const,
      type: "choice" as const,
      label: "Faixa etária",
      required: true,
      options: [
        { value: "18_24", label: "18–24" },
        { value: "25_34", label: "25–34" },
        { value: "35_44", label: "35–44" },
        { value: "45_54", label: "45–54" },
        { value: "55_plus", label: "55+" }
      ]
    },
    state: {
      id: "state",
      section: "demographics" as const,
      type: "select" as const,
      label: "Em qual estado você está?",
      placeholder: "Selecione o estado",
      required: true
    },
    knowHowLong: {
      id: "knowHowLong",
      section: "time" as const,
      type: "choice" as const,
      label: "Há quanto tempo você me conhece?",
      required: true,
      options: [
        { value: "hoje", label: "Acabei de conhecer" },
        { value: "semanas", label: "Há algumas semanas" },
        { value: "meses", label: "Há alguns meses" },
        { value: "anos", label: "Há um ano ou mais" }
      ]
    },
    productAwareness: {
      id: "productAwareness",
      section: "time" as const,
      type: "choice" as const,
      label: "Você sabe como criar e lançar um produto digital do zero ao lançamento?",
      hint: "Consciência sobre o produto / método.",
      required: true,
      options: [
        { value: "sim", label: "Sim, tenho clareza do caminho" },
        { value: "parcial", label: "Mais ou menos — conheço partes" },
        { value: "nao", label: "Ainda não" }
      ]
    },
    profile: {
      id: "profile",
      section: "specific" as const,
      type: "choice" as const,
      label: "Qual perfil melhor descreve você hoje?",
      required: true,
      options: [
        { value: "iniciante", label: "Iniciante no empreendedorismo" },
        { value: "profissional_liberal", label: "Profissional liberal" },
        { value: "empreendedor", label: "Empreendedor" },
        { value: "investidor", label: "Investidor" }
      ]
    },
    marketingExperience: {
      id: "marketingExperience",
      section: "specific" as const,
      type: "choice" as const,
      label: "Você tem experiência em marketing?",
      required: true,
      options: [
        { value: "sim", label: "Sim" },
        { value: "pouco", label: "Um pouco" },
        { value: "nao", label: "Não" }
      ]
    },
    goals: {
      id: "goals",
      section: "open" as const,
      type: "textarea" as const,
      label: "Quais são os seus objetivos?",
      placeholder: "Ex.: validar a ideia, lançar um MVP, atrair clientes, estruturar a oferta…",
      required: true,
      minLength: 12
    },
    obstacles: {
      id: "obstacles",
      section: "open" as const,
      type: "textarea" as const,
      label: "Quais são os principais obstáculos hoje?",
      placeholder: "Ex.: falta de clareza, tempo, capital, equipe técnica, marketing…",
      required: true,
      minLength: 12
    }
  }
} as const;

export type QualificationAnswerKey = keyof typeof QUALIFICATION_FORM_COPY.questions;

export const QUALIFICATION_STEP_ORDER: QualificationAnswerKey[] = [
  "name",
  "email",
  "phone",
  "sex",
  "age",
  "state",
  "knowHowLong",
  "productAwareness",
  "profile",
  "marketingExperience",
  "goals",
  "obstacles"
];
