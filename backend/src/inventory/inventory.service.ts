import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async addStock(productId: string, quantity: number, remarks?: string) {
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

  async reserveStock(productId: string, quantity: number, remarks?: string) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: {
          id: productId,
        },
      });

      if (!product) {
        throw new Error('Product not found');
      }

      if (product.availableStock < quantity) {
        throw new Error('Insufficient stock');
      }

      const updatedProduct = await tx.product.update({
        where: {
          id: productId,
        },
        data: {
          availableStock: {
            decrement: quantity,
          },
          reservedStock: {
            increment: quantity,
          },
        },
      });

      await tx.inventoryTransaction.create({
        data: {
          productId,
          quantity,
          type: 'RESERVE',
          remarks,
        },
      });

      return updatedProduct;
    });
  }

  async returnStock(productId: string, quantity: number, remarks?: string) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error('Product not found');
      }

      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          availableStock: {
            increment: quantity,
          },
          reservedStock: {
            decrement: quantity,
          },
          returnedStock: {
            increment: quantity,
          },
        },
      });

      await tx.inventoryTransaction.create({
        data: {
          productId,
          quantity,
          type: 'RETURN',
          remarks,
        },
      });

      return updatedProduct;
    });
  }

  async getSummary() {
    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        unit: true,
        sellingPrice: true,
        availableStock: true,
        reservedStock: true,
        lowStockThreshold: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return products.map((product) => ({
      ...product,
      isLowStock: product.availableStock < product.lowStockThreshold,
    }));
  }
}
