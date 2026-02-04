import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const OLD_TEMPLATE = "Tu link do zadatku: {{depositLink}}";
const NEW_TEMPLATE = "Cześć:) Podsyłam tutaj link do zadatku na naszą sesję: {{depositLink}}";

async function main() {
  const result = await prisma.settings.updateMany({
    where: { templateDeposit: OLD_TEMPLATE },
    data: { templateDeposit: NEW_TEMPLATE }
  });

  console.log(`Zaktualizowano szablon zadatku dla ${result.count} rekordów.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
