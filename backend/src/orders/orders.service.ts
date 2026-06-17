import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Prisma,
  OrderStatus,
  PaymentStatus,
  InvoiceStatus,
} from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { BadRequestException } from '@nestjs/common';
import { InvoicesService } from '../invoices/invoices.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => InvoicesService))
    private invoicesService: InvoicesService,
  ) {}

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
        } else {
          customer = await tx.customer.update({
            where: {
              id: customer.id,
            },
            data: {
              name: dto.customerName,
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
            throw new BadRequestException('Product not found');
          }

          if (product.availableStock < item.quantity) {
            throw new BadRequestException(
              `${product.name} has insufficient stock`,
            );
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
        invoice: true,
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
        invoice: true,
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

    doc.end();

    try {
      await this.prisma.order.update({
        where: {
          id: orderId,
        },
        data: {
          workerSlipPrinted: true,
        },
      });
    } catch (error) {
      console.error('Failed to update workerSlipPrinted status', error);
    }
  }

  async getDeliverySlip(orderId: string) {
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
      throw new Error('Order not found');
    }

    return {
      orderNumber: order.orderNumber,
      customerName: order.customer.name,
      phone: order.contactNumber,
      deliveryAddress: order.deliveryAddress,
      deliveryDate: order.deliveryDate.toLocaleDateString('en-GB'),
      notes: order.notes,
      items: order.items.map((item) => ({
        productName: item.product.gujaratiName ?? item.product.name,
        quantity: item.quantity,
        unit: item.product.unit,
      })),
    };
  }

  async generateDeliverySlipPdf(orderId: string, res: Response) {
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
      size: 'A4',
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename=delivery-slip-${order.orderNumber}.pdf`,
    );

    doc.pipe(res);

    doc.registerFont('Gujarati', './fonts/NotoSansGujarati-Regular.ttf');
    doc.font('Gujarati');

    doc.fontSize(20).text('ડિલિવરી સ્લિપ', {
      align: 'center',
    });

    doc.moveDown();

    doc.fontSize(12);
    doc.text(`ઓર્ડર નંબર: ${order.orderNumber}`);
    doc.text(`ગ્રાહકનું નામ: ${order.customer.name}`);
    doc.text(`મોબાઇલ નંબર: ${order.contactNumber}`);
    doc.text(`સરનામું: ${order.deliveryAddress}`);
    doc.text(
      `ડિલિવરી તારીખ: ${order.deliveryDate.toLocaleDateString('en-GB')}`,
    );
    if (order.notes) {
      doc.text(`નોંધ: ${order.notes}`);
    }

    doc.moveDown();
    doc.text('------------------------------------------------------------');
    doc.moveDown();

    doc.fontSize(14).text('પ્રોડક્ટ્સ:');
    doc.moveDown(0.5);

    doc.fontSize(12);
    const unitMap: Record<string, string> = {
      KG: 'કિલો',
      LITER: 'લિટર',
      PIECE: 'નંગ',
    };

    for (const item of order.items) {
      const productName = item.product.gujaratiName ?? item.product.name;
      const unit = unitMap[item.product.unit] || item.product.unit;
      doc.text(`- ${productName} - ${item.quantity} ${unit}`);
    }

    doc.moveDown(3);

    // Calculate position for signatures
    const startY = doc.y;
    doc.text('ગ્રાહકની સહી', 50, startY);
    doc.text('ડિલિવરી બોયની સહી', 400, startY);

    doc.end();

    try {
      await this.prisma.order.update({
        where: {
          id: orderId,
        },
        data: {
          deliverySlipPrinted: true,
        },
      });
    } catch (error) {
      console.error('Failed to update deliverySlipPrinted status', error);
    }
  }

  async recordPayment(
    orderId: string,
    amount: number,
    method: string,
    notes?: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { invoice: true },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.status !== 'DELIVERED' && order.status !== 'OUT_FOR_DELIVERY') {
      throw new BadRequestException(
        'Can only record payment for delivered or out for delivery orders',
      );
    }

    let invoice = order.invoice;

    if (!invoice) {
      invoice = await this.invoicesService.createFromOrder(orderId);
    }

    const updatedInvoice = await this.invoicesService.addPayment(
      invoice.id,
      amount,
      method,
      notes,
    );

    let paymentStatus: PaymentStatus = 'PENDING';
    if (updatedInvoice.status === 'PAID') {
      paymentStatus = 'PAID';
    } else if (updatedInvoice.status === 'PARTIAL') {
      paymentStatus = 'PARTIAL';
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus },
    });
  }

  async getReturns(orderId: string) {
    return this.prisma.orderReturn.findMany({
      where: { orderId },
      include: { orderItem: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async recordReturn(
    orderId: string,
    orderItemId: string,
    returnedQuantity: number,
    remarks?: string,
  ) {
    return this.prisma.$transaction(
      async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: { items: true, invoice: true },
        });

        if (!order) {
          throw new BadRequestException('Order not found');
        }

        if (order.status === 'CANCELLED') {
          throw new BadRequestException(
            'Cannot return items for a cancelled order',
          );
        }

        const item = order.items.find((i) => i.id === orderItemId);
        if (!item) {
          throw new BadRequestException('Order item not found');
        }

        const remainingQuantity = item.quantity - item.returnedQuantity;
        if (returnedQuantity <= 0 || returnedQuantity > remainingQuantity) {
          throw new BadRequestException('Invalid returned quantity');
        }

        // 1. Create OrderReturn
        const orderReturn = await tx.orderReturn.create({
          data: {
            orderId,
            orderItemId,
            returnedQuantity,
            remarks,
          },
        });

        // 2. Update OrderItem
        const newReturnedQuantity = item.returnedQuantity + returnedQuantity;
        const newBilledQuantity = item.quantity - newReturnedQuantity;

        await tx.orderItem.update({
          where: { id: orderItemId },
          data: {
            returnedQuantity: newReturnedQuantity,
            billedQuantity: newBilledQuantity,
          },
        });

        // 3. Update Product & InventoryTransaction
        await tx.product.update({
          where: { id: item.productId },
          data: {
            returnedStock: { increment: returnedQuantity },
          },
        });

        await tx.inventoryTransaction.create({
          data: {
            productId: item.productId,
            quantity: returnedQuantity,
            type: 'RETURN',
            remarks: `Order Return - ${order.orderNumber}`,
          },
        });

        // 4. Recalculate Order totalAmount and Invoice amount
        let newTotalAmount = 0;
        const updatedItems = await tx.orderItem.findMany({
          where: { orderId },
        });
        for (const updatedItem of updatedItems) {
          newTotalAmount += updatedItem.billedQuantity * updatedItem.unitPrice;
        }

        await tx.order.update({
          where: { id: orderId },
          data: { totalAmount: newTotalAmount },
        });

        if (order.invoice) {
          const newBalance = newTotalAmount - order.invoice.paidAmount;
          let newStatus: InvoiceStatus = order.invoice.status;
          if (newBalance <= 0 && newTotalAmount > 0) newStatus = 'PAID';
          else if (order.invoice.paidAmount > 0 && newBalance > 0)
            newStatus = 'PARTIAL';
          else if (
            order.invoice.paidAmount === 0 &&
            order.invoice.status !== 'DRAFT'
          )
            newStatus = 'SENT';

          await tx.invoice.update({
            where: { id: order.invoice.id },
            data: {
              amount: newTotalAmount,
              balanceAmount: newBalance,
              status: newStatus,
            },
          });

          // Sync payment status back to order
          let paymentStatus: PaymentStatus = 'PENDING';
          if (newStatus === 'PAID') paymentStatus = 'PAID';
          else if (newStatus === 'PARTIAL') paymentStatus = 'PARTIAL';
          else if (newBalance <= 0) paymentStatus = 'PAID';

          await tx.order.update({
            where: { id: orderId },
            data: { paymentStatus },
          });
        }

        return orderReturn;
      },
      { timeout: 15000 },
    );
  }
}
