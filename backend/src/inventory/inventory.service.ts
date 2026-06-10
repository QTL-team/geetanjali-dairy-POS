import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async addStock(
    productId: string,
    quantity: number,
    remarks?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: {
          id: productId,
        },
        data: {
          availableStock: {
            increment: quantity,
          },
        },
      });

      await tx.inventoryTransaction.create({
        data: {
          productId,
          quantity,
          type: 'ADD',
          remarks,
        },
      });

      return product;
    });
  }

  async getHistory(productId: string) {
    return this.prisma.inventoryTransaction.findMany({
      where: {
        productId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
