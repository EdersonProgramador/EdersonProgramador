/** Definição das 12 etapas do sistema de criação de marcas — campos do workspace. */

import type { BrandingEtapaDef } from "./branding-workspace.js";

function fid(etapa: string, section: string, field: string): string {
  return `branding:${etapa}:${section}:${field}`;
}

export const BRANDING_ETAPAS_DATA: readonly BrandingEtapaDef[] = [
  {
    id: "alinhamento",
    order: 1,
    emoji: "📋",
    navLabel: "Alinhamento",
    title: "Etapa 1: Alinhamento e definição do projeto",
    subtitle: "Por que a marca será criada ou transformada, o que deve mudar e como medir sucesso.",
    sections: [
      {
        id: "contexto",
        title: "Contexto do projeto",
        intro: "Nova marca, reposicionamento ou atualização — problema de negócio e escopo.",
        fields: [
          {
            id: fid("alinhamento", "contexto", "situacao"),
            label: "Situação da marca (nova / reposicionamento / atualização)",
            type: "textarea"
          },
          {
            id: fid("alinhamento", "contexto", "problema"),
            label: "Problema de negócio a resolver",
            type: "textarea"
          },
          {
            id: fid("alinhamento", "contexto", "escopo"),
            label: "Produtos, serviços e públicos no escopo",
            type: "textarea"
          },
          {
            id: fid("alinhamento", "contexto", "restricoes"),
            label: "Restrições (prazo, orçamento, tecnologia, legislação)",
            type: "textarea"
          }
        ]
      },
      {
        id: "briefing",
        title: "Briefing e governança do projeto",
        fields: [
          {
            id: fid("alinhamento", "briefing", "notas"),
            label: "Briefing aprovado (texto)",
            type: "textarea",
            placeholder: "Resumo validado com o cliente…"
          },
          {
            id: fid("alinhamento", "briefing", "objetivos"),
            label: "Objetivos e indicadores de sucesso",
            type: "textarea"
          },
          {
            id: fid("alinhamento", "briefing", "stakeholders"),
            label: "Envolvidos e responsáveis",
            type: "repeater",
            columns: [
              { key: "nome", label: "Nome", input: "text" },
              { key: "papel", label: "Papel", input: "text" },
              { key: "responsabilidade", label: "Responsabilidade", input: "textarea" }
            ]
          },
          {
            id: fid("alinhamento", "briefing", "cronograma"),
            label: "Cronograma e critérios de aprovação",
            type: "repeater",
            columns: [
              { key: "marco", label: "Marco", input: "text" },
              { key: "data", label: "Data", input: "text" },
              { key: "criterio", label: "Critério de aprovação", input: "textarea" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "diagnostico",
    order: 2,
    emoji: "🔍",
    navLabel: "Diagnóstico",
    title: "Etapa 2: Diagnóstico e pesquisa",
    subtitle: "Contexto da empresa, mercado e públicos antes de qualquer proposta de marca.",
    sections: [
      {
        id: "organizacao",
        title: "Organização",
        fields: [
          {
            id: fid("diagnostico", "organizacao", "historia"),
            label: "História, propósito atual e objetivos",
            type: "textarea"
          },
          {
            id: fid("diagnostico", "organizacao", "modelo"),
            label: "Portfólio, modelo de receita e planos",
            type: "textarea"
          },
          {
            id: fid("diagnostico", "organizacao", "cultura"),
            label: "Cultura, capacidades e percepção interna",
            type: "textarea"
          }
        ]
      },
      {
        id: "briefing",
        title: "Notas de imersão (complementar)",
        fields: [
          {
            id: fid("diagnostico", "briefing", "notas"),
            label: "Notas consolidadas de reuniões",
            type: "textarea"
          },
          {
            id: fid("diagnostico", "briefing", "audio"),
            label: "Gravações de áudio",
            type: "files",
            acceptHint: "MP3, WAV, M4A"
          }
        ]
      },
      {
        id: "persona",
        title: "Públicos e persona",
        fields: [
          {
            id: fid("diagnostico", "persona", "resumo"),
            label: "Síntese de públicos e persona",
            type: "textarea"
          },
          {
            id: fid("diagnostico", "persona", "entrevistas"),
            label: "Registros de entrevistas",
            type: "repeater",
            columns: [
              { key: "publico", label: "Público", input: "text" },
              { key: "necessidade", label: "Necessidade", input: "textarea" },
              { key: "barreira", label: "Barreira / dúvida", input: "textarea" },
              { key: "citacao", label: "Citação", input: "textarea" }
            ]
          }
        ]
      },
      {
        id: "benchmark",
        title: "Mercado e concorrência",
        fields: [
          {
            id: fid("diagnostico", "benchmark", "matriz"),
            label: "Análise de concorrentes",
            type: "repeater",
            columns: [
              { key: "marca", label: "Marca", input: "text" },
              { key: "posicionamento", label: "Posicionamento", input: "textarea" },
              { key: "visual", label: "Códigos visuais", input: "textarea" },
              { key: "verbal", label: "Códigos verbais", input: "textarea" },
              { key: "oportunidade", label: "Oportunidade", input: "textarea" }
            ]
          },
          {
            id: fid("diagnostico", "benchmark", "hipoteses"),
            label: "Hipóteses estratégicas a validar",
            type: "textarea"
          },
          {
            id: fid("diagnostico", "benchmark", "evidencias"),
            label: "Evidências e anexos",
            type: "files"
          }
        ]
      },
      {
        id: "audit",
        title: "Auditoria (marca existente)",
        fields: [
          {
            id: fid("diagnostico", "audit", "diagnostico"),
            label: "Diagnóstico de canais e materiais",
            type: "textarea"
          },
          {
            id: fid("diagnostico", "audit", "links"),
            label: "Links auditados",
            type: "repeater",
            columns: [
              { key: "canal", label: "Canal", input: "text" },
              { key: "url", label: "URL", input: "url" },
              { key: "problema", label: "Inconsistência", input: "textarea" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "estrategia",
    order: 3,
    emoji: "🎯",
    navLabel: "Estratégia",
    title: "Etapa 3: Estratégia de negócio e posicionamento",
    subtitle: "Espaço que a marca ocupa e por que as pessoas devem escolhê-la.",
    sections: [
      {
        id: "posicionamento",
        title: "Posicionamento e proposta de valor",
        fields: [
          {
            id: fid("estrategia", "posicionamento", "categoria"),
            label: "Categoria e mercado de atuação",
            type: "textarea"
          },
          {
            id: fid("estrategia", "posicionamento", "publico"),
            label: "Público prioritário",
            type: "textarea"
          },
          {
            id: fid("plataforma", "posicionamento", "declaracao"),
            label: "Declaração de posicionamento",
            type: "textarea",
            description: "Orientação para produto, comunicação e experiência — não é slogan."
          },
          {
            id: fid("estrategia", "posicionamento", "proposta-valor"),
            label: "Proposta de valor",
            type: "textarea"
          },
          {
            id: fid("estrategia", "posicionamento", "diferenciacao"),
            label: "Diferenciação e provas",
            type: "textarea"
          },
          {
            id: fid("estrategia", "posicionamento", "objetivos"),
            label: "Objetivos de negócio apoiados pela marca",
            type: "textarea"
          }
        ]
      }
    ]
  },
  {
    id: "plataforma",
    order: 4,
    emoji: "🧭",
    navLabel: "Plataforma",
    title: "Etapa 4: Plataforma de marca",
    subtitle: "Princípios que orientam criação, comunicação e comportamento.",
    sections: [
      {
        id: "proposito",
        title: "Propósito, missão e visão",
        fields: [
          { id: fid("plataforma", "proposito", "texto"), label: "Propósito", type: "textarea" },
          { id: fid("plataforma", "cultura", "missao"), label: "Missão", type: "textarea" },
          { id: fid("plataforma", "cultura", "visao"), label: "Visão", type: "textarea" },
          { id: fid("plataforma", "cultura", "valores"), label: "Valores", type: "textarea" }
        ]
      },
      {
        id: "essencia",
        title: "Essência, promessa e personalidade",
        fields: [
          { id: fid("plataforma", "essencia", "ideia"), label: "Essência (ideia central)", type: "textarea" },
          { id: fid("plataforma", "essencia", "promessa"), label: "Promessa de marca", type: "textarea" },
          { id: fid("plataforma", "personalidade", "atributos"), label: "Personalidade da marca", type: "textarea" },
          { id: fid("plataforma", "personalidade", "pilares"), label: "Pilares de atuação", type: "textarea" },
          { id: fid("plataforma", "territorio", "temas"), label: "Território e temas de comunicação", type: "textarea" }
        ]
      },
      {
        id: "mensagens",
        title: "Hierarquia e critérios",
        fields: [
          { id: fid("plataforma", "mensagens", "hierarquia"), label: "Hierarquia de mensagens", type: "textarea" },
          { id: fid("plataforma", "mensagens", "criterios"), label: "Critérios para avaliar ideias futuras", type: "textarea" }
        ]
      }
    ]
  },
  {
    id: "arquitetura",
    order: 5,
    emoji: "🏗️",
    navLabel: "Arquitetura",
    title: "Etapa 5: Arquitetura de marca e portfólio",
    subtitle: "Relação entre marca principal, produtos, linhas e submarcas.",
    sections: [
      {
        id: "modelo",
        title: "Modelo e mapa",
        fields: [
          { id: fid("arquitetura", "modelo", "tipo"), label: "Modelo (monolítica, endorser, house of brands…)", type: "textarea" },
          {
            id: fid("arquitetura", "modelo", "mapa"),
            label: "Mapa de marcas e produtos",
            type: "repeater",
            columns: [
              { key: "nome", label: "Nome", input: "text" },
              { key: "tipo", label: "Tipo", input: "text" },
              { key: "relacao", label: "Relação com marca mãe", input: "textarea" }
            ]
          },
          { id: fid("arquitetura", "modelo", "regras"), label: "Regras de hierarquia, endosso e extensões", type: "textarea" }
        ]
      }
    ]
  },
  {
    id: "naming",
    order: 6,
    emoji: "✏️",
    navLabel: "Naming",
    title: "Etapa 6: Naming e disponibilidade",
    subtitle: "Nome adequado à estratégia com triagem de domínio, redes e registro.",
    sections: [
      {
        id: "processo",
        title: "Critérios e exploração",
        fields: [
          { id: fid("naming", "processo", "criterios"), label: "Critérios para o nome", type: "textarea" },
          { id: fid("naming", "processo", "territorios"), label: "Territórios de significado e linguagem", type: "textarea" },
          {
            id: fid("identidade", "verbal", "naming-opcoes"),
            label: "Shortlist de nomes (studio)",
            type: "naming-studio",
            description: "Avaliação, racional e nome recomendado — alimenta Produto e FL."
          },
          { id: fid("naming", "processo", "disponibilidade"), label: "Notas de domínio, redes e marcas (pré-triagem)", type: "textarea" }
        ]
      }
    ]
  },
  {
    id: "identidade-verbal",
    order: 7,
    emoji: "💬",
    navLabel: "Identidade verbal",
    title: "Etapa 7: Identidade verbal",
    subtitle: "Tom de voz, vocabulário e mensagens da marca.",
    sections: [
      {
        id: "voz",
        title: "Tom e vocabulário",
        fields: [
          { id: fid("plataforma", "voz", "voz"), label: "Voz da marca", type: "textarea" },
          {
            id: fid("plataforma", "voz", "tom-canais"),
            label: "Tom por canal",
            type: "repeater",
            columns: [
              { key: "canal", label: "Canal", input: "text" },
              { key: "tom", label: "Tom", input: "textarea" },
              { key: "exemplo", label: "Exemplo", input: "textarea" }
            ]
          },
          { id: fid("identidade", "verbal", "vocabulario"), label: "Vocabulário preferencial e termos a evitar", type: "textarea" }
        ]
      },
      {
        id: "mensagens",
        title: "Mensagens e apresentação",
        fields: [
          { id: fid("identidade", "verbal", "tagline"), label: "Tagline / slogan", type: "text" },
          { id: fid("identidade", "verbal", "manifesto"), label: "Manifesto de marca", type: "textarea" },
          { id: fid("identidade", "verbal", "apresentacao"), label: "Apresentação curta e longa", type: "textarea" },
          { id: fid("identidade", "verbal", "acessibilidade"), label: "Linguagem inclusiva e acessibilidade", type: "textarea" }
        ]
      }
    ]
  },
  {
    id: "identidade-visual",
    order: 8,
    emoji: "🎨",
    navLabel: "Identidade visual",
    title: "Etapa 8: Identidade visual",
    subtitle: "Sistema visual coerente com estratégia — logo, cores, tipografia e grafismo.",
    sections: [
      {
        id: "visual",
        title: "Sistema visual",
        fields: [
          { id: fid("identidade", "visual", "logo-notas"), label: "Rationale do logotipo", type: "textarea" },
          { id: fid("identidade", "visual", "logo-arquivos"), label: "Arquivos de logo", type: "files", acceptHint: "SVG, PNG, AI, PDF" },
          {
            id: fid("identidade", "visual", "paleta"),
            label: "Paleta de cores (studio)",
            type: "palette",
            description: "Sincroniza com Dev e export Canva."
          },
          { id: fid("identidade", "visual", "tipografia"), label: "Tipografias oficiais", type: "textarea" },
          { id: fid("identidade", "visual", "grafismos"), label: "Grafismos, iconografia e direção de arte", type: "textarea" },
          { id: fid("identidade", "visual", "moodboard"), label: "Moodboard e referências", type: "files" },
          { id: fid("identidade", "visual", "acessibilidade"), label: "Contraste e acessibilidade", type: "textarea" }
        ]
      }
    ]
  },
  {
    id: "experiencia",
    order: 9,
    emoji: "🤝",
    navLabel: "Experiência",
    title: "Etapa 9: Experiência e expressão da marca",
    subtitle: "Promessa da marca em cada ponto de contato.",
    sections: [
      {
        id: "jornada",
        title: "Jornada e pontos de contato",
        fields: [
          {
            id: fid("experiencia", "jornada", "pontos"),
            label: "Mapa de pontos de contato",
            type: "repeater",
            columns: [
              { key: "ponto", label: "Ponto de contato", input: "text" },
              { key: "comportamento", label: "Como a marca se comporta", input: "textarea" },
              { key: "mensagem", label: "Mensagem", input: "textarea" },
              { key: "responsavel", label: "Responsável", input: "text" }
            ]
          },
          { id: fid("experiencia", "jornada", "principios"), label: "Princípios de experiência", type: "textarea" }
        ]
      }
    ]
  },
  {
    id: "implementacao",
    order: 10,
    emoji: "📦",
    navLabel: "Implementação",
    title: "Etapa 10: Aplicações, produção e implementação",
    subtitle: "Materiais reais, templates e plano de lançamento.",
    sections: [
      {
        id: "producao",
        title: "Produção e biblioteca",
        fields: [
          { id: fid("implementacao", "producao", "templates"), label: "Templates e arquivos de produção", type: "files" },
          { id: fid("implementacao", "producao", "fornecedores"), label: "Especificações para fornecedores", type: "textarea" },
          { id: fid("implementacao", "producao", "substituicao"), label: "Plano de substituição de materiais", type: "textarea" }
        ]
      },
      {
        id: "contatos",
        title: "Aplicações por canal",
        fields: [
          { id: fid("implementacao", "contatos", "digital"), label: "Digital (site, app, redes)", type: "textarea" },
          { id: fid("implementacao", "contatos", "comercial"), label: "Comercial e vendas", type: "textarea" },
          { id: fid("implementacao", "contatos", "fisico"), label: "Físico e espaços", type: "textarea" }
        ]
      },
      {
        id: "ativacao",
        title: "Lançamento",
        fields: [
          { id: fid("implementacao", "ativacao", "plano"), label: "Plano de lançamento e comunicação", type: "textarea" },
          {
            id: fid("implementacao", "ativacao", "cronograma"),
            label: "Cronograma de ativação",
            type: "repeater",
            columns: [
              { key: "data", label: "Data", input: "text" },
              { key: "acao", label: "Ação", input: "textarea" },
              { key: "canal", label: "Canal", input: "text" }
            ]
          },
          { id: fid("implementacao", "ativacao", "criativos"), label: "Criativos de lançamento", type: "files" }
        ]
      }
    ]
  },
  {
    id: "governanca",
    order: 11,
    emoji: "⚖️",
    navLabel: "Governança",
    title: "Etapa 11: Governança da marca",
    subtitle: "Consistência, repositório oficial e fluxo de aprovação.",
    sections: [
      {
        id: "governo",
        title: "Responsáveis e fluxos",
        fields: [
          { id: fid("governanca", "governo", "responsaveis"), label: "Quem responde e aprova a marca", type: "textarea" },
          { id: fid("governanca", "governo", "repositorio"), label: "Repositório oficial de ativos (URL)", type: "url" },
          { id: fid("governanca", "governo", "solicitacoes"), label: "Como solicitar peças e exceções", type: "textarea" },
          { id: fid("governanca", "governo", "parceiros"), label: "Regras para fornecedores e parceiros", type: "textarea" },
          {
            id: fid("implementacao", "brandbook", "arquivo"),
            label: "Brandbook / manual (arquivo)",
            type: "file"
          },
          {
            id: fid("implementacao", "brandbook", "url"),
            label: "Link online do manual",
            type: "url"
          }
        ]
      }
    ]
  },
  {
    id: "medicao",
    order: 12,
    emoji: "📈",
    navLabel: "Medição",
    title: "Etapa 12: Medição e evolução",
    subtitle: "Indicadores, linha de base e rotina de revisão.",
    sections: [
      {
        id: "indicadores",
        title: "Acompanhamento",
        fields: [
          {
            id: fid("medicao", "indicadores", "kpis"),
            label: "Indicadores de marca",
            type: "repeater",
            columns: [
              { key: "indicador", label: "Indicador", input: "text" },
              { key: "baseline", label: "Linha de base", input: "text" },
              { key: "meta", label: "Meta", input: "text" },
              { key: "frequencia", label: "Frequência", input: "text" }
            ]
          },
          { id: fid("medicao", "indicadores", "revisao"), label: "Rotina de revisão e aprendizado", type: "textarea" },
          { id: fid("medicao", "indicadores", "evolucao"), label: "Recomendações de evolução", type: "textarea" }
        ]
      }
    ]
  }
] as const;
