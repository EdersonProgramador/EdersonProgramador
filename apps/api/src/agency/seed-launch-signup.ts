import { homePathAfterLogin } from "@ederson-agencia/shared";
import { hashPassword, toAuthUser } from "../auth.js";
import { prisma } from "../prisma.js";
import { findLeadForClient, linkLeadToUser } from "./client-funnel.js";

export type SeedLaunchSignupInput = {
  name: string;
  email: string;
  password: string;
  phone: string;
  company?: string;
  message: string;
};

export async function registerSeedLaunchClient(input: SeedLaunchSignupInput) {
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error("Já existe uma conta com este e-mail. Entre em /login para acessar o funil.");
    (err as Error & { statusCode: number }).statusCode = 409;
    throw err;
  }

  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      passwordHash: await hashPassword(input.password),
      role: "CLIENT",
      company: input.company?.trim() || null
    }
  });

  await linkLeadToUser(user.id, email);
  const linked = await findLeadForClient(user.id, email);
  if (!linked) {
    await prisma.lead.create({
      data: {
        name: input.name.trim(),
        email,
        phone: input.phone.trim(),
        company: input.company?.trim(),
        message: input.message.trim(),
        source: "seed_launch",
        userId: user.id,
        status: "NEW"
      }
    });
  } else {
    await prisma.lead.update({
      where: { id: linked.id },
      data: {
        phone: input.phone.trim(),
        company: input.company?.trim() || linked.company,
        message: input.message.trim(),
        source: linked.source ?? "seed_launch"
      }
    });
  }

  const authUser = toAuthUser(user, "agency");
  return {
    authUser,
    homePath: homePathAfterLogin("CLIENT", "agency")
  };
}
