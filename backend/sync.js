const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const invoices = await prisma.invoice.findMany({ include: { order: true } });
  for (let inv of invoices) {
    let newStatus = 'PENDING';
    if (inv.status === 'PAID') newStatus = 'PAID';
    else if (inv.status === 'PARTIAL') newStatus = 'PARTIAL';
    if (inv.order && inv.order.paymentStatus !== newStatus) {
      await prisma.order.update({
        where: { id: inv.orderId },
        data: { paymentStatus: newStatus }
      });
    }
  }
  console.log('Synced');
}

main().finally(() => prisma.$disconnect());
