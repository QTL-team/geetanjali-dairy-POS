import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  async getSales(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getSalesData(startDate, endDate);
  }

  @Get('outstanding')
  async getOutstanding() {
    return this.reportsService.getOutstandingBalances();
  }

  @Get('returns')
  async getReturns(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getReturnMetrics(startDate, endDate);
  }
}
