import { contractSummaryForTier } from "./agency-funnel-copy.js";
import { CONTRACT_COPY } from "./contract-copy.js";
import { MARKETING_COPY } from "./marketing-copy.js";
import { PACKAGE_TIER_CONFIG, PACKAGE_TIER_IDS, type PackageTierId } from "./project-journey.js";
import { SEED_LAUNCH_COPY } from "./seed-launch-copy.js";

export type FunnelPackageJson = Partial<
  Record<
    PackageTierId,
    {
      enabled?: boolean;
      name?: string;
      tagline?: string;
      totalValueCents?: number;
      bullets?: string[];
    }
  >
>;

/** Pacotes alinhados à seção #pacotes da landing institucional. */
export function buildInstitutionalPackagesJson(): FunnelPackageJson {
  const byId = Object.fromEntries(MARKETING_COPY.packages.tiers.map((t) => [t.id, t])) as Record<
    PackageTierId,
    (typeof MARKETING_COPY.packages.tiers)[number]
  >;

  const out: FunnelPackageJson = {};
  for (const id of PACKAGE_TIER_IDS) {
    const tier = byId[id];
    const base = PACKAGE_TIER_CONFIG[id];
    out[id] = {
      enabled: true,
      name: tier.name,
      tagline: tier.tagline,
      totalValueCents: base.totalValueCents,
      bullets: [
        tier.audience,
        ...tier.deliverables.slice(0, 4),
        tier.bonus,
        tier.timeline
      ].filter(Boolean)
    };
  }
  return out;
}

function institutionalContractClauses(): string[] {
  const base = contractSummaryForTier("professional").clauses;
  const terms = MARKETING_COPY.commercialTerms.items;
  const payment = terms.find((t) => t.title === "Pagamento por marcos")?.body;
  const guarantee = MARKETING_COPY.guarantee.body;
  const external = terms.find((t) => t.title === "Custos externos")?.body;
  const scope = MARKETING_COPY.deliverables.note;
  return [
    ...base,
    CONTRACT_COPY.contractorHighlights[2].text,
    payment ?? "Pagamento por marcos conforme contrato (entrada, marco intermediário e entrega final).",
    guarantee,
    external ?? "",
    scope
  ].filter((line) => line.trim().length > 0);
}

/** Valores iniciais do funil comercial (live, pacotes, contrato, checkout). */
export function institutionalFunnelDbDefaults() {
  const payment = MARKETING_COPY.commercialTerms.items.find((t) => t.title === "Pagamento por marcos");
  const live = SEED_LAUNCH_COPY.live;

  return {
    livePublished: true,
    liveTitle: `${MARKETING_COPY.offer.productName} — ${SEED_LAUNCH_COPY.event.badge}`,
    liveSubtitle: [
      live.title,
      SEED_LAUNCH_COPY.event.format,
      SEED_LAUNCH_COPY.event.duration,
      live.note
    ].join(" · "),
    liveStreamUrl: null as string | null,
    liveReplayUrl: null as string | null,
    liveScheduledAt: null as Date | null,
    packagesJson: buildInstitutionalPackagesJson(),
    contractIntro: [
      MARKETING_COPY.offer.productSubtitle,
      MARKETING_COPY.pricing.disclaimer
    ].join(" "),
    contractClausesJson: institutionalContractClauses(),
    checkoutTitle: "Entrada na contratação (40%)",
    checkoutBody: [
      payment?.body ??
        "Exemplo: 40% na contratação, 30% na validação intermediária e 30% na entrega final — conforme contrato.",
      "Transfira a entrada via PIX usando a chave abaixo. Depois marque a confirmação para liberar a jornada de desenvolvimento."
    ].join("\n\n"),
    checkoutPixKey: null as string | null
  };
}
