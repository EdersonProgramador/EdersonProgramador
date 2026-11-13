/** Campos derivados — valores efetivos a partir de fontes canônicas (piloto). */

export type ProjectWorkspaceFeedRule = {
  /** Campo lógico consumido por Marketing / FL / export. */
  targetId: string;
  label: string;
  /** Ordem de prioridade: primeira fonte preenchida vence. */
  sourceFieldIds: readonly string[];
};

export const PROJECT_WORKSPACE_FEED_RULES: readonly ProjectWorkspaceFeedRule[] = [
  {
    targetId: "launch:copy:promessa",
    label: "Promessa do lançamento",
    sourceFieldIds: [
      "product:offer:promessa-fl",
      "branding:plataforma:posicionamento:declaracao",
      "branding:estrategia:posicionamento:proposta-valor",
      "branding:plataforma:proposito:texto",
      "branding:diagnostico:persona:resumo"
    ]
  },
  {
    targetId: "launch:copy:tagline",
    label: "Tagline / slogan",
    sourceFieldIds: ["branding:identidade:verbal:tagline"]
  },
  {
    targetId: "launch:copy:manifesto",
    label: "Manifesto",
    sourceFieldIds: ["branding:identidade:verbal:manifesto"]
  },
  {
    targetId: "marketing:persona:resumo",
    label: "Persona (marketing)",
    sourceFieldIds: ["branding:diagnostico:persona:resumo"]
  },
  {
    targetId: "marketing:seo:territorio",
    label: "Território de conteúdo",
    sourceFieldIds: ["branding:plataforma:territorio:temas"]
  },
  {
    targetId: "dev:brand:cores",
    label: "Paleta (dev/design)",
    sourceFieldIds: ["branding:identidade:visual:paleta"]
  },
  {
    targetId: "dev:brand:tipografia",
    label: "Tipografias",
    sourceFieldIds: ["branding:identidade:visual:tipografia"]
  },
  {
    targetId: "product:offer:nome",
    label: "Nome comercial do produto",
    sourceFieldIds: [
      "product:core:nome",
      "branding:identidade:verbal:naming-opcoes",
      "branding:alinhamento:briefing:notas",
      "branding:diagnostico:briefing:notas"
    ]
  },
  {
    targetId: "marketing:checkout:url",
    label: "URL de checkout",
    sourceFieldIds: ["product:gateway:checkout-url"]
  },
  {
    targetId: "dev:deploy:gateway-product-id",
    label: "ID produto (gateway)",
    sourceFieldIds: ["product:gateway:product-id"]
  }
] as const;
