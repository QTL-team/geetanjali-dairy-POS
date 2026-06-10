import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';

import { InventoryService } from './inventory.service';
import { AddStockDto } from './dto/add-stock.dto';

@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
  ) {}

  @Post('add-stock/:productId')
  addStock(
    @Param('productId') productId: string,
    @Body() dto: AddStockDto,
  ) {
    return this.inventoryService.addStock(
      productId,
      dto.quantity,
      dto.remarks,
    );
  }

  @Get('history/:productId')
  getHistory(
    @Param('productId') productId: string,
  ) {
    return this.inventoryService.getHistory(productId);
  }
}