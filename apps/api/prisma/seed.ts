import { CONTRACT_DEFAULTS } from "@ederson-agencia/shared";
import { hashPassword } from "../src/auth.js";
import { prisma } from "../src/prisma.js";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Defina ${name} no .env antes de executar o seed.`);
  }
  return value;
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Seed não deve ser executado em produção.");
  }

  const adminEmail = requireEnv("ADMIN_EMAIL").toLowerCase();
  const adminPassword = requireEnv("ADMIN_PASSWORD");

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: process.env.ADMIN_NAME?.trim() || "Administrador",
      email: adminEmail,
      passwordHash: await hashPassword(adminPassword),
      role: "ADMIN",
      github: "https://github.com/EdersonProgramador"
    }
  });

  const seedDemo = process.env.SEED_DEMO_USERS === "true" || process.env.SEED_DEMO_USERS === "1";
  if (!seedDemo) {
    console.log("Seed concluído (admin). Para usuários demo locais, use SEED_DEMO_USERS=true no .env.");
    return;
  }

  const demoPassword = requireEnv("SEED_DEMO_PASSWORD");
  const demoClientEmail = (process.env.SEED_DEMO_CLIENT_EMAIL ?? "cliente-demo@example.com").toLowerCase();
  const demoFreelancerEmail = (process.env.SEED_DEMO_FREELANCER_EMAIL ?? "freelancer-demo@example.com").toLowerCase();

  const client = await prisma.user.upsert({
    where: { email: demoClientEmail },
    update: {},
    create: {
      name: "Cliente Demo",
      email: demoClientEmail,
      passwordHash: await hashPassword(demoPassword),
      role: "CLIENT",
      company: "Empresa Demo"
    }
  });

  const freelancer = await prisma.user.upsert({
    where: { email: demoFreelancerEmail },
    update: {},
    create: {
      name: "Freelancer Demo",
      email: demoFreelancerEmail,
      passwordHash: await hashPassword(demoPassword),
      role: "FREELANCER"
    }
  });

  const projectCount = await prisma.project.count();
  if (projectCount === 0) {
    await prisma.project.create({
      data: {
        title: "Projeto demonstração",
        description: "Exemplo de acompanhamento por fases.",
        status: "ACTIVE",
        paymentStatus: "PARTIAL",
        clientId: client.id,
        freelancerId: freelancer.id,
        totalValueCents: CONTRACT_DEFAULTS.totalValueCents,
        entryValueCents: CONTRACT_DEFAULTS.entryValueCents,
        phases: {
          create: CONTRACT_DEFAULTS.phases.map((phase, index) => ({
            phaseKey: phase.key,
            label: phase.label,
            sortOrder: index,
            daysPlanned: phase.days,
            status: index === 0 ? "IN_PROGRESS" : "PENDING"
          }))
        }
      }
    });
  }

  console.log("Seed concluído (admin + demo).");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
