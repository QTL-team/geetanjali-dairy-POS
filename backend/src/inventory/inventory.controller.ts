import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { InventoryService } from './inventory.service';
import { AddStockDto } from './dto/add-stock.dto';
import { ReserveStockDto } from './dto/reserve-stock.dto';
import { ReturnStockDto } from './dto/return-stock.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('add-stock/:productId')
  addStock(@Param('productId') productId: string, @Body() dto: AddStockDto) {
    return this.inventoryService.addStock(productId, dto.quantity, dto.remarks);
  }

  @Get('history/:productId')
  getHistory(@Param('productId') productId: string) {
    return this.inventoryService.getHistory(productId);
  }

  @Post('reserve-stock/:productId')
  reserveStock(
    @Param('productId') productId: string,
    @Body() dto: ReserveStockDto,
  ) {
    return this.inventoryService.reserveStock(
      productId,
      dto.quantity,
      dto.remarks,
    );
  }

  @Post('return-stock/:productId')
  returnStock(
    @Param('productId') productId: string,
    @Body() dto: ReturnStockDto,
  ) {
    return this.inventoryService.returnStock(
      productId,
      dto.quantity,
      dto.remarks,
    );
  }
}
