import { CONTRACT_DEFAULTS } from "@ederson-agencia/shared";
import { hashPassword } from "../src/auth.js";
import { prisma } from "../src/prisma.js";

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@ederson.dev").toLowerCase();
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: process.env.ADMIN_NAME ?? "Ederson Programador",
      email: adminEmail,
      passwordHash: await hashPassword(process.env.ADMIN_PASSWORD ?? "admin123456"),
      role: "ADMIN",
      github: "https://github.com/EdersonProgramador"
    }
  });

  const client = await prisma.user.upsert({
    where: { email: "cliente@exemplo.dev" },
    update: {},
    create: {
      name: "Cliente Exemplo",
      email: "cliente@exemplo.dev",
      passwordHash: await hashPassword("cliente123"),
      role: "CLIENT",
      company: "Empresa Demo"
    }
  });

  const freelancer = await prisma.user.upsert({
    where: { email: "freelancer@exemplo.dev" },
    update: {},
    create: {
      name: "Freelancer Demo",
      email: "freelancer@exemplo.dev",
      passwordHash: await hashPassword("freela123"),
      role: "FREELANCER",
      github: "https://github.com/EdersonProgramador"
    }
  });

  const projectCount = await prisma.project.count();
  if (projectCount === 0) {
    await prisma.project.create({
      data: {
        title: "Site institucional — pacote contrato padrão",
        description: "Projeto demo com fases do modelo de contrato.",
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

  console.log("Seed OK:", { admin: admin.email, client: client.email, freelancer: freelancer.email });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
