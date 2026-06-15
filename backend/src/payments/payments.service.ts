import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const payments = await this.prisma.invoicePayment.findMany({
      orderBy: { paidAt: 'desc' },
      include: {
        invoice: {
          include: {
            order: {
              include: {
                customer: true,
              },
            },
          },
        },
      },
    });

    return payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      paidAt: p.paidAt,
      method: p.method,
      paymentType: p.paymentType,
      notes: p.notes,
      invoiceNumber: p.invoice.invoiceNumber,
      customerName: p.invoice.order.customer.name,
    }));
  }

  async findOne(id: string) {
    const payment = await this.prisma.invoicePayment.findUnique({
      where: { id },
      include: {
        invoice: {
          include: {
            order: {
              include: {
                customer: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    return payment;
  }
}
