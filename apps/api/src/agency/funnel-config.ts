import {
  AGENCY_CONTRACT_VERSION,
  contractSummaryForTier,
  institutionalFunnelDbDefaults,
  entryValueCentsForTier,
  PACKAGE_TIER_CONFIG,
  PACKAGE_TIER_IDS,
  parsePackageTier,
  type PackageTierId
} from "@ederson-agencia/shared";
import { prisma } from "../prisma.js";

type AgencyFunnelConfigRow = NonNullable<Awaited<ReturnType<typeof prisma.agencyFunnelConfig.findUnique>>>;

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

function isEmptyJsonObject(raw: unknown): boolean {
  return !raw || (typeof raw === "object" && !Array.isArray(raw) && Object.keys(raw as object).length === 0);
}

function needsInstitutionalBackfill(row: AgencyFunnelConfigRow): boolean {
  return (
    isEmptyJsonObject(row.packagesJson) ||
    !row.contractIntro?.trim() ||
    !Array.isArray(row.contractClausesJson) ||
    (row.contractClausesJson as unknown[]).length === 0 ||
    !row.checkoutTitle?.trim() ||
    !row.checkoutBody?.trim()
  );
}

async function applyInstitutionalBackfill(row: AgencyFunnelConfigRow, force: boolean) {
  const defaults = institutionalFunnelDbDefaults();
  if (!force && !needsInstitutionalBackfill(row)) return row;

  const data: Parameters<typeof prisma.agencyFunnelConfig.update>[0]["data"] = force
    ? {
        livePublished: defaults.livePublished,
        liveTitle: defaults.liveTitle,
        liveSubtitle: defaults.liveSubtitle,
        packagesJson: defaults.packagesJson,
        contractIntro: defaults.contractIntro,
        contractClausesJson: defaults.contractClausesJson,
        checkoutTitle: defaults.checkoutTitle,
        checkoutBody: defaults.checkoutBody
      }
    : {
        livePublished: row.livePublished ? row.livePublished : defaults.livePublished,
        liveTitle: row.liveTitle?.trim() ? row.liveTitle : defaults.liveTitle,
        liveSubtitle: row.liveSubtitle?.trim() ? row.liveSubtitle : defaults.liveSubtitle,
        packagesJson: isEmptyJsonObject(row.packagesJson) ? defaults.packagesJson : undefined,
        contractIntro: row.contractIntro?.trim() ? undefined : defaults.contractIntro,
        contractClausesJson:
          !Array.isArray(row.contractClausesJson) || !(row.contractClausesJson as unknown[]).length
            ? defaults.contractClausesJson
            : undefined,
        checkoutTitle: row.checkoutTitle?.trim() ? undefined : defaults.checkoutTitle,
        checkoutBody: row.checkoutBody?.trim() ? undefined : defaults.checkoutBody
      };

  const patch = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
  if (!Object.keys(patch).length) return row;

  return prisma.agencyFunnelConfig.update({
    where: { id: row.id },
    data: patch
  });
}

export async function getAgencyFunnelConfigRow() {
  const defaults = institutionalFunnelDbDefaults();
  const row = await prisma.agencyFunnelConfig.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      livePublished: defaults.livePublished,
      liveTitle: defaults.liveTitle,
      liveSubtitle: defaults.liveSubtitle,
      packagesJson: defaults.packagesJson,
      contractIntro: defaults.contractIntro,
      contractClausesJson: defaults.contractClausesJson,
      checkoutTitle: defaults.checkoutTitle,
      checkoutBody: defaults.checkoutBody,
      checkoutPixKey: defaults.checkoutPixKey
    },
    update: {}
  });
  return applyInstitutionalBackfill(row, false);
}

export async function applyInstitutionalFunnelConfig(force = false) {
  const row = await prisma.agencyFunnelConfig.upsert({
    where: { id: "default" },
    create: { id: "default", ...institutionalFunnelDbDefaults() },
    update: {}
  });
  return applyInstitutionalBackfill(row, force);
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
      entryValueCents: entryValueCentsForTier(tier)
    };
  }
  return { tier, totalValueCents: pkg.totalValueCents, entryValueCents: pkg.entryValueCents };
}
