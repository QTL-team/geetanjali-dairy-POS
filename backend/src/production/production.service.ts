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
        gujaratiName: string | null;
        quantity: number;
        unit: string;
        currentStock: number;
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
            gujaratiName: item.product.gujaratiName,
            quantity: item.quantity,
            unit: item.product.unit,
            currentStock: item.product.availableStock,
          });
        }
      }
    }

    const productsToProduce = Array.from(productMap.values())
      .map((p) => {
        const remainingAfterProduction = p.currentStock - p.quantity;
        return {
          ...p,
          remainingAfterProduction,
          status: remainingAfterProduction >= 0 ? 'READY' : 'LOW_STOCK',
        };
      })
      .sort((a, b) => b.quantity - a.quantity);

    const lowStockWarnings = productsToProduce
      .filter((p) => p.status === 'LOW_STOCK')
      .map((p) => ({
        productId: p.productId,
        name: p.name,
        gujaratiName: p.gujaratiName,
        required: p.quantity,
        available: p.currentStock,
        shortage: Math.abs(p.remainingAfterProduction),
        unit: p.unit,
      }));

    return {
      date: start.toISOString().split('T')[0],
      totalOrders: orders.length,
      estimatedRevenue,
      lowStockWarnings,
      products: productsToProduce,
    };
  }
}
