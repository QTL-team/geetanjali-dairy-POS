import {
  Controller,
  Param,
  Post,
  Body,
  Get,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';

import { InvoicesService } from './invoices.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post('order/:orderId')
  createFromOrder(
    @Param('orderId')
    orderId: string,
  ) {
    return this.invoicesService.createFromOrder(orderId);
  }
  @Post(':id/payment')
  addPayment(@Param('id') id: string, @Body() dto: CreatePaymentDto) {
    return this.invoicesService.addPayment(
      id,
      dto.amount,
      dto.method,
      dto.notes,
    );
  }

  @Get(':id/whatsapp')
  getWhatsappMessage(@Param('id') id: string) {
    return this.invoicesService.getWhatsappMessage(id);
  }

  @Get(':id/payment-reminder')
  getPaymentReminder(@Param('id') id: string) {
    return this.invoicesService.getPaymentReminder(id);
  }

  @Get(':id/pdf')
  generatePdf(@Param('id') id: string, @Res() res: Response) {
    return this.invoicesService.generatePdf(id, res);
  }

  @Get(':id/share')
  shareInvoice(@Param('id') id: string) {
    return this.invoicesService.getInvoiceShare(id);
  }
}
