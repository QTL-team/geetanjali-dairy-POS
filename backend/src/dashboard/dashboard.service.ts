import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const totalCustomers = await this.prisma.customer.count();

    const totalProducts = await this.prisma.product.count();

    const totalOrders = await this.prisma.order.count();

    const pendingOrders = await this.prisma.order.count({
      where: {
        status: {
          in: ['PENDING', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'],
        },
      },
    });

    const deliveredOrders = await this.prisma.order.count({
      where: {
        status: 'DELIVERED',
      },
    });

    const totalRevenue = await this.prisma.invoice.aggregate({
      _sum: {
        paidAmount: true,
      },
    });

    const pendingInvoicesAggr = await this.prisma.invoice.aggregate({
      _sum: {
        balanceAmount: true,
      },
    });

    const pendingUninvoicedOrdersAggr = await this.prisma.order.aggregate({
      where: {
        status: 'DELIVERED',
        invoice: null,
      },
      _sum: {
        totalAmount: true,
      },
    });

    const pendingPayments =
      (pendingInvoicesAggr._sum.balanceAmount || 0) +
      (pendingUninvoicedOrdersAggr._sum.totalAmount || 0);

    const futureRevenueAggr = await this.prisma.order.aggregate({
      where: {
        status: {
          in: ['PENDING', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'],
        },
      },
      _sum: {
        totalAmount: true,
      },
    });
    const futureRevenue = futureRevenueAggr._sum.totalAmount || 0;

    const lowStockProducts = await this.prisma.product.findMany();

    const lowStock = lowStockProducts.filter(
      (product) => product.availableStock <= product.lowStockThreshold,
    );

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const todayRevenue = await this.prisma.invoice.aggregate({
      where: {
        generatedAt: {
          gte: today,
        },
      },

      _sum: {
        paidAmount: true,
      },
    });

    const tomorrow = new Date();

    tomorrow.setDate(tomorrow.getDate() + 1);

    const start = new Date(tomorrow);

    start.setHours(0, 0, 0, 0);

    const end = new Date(tomorrow);

    end.setHours(23, 59, 59, 999);

    const tomorrowDeliveries = await this.prisma.order.count({
      where: {
        deliveryDate: {
          gte: start,
          lte: end,
        },

        status: {
          not: 'CANCELLED',
        },
      },
    });

    const pendingInvoices = await this.prisma.invoice.count({
      where: {
        status: {
          not: 'PAID',
        },
      },
    });

    const totalReturnedProductsAggr = await this.prisma.orderReturn.aggregate({
      _sum: {
        returnedQuantity: true,
      },
    });
    const totalReturnedProducts =
      totalReturnedProductsAggr._sum.returnedQuantity || 0;

    return {
      totalCustomers,

      totalProducts,

      totalOrders,

      pendingOrders,

      deliveredOrders,

      totalRevenue: totalRevenue._sum.paidAmount || 0,

      todayRevenue: todayRevenue._sum.paidAmount || 0,

      pendingPayments,

      futureRevenue,

      tomorrowDeliveries,

      pendingInvoices,

      lowStockProducts: lowStock,

      totalReturnedProducts,
    };
  }
}
