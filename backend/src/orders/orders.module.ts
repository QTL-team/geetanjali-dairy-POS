import { Module, forwardRef } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { InvoicesModule } from '../invoices/invoices.module';

@Module({
  imports: [forwardRef(() => InvoicesModule)],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
