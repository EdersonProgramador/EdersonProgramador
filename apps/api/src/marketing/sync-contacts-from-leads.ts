import { prisma } from "../prisma.js";
import { upsertMarketingContactProfile } from "./cdp-contact.js";

export async function syncMarketingContactsFromLeads(limit = 500) {
  const leads = await prisma.lead.findMany({
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: {
      name: true,
      email: true,
      phone: true,
      source: true,
      packageTier: true,
      status: true
    }
  });

  let synced = 0;
  for (const lead of leads) {
    await upsertMarketingContactProfile({
      email: lead.email,
      name: lead.name,
      phone: lead.phone,
      source: lead.source ?? "lead",
      packageTier: lead.packageTier,
      extra: { leadStatus: lead.status }
    });
    synced += 1;
  }

  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    take: 200,
    select: { email: true, name: true, phone: true, company: true }
  });
  for (const client of clients) {
    await upsertMarketingContactProfile({
      email: client.email,
      name: client.name,
      phone: client.phone,
      source: "client_account",
      extra: client.company ? { company: client.company } : undefined
    });
    synced += 1;
  }

  return { synced, leads: leads.length, clients: clients.length };
}
