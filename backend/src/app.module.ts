import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CustomersModule } from './customers/customers.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { InventoryModule } from './inventory/inventory.module';
import { OrdersModule } from './orders/orders.module';
import { InvoicesModule } from './invoices/invoices.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ProductionModule } from './production/production.module';

@Module({
  imports: [
    PrismaModule,
    CustomersModule,
    AuthModule,
    ProductsModule,
    InventoryModule,
    OrdersModule,
    InvoicesModule,
    DashboardModule,
    ProductionModule,
  ],
})
export class AppModule {}
