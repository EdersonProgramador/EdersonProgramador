/**
 * Marca cursos publicados como venda pública (PUBLIC_SALE) com preço,
 * para a vitrine /public/academy/catalog.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SALE = [
  { slug: "fl-formula-de-lancamento", priceCents: 99700 },
  { slug: "praticas-leitura-escrita-academicas-usp", priceCents: 49700 }
];

async function main() {
  for (const item of SALE) {
    const updated = await prisma.course.updateMany({
      where: { slug: item.slug, status: "PUBLISHED" },
      data: {
        visibility: "PUBLIC_SALE",
        priceCents: item.priceCents,
        currency: "BRL"
      }
    });
    console.log(item.slug, "updated:", updated.count);
  }

  const sale = await prisma.course.findMany({
    where: { status: "PUBLISHED", visibility: "PUBLIC_SALE", priceCents: { gt: 0 } },
    select: { slug: true, title: true, priceCents: true, visibility: true }
  });
  console.log(JSON.stringify(sale, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
