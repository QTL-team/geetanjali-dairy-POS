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

    if (order.status !== 'DELIVERED') {
      throw new BadRequestException(
        'Bill can only be generated for delivered orders',
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

    const amount = order.items.reduce((sum, item) => {
      const billedQty = item.quantity - (item.returnedQuantity || 0);
      return sum + billedQty * item.unitPrice;
    }, 0);

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber,
        orderId,
        amount,
        paidAmount: 0,
        balanceAmount: amount,
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

    if (newPaidAmount > invoice.amount) {
      throw new BadRequestException('Payment exceeds bill amount');
    }

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

            Bill Details

            Bill No: ${invoice.invoiceNumber}

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

Bill No: ${invoice.invoiceNumber}

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
      size: 'A4',
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename=${invoice.invoiceNumber}.pdf`,
    );

    doc.pipe(res);

    doc.registerFont('Gujarati', './fonts/NotoSansGujarati-Regular.ttf');
    doc.font('Gujarati');

    // Header
    doc.fontSize(24).text('ગીતાંજલિ ડેરી (GEETANJALI DAIRY)', {
      align: 'center',
    });

    doc.fontSize(12).text('તાજા ડેરી પ્રોડક્ટ્સ (Fresh Dairy Products)', {
      align: 'center',
    });

    doc.moveDown(2);

    // Invoice Details
    doc.fontSize(16).text('બિલ (BILL)');

    doc.moveDown();

    doc.fontSize(12);
    doc.text(`બિલ નંબર (Bill No): ${invoice.invoiceNumber}`);

    doc.text(
      `બિલ તારીખ (Generated Date): ${invoice.generatedAt.toLocaleDateString('en-GB')}`,
    );
    doc.text(
      `ડિલિવરી તારીખ (Delivery Date): ${new Date(invoice.order.deliveryDate).toLocaleDateString('en-GB')}`,
    );

    doc.moveDown();

    // Customer Details
    doc.fontSize(14).text('ગ્રાહકની વિગતો (Customer Details)');

    doc.moveDown(0.5);

    doc.fontSize(12).text(`નામ (Name): ${invoice.order.customer.name}`);

    doc.text(`ફોન (Phone): ${invoice.order.customer.phone}`);

    doc.text(`સરનામું (Address): ${invoice.order.deliveryAddress}`);

    doc.moveDown();

    // Divider
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    doc.moveDown();

    // Table Header
    doc.fontSize(12);

    const startY = doc.y;

    doc.text('પ્રોડક્ટનું નામ', 50, startY);
    doc.text('ઓર્ડર', 200, startY);
    doc.text('પરત', 260, startY);
    doc.text('બિલિંગ', 330, startY);
    doc.text('ભાવ', 410, startY);
    doc.text('રકમ', 470, startY);

    doc.moveDown();

    // Divider
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    doc.moveDown();

    // Items
    for (const item of invoice.order.items) {
      const y = doc.y;

      const productName = item.product.gujaratiName ?? item.product.name;
      doc.text(productName, 50, y);
      doc.text(`${item.quantity}`, 200, y);
      doc.text(`${item.returnedQuantity || 0}`, 260, y);

      const billedQty = item.quantity - (item.returnedQuantity || 0);
      doc.text(`${billedQty}`, 330, y);
      doc.text(`₹${item.unitPrice}`, 410, y);

      const amount = billedQty * item.unitPrice;
      doc.text(`₹${amount.toFixed(2)}`, 470, y);

      doc.moveDown();
    }

    doc.moveDown();

    // Divider
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    doc.moveDown(2);

    // Totals
    doc.fontSize(14);
    
    // Reset X coordinate to 50 so that alignment calculations span the full width (595 - 50*2 = 495)
    doc.x = 50;

    doc.text(`કુલ રકમ (Grand Total): ₹${invoice.amount}`, {
      align: 'right',
      width: 495,
    });

    doc.text(`જમા રકમ (Paid Amount): ₹${invoice.paidAmount}`, {
      align: 'right',
      width: 495,
    });

    doc.text(`બાકી રકમ (Balance Amount): ₹${invoice.balanceAmount}`, {
      align: 'right',
      width: 495,
    });

    let gujaratiStatus = invoice.status.toString();
    if (invoice.status === 'PAID') gujaratiStatus = 'ચૂકવેલ (PAID)';
    else if (invoice.status === 'PARTIAL') gujaratiStatus = 'અંશતઃ ચૂકવેલ (PARTIAL)';
    else if (invoice.status === 'SENT') gujaratiStatus = 'મોકલેલ (SENT)';
    else if (invoice.status === 'DRAFT') gujaratiStatus = 'ડ્રાફ્ટ (DRAFT)';

    doc.text(`બિલની સ્થિતિ (Status): ${gujaratiStatus}`, {
      align: 'right',
      width: 495,
    });

    doc.moveDown(3);

    // Footer
    doc.fontSize(12).text('ગીતાંજલિ ડેરી પસંદ કરવા બદલ આભાર.', {
      align: 'center',
      width: 495,
    });

    doc.moveDown();

    doc.text('આ કમ્પ્યુટર દ્વારા જનરેટ કરેલ બિલ છે.', {
      align: 'center',
      width: 495,
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

Bill No: ${invoice.invoiceNumber}

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
