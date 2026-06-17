import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: dto,
    });
  }

  findAll() {
    return this.prisma.customer.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAllWithStats() {
    const customers = await this.prisma.customer.findMany({
      include: {
        orders: {
          include: {
            invoice: true,
            items: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return customers.map((customer) => {
      let totalRevenue = 0;
      let pendingAmount = 0;
      let lastOrderDate: Date | null = null;

      customer.orders.forEach((order) => {
        if (order.createdAt) {
          const orderDate = new Date(order.createdAt);
          if (!lastOrderDate || orderDate > lastOrderDate) {
            lastOrderDate = orderDate;
          }
        }
        if (order.invoice) {
          totalRevenue += order.invoice.paidAmount || 0;
          pendingAmount += order.invoice.balanceAmount || 0;
        } else if (order.status === 'DELIVERED') {
          const orderAmount = order.items.reduce((sum, item) => {
            const billedQty = item.quantity - (item.returnedQuantity || 0);
            return sum + billedQty * item.unitPrice;
          }, 0);
          pendingAmount += orderAmount;
        }
      });

      // Strip orders from the return to keep payload light
      const { orders, ...customerData } = customer;

      return {
        ...customerData,
        totalOrders: orders.length,
        totalRevenue,
        pendingAmount,
        lastOrderDate,
      };
    });
  }
  update(id: string, updateCustomerDto: UpdateCustomerDto) {
    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  remove(id: string) {
    return this.prisma.customer.delete({
      where: { id },
    });
  }

  findOne(id: string) {
    return this.prisma.customer.findUnique({
      where: { id },
    });
  }

  findOneWithDetails(id: string) {
    return this.prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            invoice: {
              include: {
                payments: {
                  orderBy: {
                    paidAt: 'desc',
                  },
                },
              },
            },
            items: {
              include: {
                product: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }
}
