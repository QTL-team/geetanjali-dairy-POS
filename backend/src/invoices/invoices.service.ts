import { BadRequestException, Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Response } from 'express';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const invoices = await this.prisma.invoice.findMany({
      orderBy: { generatedAt: 'desc' },
      include: {
        order: {
          include: {
            customer: {
              select: { id: true, name: true, phone: true },
            },
          },
        },
      },
    });

    return invoices.map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount,
      paidAmount: invoice.paidAmount,
      balanceAmount: invoice.balanceAmount,
      status: invoice.status,
      generatedAt: invoice.generatedAt,
      order: {
        id: invoice.order.id,
        orderNumber: invoice.order.orderNumber,
      },
      customer: invoice.order.customer,
    }));
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            customer: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        payments: true,
      },
    });

    if (!invoice) {
      throw new BadRequestException('Invoice not found');
    }

    return invoice;
  }

  async generateInvoiceNumber() {
    const count = await this.prisma.invoice.count();

    return `INV-${String(count + 1).padStart(5, '0')}`;
  }

  async createFromOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },

      include: {
        items: true,
      },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.status !== 'DELIVERED' && order.status !== 'OUT_FOR_DELIVERY') {
      throw new BadRequestException(
        'Invoice can only be generated for delivered orders',
      );
    }

    const existingInvoice = await this.prisma.invoice.findUnique({
      where: {
        orderId,
      },
    });

    if (existingInvoice) {
      throw new BadRequestException('Invoice already exists');
    }

    const invoiceNumber = await this.generateInvoiceNumber();

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber,
        orderId,
        amount: order.totalAmount,

        paidAmount: 0,
        balanceAmount: order.totalAmount,
      },
    });

    await this.prisma.order.update({
      where: {
        id: orderId,
      },

      data: {
        isInvoiced: true,
      },
    });

    return invoice;
  }

  async addPayment(
    invoiceId: string,
    amount: number,
    method: string,
    notes?: string,
  ) {
    const invoice = await this.prisma.invoice.findUnique({
      where: {
        id: invoiceId,
      },
    });

    if (!invoice) {
      throw new BadRequestException('Invoice not found');
    }

    const newPaidAmount = invoice.paidAmount + amount;

    const newBalance = invoice.amount - newPaidAmount;

    let status: 'PARTIAL' | 'PAID' = 'PARTIAL';

    if (newBalance <= 0) {
      status = 'PAID';
    }

    await this.prisma.invoicePayment.create({
      data: {
        invoiceId,
        amount,
        method,
        paymentType: 'CASH',
        notes,
      },
    });

    const updatedInvoice = await this.prisma.invoice.update({
      where: {
        id: invoiceId,
      },

      data: {
        paidAmount: newPaidAmount,
        balanceAmount: newBalance,
        status,
      },
    });

    // Sync the Payment Status to the Order
    let paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' = 'PENDING';
    if (status === 'PAID') {
      paymentStatus = 'PAID';
    } else if (status === 'PARTIAL') {
      paymentStatus = 'PARTIAL';
    }

    await this.prisma.order.update({
      where: { id: invoice.orderId },
      data: { paymentStatus },
    });

    return updatedInvoice;
  }

  async getWhatsappMessage(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: {
        id: invoiceId,
      },

      include: {
        order: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new BadRequestException('Invoice not found');
    }

    const customer = invoice.order.customer;

    const message = `Hello ${customer.name},

            Invoice Details

            Invoice No: ${invoice.invoiceNumber}

            Amount: ₹${invoice.amount}

            Paid Amount: ₹${invoice.paidAmount}

            Balance Amount: ₹${invoice.balanceAmount}

            Thank you for choosing Geetanjali Dairy.`;

    return {
      phone: customer.phone,
      message,

      whatsappUrl: `https://wa.me/91${customer.phone}?text=${encodeURIComponent(message)}`,
    };
  }

  async getPaymentReminder(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: {
        id: invoiceId,
      },

      include: {
        order: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new BadRequestException('Invoice not found');
    }

    const customer = invoice.order.customer;

    const message = `Hello ${customer.name},

Friendly Payment Reminder

Invoice No: ${invoice.invoiceNumber}

Total Amount: ₹${invoice.amount}

Paid Amount: ₹${invoice.paidAmount}

Pending Amount: ₹${invoice.balanceAmount}

Please complete the payment.

Thank You,
Geetanjali Dairy`;

    return {
      phone: customer.phone,
      message,

      whatsappUrl: `https://wa.me/91${customer.phone}?text=${encodeURIComponent(message)}`,
    };
  }

  async generatePdf(invoiceId: string, res: Response) {
    const invoice = await this.prisma.invoice.findUnique({
      where: {
        id: invoiceId,
      },

      include: {
        order: {
          include: {
            customer: true,

            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      throw new BadRequestException('Invoice not found');
    }

    const doc = new PDFDocument({
      margin: 50,
    });

    res.setHeader('Content-Type', 'application/pdf');

    res.setHeader(
      'Content-Disposition',
      `inline; filename=${invoice.invoiceNumber}.pdf`,
    );

    doc.pipe(res);

    doc.fontSize(22);

    // Header

    doc.fontSize(24).text('GEETANJALI DAIRY', {
      align: 'center',
    });

    doc.fontSize(12).text('Fresh Dairy Products', {
      align: 'center',
    });

    doc.moveDown(2);

    // Invoice Details

    doc.fontSize(16).text('INVOICE');

    doc.moveDown();

    doc.text(`Invoice No: ${invoice.invoiceNumber}`);

    doc.text(`Date: ${invoice.generatedAt.toLocaleDateString('en-GB')}`);

    doc.moveDown();

    // Customer Details

    doc.fontSize(14).text('Customer Details');

    doc.moveDown(0.5);

    doc.fontSize(12).text(`Name: ${invoice.order.customer.name}`);

    doc.text(`Phone: ${invoice.order.customer.phone}`);

    doc.text(`Address: ${invoice.order.deliveryAddress}`);

    doc.moveDown();

    // Divider

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    doc.moveDown();

    // Table Header

    doc.fontSize(12);

    const startY = doc.y;

    doc.text('Product', 50, startY);
    doc.text('Ord. Qty', 200, startY);
    doc.text('Ret.', 270, startY);
    doc.text('Bill', 320, startY);
    doc.text('Rate', 380, startY);
    doc.text('Amount', 450, startY);

    doc.moveDown();

    // Divider

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    doc.moveDown();

    // Items

    for (const item of invoice.order.items) {
      const y = doc.y;

      doc.text(item.product.name, 50, y);
      doc.text(`${item.quantity}`, 200, y);
      doc.text(`${item.returnedQuantity || 0}`, 270, y);
      doc.text(`${item.billedQuantity || item.quantity}`, 320, y);
      doc.text(`₹${item.unitPrice}`, 380, y);

      const amount = (item.billedQuantity || item.quantity) * item.unitPrice;
      doc.text(`₹${amount.toFixed(2)}`, 450, y);

      doc.moveDown();
    }

    doc.moveDown();

    // Divider

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    doc.moveDown(2);

    // Totals

    doc.fontSize(14);

    doc.text(`Total Amount: ₹${invoice.amount}`, {
      align: 'right',
    });

    doc.text(`Paid Amount: ₹${invoice.paidAmount}`, {
      align: 'right',
    });

    doc.text(`Balance Amount: ₹${invoice.balanceAmount}`, {
      align: 'right',
    });

    doc.text(`Status: ${invoice.status}`, {
      align: 'right',
    });

    doc.moveDown(3);

    // Footer

    doc.fontSize(12).text('Thank you for choosing Geetanjali Dairy.', {
      align: 'center',
    });

    doc.moveDown();

    doc.text('This is a computer generated invoice.', {
      align: 'center',
    });

    doc.end();
  }

  async getInvoiceShare(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: {
        id: invoiceId,
      },

      include: {
        order: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new BadRequestException('Invoice not found');
    }

    const customer = invoice.order.customer;

    const message = `Hello ${customer.name},

Invoice No: ${invoice.invoiceNumber}

Total Amount: ₹${invoice.amount}

Paid Amount: ₹${invoice.paidAmount}

Balance Amount: ₹${invoice.balanceAmount}

Thank you for choosing Geetanjali Dairy.`;

    return {
      invoiceNumber: invoice.invoiceNumber,

      customer: customer.name,

      phone: customer.phone,

      pdfUrl: `http://localhost:3000/invoices/${invoice.id}/pdf`,

      whatsappUrl: `https://wa.me/91${customer.phone}?text=${encodeURIComponent(message)}`,
    };
  }
}
