import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getSalesData(startDate?: string, endDate?: string) {
    // Determine date range constraints
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.paidAt = {};
      if (startDate) {
        dateFilter.paidAt.gte = new Date(startDate);
      }
      if (endDate) {
        // To include the whole end date, we add 1 day and use lt
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        dateFilter.paidAt.lt = end;
      }
    }

    // 1. Calculate Daily Revenue from InvoicePayments
    // We get all payments in the date range and group them by date
    const payments = await this.prisma.invoicePayment.findMany({
      where: dateFilter,
      select: {
        amount: true,
        paidAt: true,
      },
    });

    const dailyRevenueMap = new Map<string, number>();
    for (const p of payments) {
      const dateKey = p.paidAt.toISOString().split('T')[0]; // YYYY-MM-DD
      const current = dailyRevenueMap.get(dateKey) || 0;
      dailyRevenueMap.set(dateKey, current + p.amount);
    }

    // Sort dates
    const dailyRevenue = Array.from(dailyRevenueMap.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 2. Top Products
    // Based on OrderItems of DELIVERED orders in the same date range
    const orderDateFilter: any = {};
    if (startDate || endDate) {
      orderDateFilter.deliveryDate = {};
      if (startDate) {
        orderDateFilter.deliveryDate.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        orderDateFilter.deliveryDate.lt = end;
      }
    }

    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        order: {
          status: 'DELIVERED',
          ...orderDateFilter,
        },
      },
      include: {
        product: true,
      },
    });

    const productSalesMap = new Map<string, number>();
    for (const item of orderItems) {
      const current = productSalesMap.get(item.product.name) || 0;
      const billedQty = item.quantity - (item.returnedQuantity || 0);
      productSalesMap.set(item.product.name, current + billedQty);
    }

    const topProducts = Array.from(productSalesMap.entries())
      .map(([name, totalSold]) => ({ name, totalSold }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 10); // Top 10

    return {
      dailyRevenue,
      topProducts,
    };
  }

  async getOutstandingBalances() {
    // Calculate pending debt per customer
    const customers = await this.prisma.customer.findMany({
      include: {
        orders: {
          where: {
            status: 'DELIVERED',
            isInvoiced: false,
          },
          include: {
            items: true,
          },
        },
      },
    });

    const balances = customers.map((c) => {
      let pendingAmount = 0;

      // DELIVERED orders without invoices
      for (const order of c.orders) {
        const orderAmount = order.items.reduce((sum, item) => {
          const billedQty = item.quantity - (item.returnedQuantity || 0);
          return sum + billedQty * item.unitPrice;
        }, 0);
        pendingAmount += orderAmount;
      }

      return {
        customerId: c.id,
        customerName: c.name,
        phone: c.phone,
        pendingAmount,
      };
    });

    // Now let's calculate unpaid invoice amounts. Since invoices are tied to Orders,
    // we need to query orders that have invoices which are unpaid.
    const ordersWithInvoices = await this.prisma.order.findMany({
      where: {
        invoice: {
          status: { in: ['DRAFT', 'SENT', 'PARTIAL'] },
        },
      },
      include: {
        customer: true,
        invoice: true,
      },
    });

    for (const order of ordersWithInvoices) {
      if (order.invoice) {
        const pending = order.invoice.amount - order.invoice.paidAmount;
        if (pending > 0) {
          const existing = balances.find(
            (b) => b.customerId === order.customerId,
          );
          if (existing) {
            existing.pendingAmount += pending;
          } else {
            balances.push({
              customerId: order.customerId,
              customerName: order.customer.name,
              phone: order.customer.phone,
              pendingAmount: pending,
            });
          }
        }
      }
    }

    // Filter only those with debt, and sort highest first
    return balances
      .filter((b) => b.pendingAmount > 0)
      .sort((a, b) => b.pendingAmount - a.pendingAmount);
  }

  async getReturnMetrics(startDate?: string, endDate?: string) {
    const dateFilter: Prisma.OrderReturnWhereInput = {};
    if (startDate || endDate) {
      const createdAtFilter: Prisma.DateTimeFilter = {};
      if (startDate) {
        createdAtFilter.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        createdAtFilter.lt = end;
      }
      dateFilter.createdAt = createdAtFilter;
    }

    const orderReturns = await this.prisma.orderReturn.findMany({
      where: dateFilter,
      include: {
        orderItem: {
          include: {
            product: true,
            order: {
              include: {
                customer: true,
              },
            },
          },
        },
      },
    });

    let totalReturnedQty = 0;
    let totalReturnValue = 0;
    const productReturnsMap = new Map<string, number>();
    const customerReturnsMap = new Map<string, number>();

    for (const ret of orderReturns) {
      totalReturnedQty += ret.returnedQuantity;
      totalReturnValue += ret.returnedQuantity * ret.orderItem.unitPrice;

      const current = productReturnsMap.get(ret.orderItem.product.name) || 0;
      productReturnsMap.set(
        ret.orderItem.product.name,
        current + ret.returnedQuantity,
      );

      const customerName = ret.orderItem.order?.customer?.name || 'Unknown';
      const currentCust = customerReturnsMap.get(customerName) || 0;
      customerReturnsMap.set(customerName, currentCust + ret.returnedQuantity);
    }

    const topReturnedProducts = Array.from(productReturnsMap.entries())
      .map(([name, totalReturned]) => ({ name, totalReturned }))
      .sort((a, b) => b.totalReturned - a.totalReturned)
      .slice(0, 10);

    const customerWiseReturns = Array.from(customerReturnsMap.entries())
      .map(([name, totalReturned]) => ({ name, totalReturned }))
      .sort((a, b) => b.totalReturned - a.totalReturned);

    const products = await this.prisma.product.findMany();
    const totalReturnedStockValue = products.reduce(
      (sum, p) => sum + p.returnedStock * p.sellingPrice,
      0,
    );

    return {
      totalReturnedQty,
      totalReturnValue,
      topReturnedProducts,
      customerWiseReturns,
      totalReturnedStockValue,
    };
  }
}
