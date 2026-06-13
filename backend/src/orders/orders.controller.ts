import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';

import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('next-number')
  async getNextNumber() {
    return {
      orderNumber: await this.ordersService.generateOrderNumber(),
    };
  }

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto.status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/cancel')
  cancelOrder(@Param('id') id: string) {
    return this.ordersService.cancelOrder(id);
  }

  @Get(':id/worker-slip')
  getWorkerSlip(@Param('id') id: string) {
    return this.ordersService.getWorkerSlip(id);
  }

  @Get(':id/delivery-message')
  getDeliveryMessage(@Param('id') id: string) {
    return this.ordersService.getDeliveryMessage(id);
  }

  @Get(':id/worker-slip/pdf')
  generateWorkerSlipPdf(@Param('id') id: string, @Res() res: Response) {
    return this.ordersService.generateWorkerSlipPdf(id, res);
  }
}
