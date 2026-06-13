import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, OrderStatus } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async generateOrderNumber() {
    const count = await this.prisma.order.count();

    return `GD-${String(count + 1).padStart(5, '0')}`;
  }

  async create(dto: CreateOrderDto) {
    const orderNumber = await this.generateOrderNumber();

    return this.prisma.$transaction(
      async (tx) => {
        let totalAmount = 0;

        let customer = await tx.customer.findFirst({
          where: {
            phone: dto.contactNumber,
          },
        });

        if (!customer) {
          customer = await tx.customer.create({
            data: {
              name: dto.customerName,
              phone: dto.contactNumber,
              address: dto.deliveryAddress,
            },
          });
        }

        const orderItemsData: Prisma.OrderItemCreateWithoutOrderInput[] = [];

        for (const item of dto.items) {
          const product = await tx.product.findUnique({
            where: {
              id: item.productId,
            },
          });

          if (!product) {
            throw new Error('Product not found');
          }

          if (product.availableStock < item.quantity) {
            throw new Error(`${product.name} has insufficient stock`);
          }

          const itemTotal = product.sellingPrice * item.quantity;

          totalAmount += itemTotal;

          orderItemsData.push({
            product: {
              connect: {
                id: product.id,
              },
            },

            quantity: item.quantity,

            unitPrice: product.sellingPrice,

            totalPrice: itemTotal,
          });

          await tx.product.update({
            where: {
              id: product.id,
            },
            data: {
              availableStock: {
                decrement: item.quantity,
              },

              reservedStock: {
                increment: item.quantity,
              },
            },
          });

          await tx.inventoryTransaction.create({
            data: {
              productId: product.id,

              quantity: item.quantity,

              type: 'RESERVE',

              remarks: `Order ${orderNumber}`,
            },
          });
        }

        const order = await tx.order.create({
          data: {
            orderNumber,

            customerId: customer.id,

            deliveryDate: new Date(dto.deliveryDate),

            deliveryAddress: dto.deliveryAddress,

            contactNumber: dto.contactNumber,

            notes: dto.notes,

            totalAmount,

            items: {
              create: orderItemsData,
            },
          },

          include: {
            customer: true,

            items: true,
          },
        });

        return order;
      },

      {
        timeout: 20000,
      },
    );
  }

  async findAll() {
    return this.prisma.order.findMany({
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateStatus(orderId: string, status: string) {
    return this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: status as OrderStatus,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.order.findUnique({
      where: {
        id,
      },

      include: {
        customer: true,

        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async cancelOrder(orderId: string) {
    return this.prisma.$transaction(
      async (tx) => {
        const order = await tx.order.findUnique({
          where: {
            id: orderId,
          },

          include: {
            items: true,
          },
        });

        if (!order) {
          throw new Error('Order not found');
        }

        for (const item of order.items) {
          await tx.product.update({
            where: {
              id: item.productId,
            },

            data: {
              availableStock: {
                increment: item.quantity,
              },

              reservedStock: {
                decrement: item.quantity,
              },
            },
          });

          await tx.inventoryTransaction.create({
            data: {
              productId: item.productId,

              quantity: item.quantity,

              type: 'ADJUSTMENT',

              remarks: `Order ${order.orderNumber} Cancelled`,
            },
          });
        }

        return tx.order.update({
          where: {
            id: orderId,
          },

          data: {
            status: 'CANCELLED',
          },
        });
      },
      {
        timeout: 20000,
      },
    );
  }

  async getDeliveryMessage(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },

      include: {
        customer: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const message = `Hello ${order.customer.name},

Your order ${order.orderNumber} has been delivered successfully.

Thank you for choosing Geetanjali Dairy.

We look forward to serving you again.`;

    return {
      phone: order.customer.phone,

      message,

      whatsappUrl: `https://wa.me/91${order.customer.phone}?text=${encodeURIComponent(message)}`,
    };
  }

  async getWorkerSlip(orderId: string) {
    const order = await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        workerSlipPrinted: true,
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        workerSlipPrinted: true,
      },
    });

    return {
      orderNumber: order.orderNumber,

      customerName: order.customer.name,

      phone: order.contactNumber,

      deliveryDate: order.deliveryDate.toLocaleDateString('en-GB'),

      status: order.status,

      items: order.items.map((item) => ({
        productName: item.product.name,
        quantity: item.quantity,
        unit: item.product.unit,
      })),
    };
  }

  async generateWorkerSlipPdf(orderId: string, res: Response) {
    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },

      include: {
        customer: true,

        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    const doc = new PDFDocument({
      margin: 50,
    });

    res.setHeader('Content-Type', 'application/pdf');

    res.setHeader(
      'Content-Disposition',
      `inline; filename=worker-slip-${order.orderNumber}.pdf`,
    );

    doc.pipe(res);

    doc.registerFont('Gujarati', './fonts/NotoSansGujarati-Regular.ttf');

    doc.font('Gujarati');

    doc.fontSize(18).text('વર્કર સ્લિપ', {
      align: 'center',
    });

    doc.moveDown();

    doc.text(`ઓર્ડર: ${order.orderNumber}`);

    doc.text(`તારીખ: ${order.deliveryDate.toLocaleDateString('en-GB')}`);

    doc.moveDown();

    doc.text('----------------------');

    doc.moveDown();

    const unitMap = {
      KG: 'કિલો',
      LITER: 'લિટર',
      PIECE: 'નંગ',
    };

    for (const item of order.items) {
      doc.text(
        `${item.product.gujaratiName ?? item.product.name} - ${item.quantity} ${
          unitMap[item.product.unit]
        }`,
      );
    }

    await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        workerSlipPrinted: true,
      },
    });

    doc.end();
  }
}
