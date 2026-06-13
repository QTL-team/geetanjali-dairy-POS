import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductionService {
  constructor(private prisma: PrismaService) {}

  async tomorrowPlan() {
    const tomorrow = new Date();

    tomorrow.setDate(tomorrow.getDate() + 1);

    const start = new Date(tomorrow);
    start.setHours(0, 0, 0, 0);

    const end = new Date(tomorrow);
    end.setHours(23, 59, 59, 999);

    const orders = await this.prisma.order.findMany({
      where: {
        deliveryDate: {
          gte: start,
          lte: end,
        },

        status: {
          not: 'CANCELLED',
        },
      },

      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    const productMap = new Map<
      string,
      {
        productId: string;
        name: string;
        quantity: number;
        unit: string;
      }
    >();

    let estimatedRevenue = 0;

    for (const order of orders) {
      estimatedRevenue += order.totalAmount;

      for (const item of order.items) {
        const existing = productMap.get(item.product.id);

        if (existing) {
          existing.quantity += item.quantity;
        } else {
          productMap.set(item.product.id, {
            productId: item.product.id,

            name: item.product.name,

            quantity: item.quantity,

            unit: item.product.unit,
          });
        }
      }
    }

    const lowStockProducts = await this.prisma.product.findMany();

    const lowStockWarnings = lowStockProducts
      .filter((product) => product.availableStock <= product.lowStockThreshold)
      .map((product) => ({
        productId: product.id,
        name: product.name,
        availableStock: product.availableStock,
        threshold: product.lowStockThreshold,
        shortage: product.lowStockThreshold - product.availableStock,
      }));

    return {
      date: start.toISOString().split('T')[0],

      totalOrders: orders.length,

      estimatedRevenue,

      lowStockWarnings,

      products: Array.from(productMap.values()).sort(
        (a, b) => b.quantity - a.quantity,
      ),
    };
  }
}
