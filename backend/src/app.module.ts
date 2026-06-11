import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CustomersModule } from './customers/customers.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { InventoryModule } from './inventory/inventory.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    PrismaModule,
    CustomersModule,
    AuthModule,
    ProductsModule,
    InventoryModule,
    OrdersModule,
  ],
})
export class AppModule {}