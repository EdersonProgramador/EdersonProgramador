import {
  AGENCY_CONTRACT_VERSION,
  contractSummaryForTier,
  PACKAGE_TIER_CONFIG,
  PACKAGE_TIER_IDS,
  parsePackageTier,
  type PackageTierId
} from "@ederson-agencia/shared";
import { prisma } from "../prisma.js";

function brl(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export type FunnelPackageDto = {
  id: PackageTierId;
  enabled: boolean;
  name: string;
  tagline: string;
  totalValueCents: number;
  entryValueCents: number;
  bullets: string[];
  contractSummary: ReturnType<typeof contractSummaryForTier>;
};

type PackageOverride = {
  enabled?: boolean;
  name?: string;
  tagline?: string;
  totalValueCents?: number;
  bullets?: string[];
};

function parsePackagesJson(raw: unknown): Partial<Record<PackageTierId, PackageOverride>> {
  if (!raw || typeof raw !== "object") return {};
  return raw as Partial<Record<PackageTierId, PackageOverride>>;
}

export async function getAgencyFunnelConfigRow() {
  return prisma.agencyFunnelConfig.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {}
  });
}

export function resolveFunnelPackages(config: Awaited<ReturnType<typeof getAgencyFunnelConfigRow>>): FunnelPackageDto[] {
  const overrides = parsePackagesJson(config.packagesJson);
  return PACKAGE_TIER_IDS.map((id) => {
    const base = PACKAGE_TIER_CONFIG[id];
    const o = overrides[id];
    const totalValueCents = o?.totalValueCents ?? base.totalValueCents;
    const tier = id;
    const summary = contractSummaryForTier(tier);
    const entryValueCents = Math.round(totalValueCents * (base.entryPercent / 100));
    return {
      id: tier,
      enabled: o?.enabled !== false,
      name: o?.name?.trim() || base.name,
      tagline: o?.tagline?.trim() || base.tagline,
      totalValueCents,
      entryValueCents,
      bullets: o?.bullets?.length ? o.bullets : [base.tagline],
      contractSummary: {
        ...summary,
        tierLabel: o?.name?.trim() || summary.tierLabel,
        totalFormatted: brl(totalValueCents),
        entryFormatted: brl(entryValueCents)
      }
    };
  }).filter((p) => p.enabled);
}

export function funnelConfigPublicDto(config: Awaited<ReturnType<typeof getAgencyFunnelConfigRow>>) {
  const packages = resolveFunnelPackages(config);
  const clauses = Array.isArray(config.contractClausesJson)
    ? (config.contractClausesJson as string[])
    : contractSummaryForTier("professional").clauses;

  return {
    live: config.livePublished
      ? {
          title: config.liveTitle,
          subtitle: config.liveSubtitle,
          scheduledAt: config.liveScheduledAt,
          streamUrl: config.liveStreamUrl,
          replayUrl: config.liveReplayUrl
        }
      : null,
    packages: packages.map(({ id, name, tagline, totalValueCents, entryValueCents, bullets }) => ({
      id,
      name,
      tagline,
      totalValueCents,
      entryValueCents,
      bullets
    })),
    contract: {
      version: AGENCY_CONTRACT_VERSION,
      intro: config.contractIntro,
      clauses
    },
    checkout: {
      title: config.checkoutTitle,
      body: config.checkoutBody,
      pixKey: config.checkoutPixKey
    }
  };
}

export function tierPricingFromConfig(
  config: Awaited<ReturnType<typeof getAgencyFunnelConfigRow>>,
  tierInput: unknown
): { tier: PackageTierId; totalValueCents: number; entryValueCents: number } {
  const tier = parsePackageTier(tierInput) ?? "professional";
  const pkg = resolveFunnelPackages(config).find((p) => p.id === tier);
  if (!pkg) {
    const base = PACKAGE_TIER_CONFIG[tier];
    return {
      tier,
      totalValueCents: base.totalValueCents,
      entryValueCents: Math.round(base.totalValueCents * (base.entryPercent / 100))
    };
  }
  return { tier, totalValueCents: pkg.totalValueCents, entryValueCents: pkg.entryValueCents };
}
