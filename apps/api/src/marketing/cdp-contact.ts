import { prisma } from "../prisma.js";

export async function upsertMarketingContactProfile(input: {
  email: string;
  name?: string | null;
  phone?: string | null;
  source?: string | null;
  packageTier?: string | null;
  extra?: Record<string, string | null | undefined>;
}) {
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.marketingContactProfile.findUnique({ where: { email } });
  const sources = new Set<string>(
    Array.isArray(existing?.sourcesJson) ? (existing.sourcesJson as string[]) : []
  );
  if (input.source) sources.add(input.source);

  const attributes = {
    ...((existing?.attributesJson as Record<string, string> | null) ?? {}),
    ...(input.packageTier ? { packageTier: input.packageTier } : {}),
    ...Object.fromEntries(
      Object.entries(input.extra ?? {}).filter(([, v]) => v != null && v !== "") as [string, string][]
    )
  };

  return prisma.marketingContactProfile.upsert({
    where: { email },
    create: {
      email,
      name: input.name?.trim() ?? null,
      phone: input.phone?.trim() ?? null,
      attributesJson: attributes,
      sourcesJson: [...sources],
      lastEventAt: new Date()
    },
    update: {
      name: input.name?.trim() ?? existing?.name,
      phone: input.phone?.trim() ?? existing?.phone,
      attributesJson: attributes,
      sourcesJson: [...sources],
      lastEventAt: new Date()
    }
  });
}
