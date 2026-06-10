import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CustomersModule } from './customers/customers.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [
    PrismaModule,
    CustomersModule,
    AuthModule,
    ProductsModule,
    InventoryModule,
  ],
})
export class AppModule {}