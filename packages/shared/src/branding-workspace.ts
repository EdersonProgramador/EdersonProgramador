/** Operação Branding — 4 etapas, seções e campos de captura por projeto/cliente. */

import {
  brandingNamingStudioValueEmpty,
  brandingPaletteValueEmpty,
  isBrandingNamingStudioValue,
  isBrandingPaletteValue,
  parseBrandingNamingField,
  parseBrandingPaletteField,
  type BrandingNamingStudioValue,
  type BrandingPaletteValue
} from "./branding-studio.js";

export type BrandingEtapaId = "diagnostico" | "plataforma" | "identidade" | "implementacao";

export type BrandingFieldType =
  | "text"
  | "textarea"
  | "url"
  | "audio"
  | "video"
  | "file"
  | "files"
  | "repeater"
  | "palette"
  | "naming-studio";

export type BrandingRepeaterColumn = {
  key: string;
  label: string;
  input: "text" | "textarea" | "url";
};

export type BrandingFieldDef = {
  id: string;
  label: string;
  description?: string;
  type: BrandingFieldType;
  placeholder?: string;
  columns?: BrandingRepeaterColumn[];
  acceptHint?: string;
};

export type BrandingSectionDef = {
  id: string;
  title: string;
  intro?: string;
  fields: BrandingFieldDef[];
};

export type BrandingEtapaDef = {
  id: BrandingEtapaId;
  order: number;
  emoji: string;
  navLabel: string;
  title: string;
  subtitle: string;
  sections: BrandingSectionDef[];
};

export type BrandingMediaAsset = {
  url: string;
  name: string;
  mimeType?: string;
  uploadedAt?: string;
};

export type BrandingRepeaterValue = { rows: Record<string, string>[] };

export type BrandingFieldValue =
  | string
  | BrandingMediaAsset
  | BrandingMediaAsset[]
  | BrandingRepeaterValue
  | BrandingPaletteValue
  | BrandingNamingStudioValue;

export type BrandingWorkspaceData = Record<string, BrandingFieldValue>;

const E1 = "diagnostico" as const;
const E2 = "plataforma" as const;
const E3 = "identidade" as const;
const E4 = "implementacao" as const;

function fid(etapa: string, section: string, field: string): string {
  return `branding:${etapa}:${section}:${field}`;
}

export const BRANDING_ETAPAS: readonly BrandingEtapaDef[] = [
  {
    id: E1,
    order: 1,
    emoji: "🏛️",
    navLabel: "Diagnóstico e pesquisa",
    title: "Etapa 1: Diagnóstico e Pesquisa (Imersão)",
    subtitle:
      "Fundação e inteligência — extrair dados e entender o cenário real. Nenhum design ou texto final aqui; só imersão.",
    sections: [
      {
        id: "briefing",
        title: "Briefing estruturado e alinhamento",
        intro: "Reuniões com fundadores: história, objetivos comerciais, metas de faturamento e visão de futuro.",
        fields: [
          {
            id: fid(E1, "briefing", "notas"),
            label: "Notas do briefing (texto)",
            type: "textarea",
            placeholder: "Resumo das reuniões, decisões e pendências…"
          },
          {
            id: fid(E1, "briefing", "audio"),
            label: "Gravações de áudio",
            type: "files",
            acceptHint: "MP3, WAV, M4A, OGG"
          },
          {
            id: fid(E1, "briefing", "video-url"),
            label: "Vídeo (link YouTube/Vimeo/Drive)",
            type: "url",
            placeholder: "https://…"
          },
          {
            id: fid(E1, "briefing", "video-file"),
            label: "Vídeo (arquivo enviado)",
            type: "video",
            acceptHint: "MP4, WebM, MOV"
          },
          {
            id: fid(E1, "briefing", "form-stakeholders"),
            label: "Stakeholders entrevistados",
            type: "repeater",
            columns: [
              { key: "nome", label: "Nome", input: "text" },
              { key: "cargo", label: "Cargo", input: "text" },
              { key: "insights", label: "Principais insights", input: "textarea" }
            ]
          }
        ]
      },
      {
        id: "persona",
        title: "Pesquisa de público-alvo e persona",
        intro: "Entrevistas, questionários ou dados: dores, desejos, frustrações, estilo de vida e o que valorizam.",
        fields: [
          {
            id: fid(E1, "persona", "resumo"),
            label: "Síntese da persona",
            type: "textarea"
          },
          {
            id: fid(E1, "persona", "questionario"),
            label: "Questionário / formulário (anexo)",
            type: "file",
            acceptHint: "PDF, DOCX, planilha"
          },
          {
            id: fid(E1, "persona", "entrevistas"),
            label: "Registros de entrevistas",
            type: "repeater",
            columns: [
              { key: "participante", label: "Participante", input: "text" },
              { key: "data", label: "Data", input: "text" },
              { key: "dor", label: "Dores", input: "textarea" },
              { key: "desejo", label: "Desejos", input: "textarea" },
              { key: "citacao", label: "Citação marcante", input: "textarea" }
            ]
          },
          {
            id: fid(E1, "persona", "audio"),
            label: "Áudios de entrevistas",
            type: "files",
            acceptHint: "Áudio"
          }
        ]
      },
      {
        id: "benchmark",
        title: "Análise de concorrência (benchmarking)",
        intro: "Mapeamento visual, verbal e estratégico — brechas e diferenciais.",
        fields: [
          {
            id: fid(E1, "benchmark", "matriz"),
            label: "Matriz de concorrentes",
            type: "repeater",
            columns: [
              { key: "marca", label: "Marca", input: "text" },
              { key: "posicionamento", label: "Posicionamento", input: "textarea" },
              { key: "visual", label: "Identidade visual", input: "textarea" },
              { key: "verbal", label: "Identidade verbal", input: "textarea" },
              { key: "brecha", label: "Oportunidade / brecha", input: "textarea" }
            ]
          },
          {
            id: fid(E1, "benchmark", "evidencias"),
            label: "Capturas e materiais de referência",
            type: "files",
            acceptHint: "Imagens, PDFs"
          }
        ]
      },
      {
        id: "audit",
        title: "Auditoria de marca (brand audit)",
        intro: "Se a marca já existe: site, redes, fachadas — ruídos e inconsistências.",
        fields: [
          {
            id: fid(E1, "audit", "diagnostico"),
            label: "Relatório de auditoria",
            type: "textarea"
          },
          {
            id: fid(E1, "audit", "links"),
            label: "Links auditados",
            type: "repeater",
            columns: [
              { key: "canal", label: "Canal / material", input: "text" },
              { key: "url", label: "URL", input: "url" },
              { key: "problema", label: "Inconsistência encontrada", input: "textarea" }
            ]
          },
          {
            id: fid(E1, "audit", "anexos"),
            label: "Anexos (prints, vídeos)",
            type: "files"
          }
        ]
      }
    ]
  },
  {
    id: E2,
    order: 2,
    emoji: "🎯",
    navLabel: "Plataforma de marca",
    title: "Etapa 2: Plataforma de Marca (Estratégia)",
    subtitle: "DNA invisível do negócio — bússola para marketing, design, vendas e atendimento.",
    sections: [
      {
        id: "cultura",
        title: "Cultura organizacional",
        fields: [
          { id: fid(E2, "cultura", "missao"), label: "Missão", type: "textarea" },
          { id: fid(E2, "cultura", "visao"), label: "Visão", type: "textarea" },
          { id: fid(E2, "cultura", "valores"), label: "Valores (princípios inegociáveis)", type: "textarea" }
        ]
      },
      {
        id: "proposito",
        title: "Propósito de marca",
        fields: [
          {
            id: fid(E2, "proposito", "texto"),
            label: "Propósito (razão de ser além do lucro)",
            type: "textarea"
          },
          {
            id: fid(E2, "proposito", "video"),
            label: "Vídeo / pitch do propósito",
            type: "video"
          }
        ]
      },
      {
        id: "posicionamento",
        title: "Posicionamento de marca",
        fields: [
          {
            id: fid(E2, "posicionamento", "declaracao"),
            label: "Declaração de posicionamento",
            type: "textarea",
            placeholder: "Espaço único na mente do consumidor…"
          },
          {
            id: fid(E2, "posicionamento", "diferenciais"),
            label: "Diferenciais competitivos",
            type: "textarea"
          }
        ]
      },
      {
        id: "personalidade",
        title: "Atributos de personalidade",
        fields: [
          {
            id: fid(E2, "personalidade", "atributos"),
            label: "Se a marca fosse uma pessoa…",
            type: "textarea"
          },
          {
            id: fid(E2, "personalidade", "nao-somos"),
            label: "O que a marca NÃO é",
            type: "textarea"
          }
        ]
      },
      {
        id: "territorio",
        title: "Território de marca",
        fields: [
          {
            id: fid(E2, "territorio", "temas"),
            label: "Universos, temas e causas",
            type: "textarea"
          },
          {
            id: fid(E2, "territorio", "limites"),
            label: "Assuntos proibidos / fora de território",
            type: "textarea"
          }
        ]
      },
      {
        id: "voz",
        title: "Voz e tom de voz",
        fields: [
          { id: fid(E2, "voz", "voz"), label: "Voz da marca (constante)", type: "textarea" },
          {
            id: fid(E2, "voz", "tom-canais"),
            label: "Tom por canal / situação",
            type: "repeater",
            columns: [
              { key: "canal", label: "Canal ou situação", input: "text" },
              { key: "tom", label: "Tom", input: "textarea" },
              { key: "exemplo", label: "Exemplo de frase", input: "textarea" }
            ]
          },
          {
            id: fid(E2, "voz", "guia-pdf"),
            label: "Guia de voz (PDF)",
            type: "file"
          }
        ]
      }
    ]
  },
  {
    id: E3,
    order: 3,
    emoji: "🎨",
    navLabel: "Identidade da marca",
    title: "Etapa 3: Identidade da Marca (Criação)",
    subtitle: "Conceito ganha palavras, som e imagem — identidade verbal e visual.",
    sections: [
      {
        id: "verbal",
        title: "Identidade verbal",
        intro: "Naming, tagline e manifesto.",
        fields: [
          {
            id: fid(E3, "verbal", "naming-processo"),
            label: "Processo de naming (notas e critérios)",
            type: "textarea"
          },
          {
            id: fid(E3, "verbal", "naming-opcoes"),
            label: "Opções de nome (studio)",
            description: "Shortlist, nota e nome aprovado — alimenta Produto e FL.",
            type: "naming-studio"
          },
          { id: fid(E3, "verbal", "tagline"), label: "Tagline / slogan", type: "text" },
          { id: fid(E3, "verbal", "manifesto"), label: "Manifesto de marca", type: "textarea" },
          { id: fid(E3, "verbal", "manifesto-audio"), label: "Manifesto (áudio narrado)", type: "audio" }
        ]
      },
      {
        id: "visual",
        title: "Identidade visual",
        intro: "Logotipo, cores, tipografia e universo gráfico.",
        fields: [
          {
            id: fid(E3, "visual", "logo-notas"),
            label: "Briefing e rationale do logotipo",
            type: "textarea"
          },
          {
            id: fid(E3, "visual", "logo-arquivos"),
            label: "Arquivos de logo (versões)",
            type: "files",
            acceptHint: "SVG, PNG, AI, PDF"
          },
          {
            id: fid(E3, "visual", "paleta"),
            label: "Paleta de cores (studio)",
            description: "Cores oficiais com papéis — sincroniza com Dev e export Canva.",
            type: "palette"
          },
          {
            id: fid(E3, "visual", "tipografia"),
            label: "Tipografias oficiais",
            type: "textarea"
          },
          {
            id: fid(E3, "visual", "grafismos"),
            label: "Grafismos, patterns, iconografia, fotografia",
            type: "textarea"
          },
          {
            id: fid(E3, "visual", "moodboard"),
            label: "Moodboard / referências visuais",
            type: "files"
          }
        ]
      }
    ]
  },
  {
    id: E4,
    order: 4,
    emoji: "📦",
    navLabel: "Implementação e gestão",
    title: "Etapa 4: Implementação e Gestão (Diretrizes & Ativação)",
    subtitle: "Brandbook, pontos de contato, endobranding e lançamento ao mercado.",
    sections: [
      {
        id: "brandbook",
        title: "Manual da marca (brandbook)",
        fields: [
          {
            id: fid(E4, "brandbook", "arquivo"),
            label: "Brandbook (PDF / link)",
            type: "file"
          },
          {
            id: fid(E4, "brandbook", "url"),
            label: "Link online do manual",
            type: "url"
          },
          {
            id: fid(E4, "brandbook", "notas"),
            label: "Regras críticas de uso (resumo)",
            type: "textarea"
          }
        ]
      },
      {
        id: "contatos",
        title: "Design de pontos de contato",
        fields: [
          {
            id: fid(E4, "contatos", "corporativo"),
            label: "Corporativo (cartão, papel timbrado, e-mail, decks)",
            type: "textarea"
          },
          {
            id: fid(E4, "contatos", "digital"),
            label: "Digital (social, site, LP, app)",
            type: "textarea"
          },
          {
            id: fid(E4, "contatos", "fisico"),
            label: "Físico (embalagem, uniforme, fachada…)",
            type: "textarea"
          },
          {
            id: fid(E4, "contatos", "entregas"),
            label: "Arquivos de entrega",
            type: "files"
          }
        ]
      },
      {
        id: "endobranding",
        title: "Endobranding (lançamento interno)",
        fields: [
          {
            id: fid(E4, "endobranding", "plano"),
            label: "Plano de alinhamento interno",
            type: "textarea"
          },
          {
            id: fid(E4, "endobranding", "materiais"),
            label: "Materiais de treinamento",
            type: "files"
          },
          {
            id: fid(E4, "endobranding", "video"),
            label: "Vídeo / apresentação interna",
            type: "video"
          }
        ]
      },
      {
        id: "ativacao",
        title: "Ativação de marca (lançamento ao mercado)",
        fields: [
          {
            id: fid(E4, "ativacao", "campanha"),
            label: "Plano de campanha e RP",
            type: "textarea"
          },
          {
            id: fid(E4, "ativacao", "cronograma"),
            label: "Cronograma de ativação",
            type: "repeater",
            columns: [
              { key: "data", label: "Data", input: "text" },
              { key: "acao", label: "Ação", input: "textarea" },
              { key: "canal", label: "Canal", input: "text" }
            ]
          },
          {
            id: fid(E4, "ativacao", "criativos"),
            label: "Criativos e peças de lançamento",
            type: "files"
          }
        ]
      }
    ]
  }
] as const;

export function getBrandingEtapa(id: string): BrandingEtapaDef | undefined {
  return BRANDING_ETAPAS.find((e) => e.id === id);
}

export function brandingEtapaAdminPath(etapaId: BrandingEtapaId): string {
  return `operacao/branding/${etapaId}`;
}

export function isBrandingFieldValueEmpty(value: BrandingFieldValue | undefined): boolean {
  if (value === undefined || value === null) return true;
  if (isBrandingPaletteValue(value)) return brandingPaletteValueEmpty(value);
  if (isBrandingNamingStudioValue(value)) return brandingNamingStudioValueEmpty(value);
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if ("url" in value && !("rows" in value)) return !value.url?.trim();
  if ("rows" in value && Array.isArray((value as BrandingRepeaterValue).rows)) {
    const rows = (value as BrandingRepeaterValue).rows;
    if (rows.length === 0) return true;
    return rows.every((row) => Object.values(row).every((c) => !String(c ?? "").trim()));
  }
  return true;
}

export function brandingEtapaProgress(
  etapa: BrandingEtapaDef,
  data: BrandingWorkspaceData
): { total: number; done: number; percent: number } {
  let total = 0;
  let done = 0;
  for (const section of etapa.sections) {
    for (const field of section.fields) {
      total += 1;
      if (!isBrandingFieldValueEmpty(data[field.id])) done += 1;
    }
  }
  return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export function brandingWorkspaceProgress(data: BrandingWorkspaceData): {
  total: number;
  done: number;
  percent: number;
} {
  let total = 0;
  let done = 0;
  for (const etapa of BRANDING_ETAPAS) {
    const p = brandingEtapaProgress(etapa, data);
    total += p.total;
    done += p.done;
  }
  return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export function parseBrandingWorkspaceJson(raw: unknown): BrandingWorkspaceData {
  if (raw == null) return {};
  if (typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as BrandingWorkspaceData;
}

export function adjacentBrandingEtapa(
  currentId: BrandingEtapaId,
  direction: "prev" | "next"
): BrandingEtapaDef | null {
  const index = BRANDING_ETAPAS.findIndex((e) => e.id === currentId);
  const next = direction === "prev" ? index - 1 : index + 1;
  return BRANDING_ETAPAS[next] ?? null;
}
