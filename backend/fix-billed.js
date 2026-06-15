const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRaw`UPDATE "OrderItem" SET "billedQuantity" = "quantity" WHERE "billedQuantity" = 0 AND "quantity" > 0`;
  console.log('Fixed billed quantities');
}
main().finally(() => prisma.$disconnect());
