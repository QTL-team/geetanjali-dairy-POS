import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
    constructor(
        private prisma: PrismaService,
    ) { }

    async generateOrderNumber() {
        const count = await this.prisma.order.count();

        return `GD-${String(count + 1).padStart(5, '0')}`;
    }

    async create(dto: CreateOrderDto) {
        const orderNumber =
            await this.generateOrderNumber();

        return this.prisma.$transaction(
            async (tx) => {
                let totalAmount = 0;

                let customer =
                    await tx.customer.findFirst({
                        where: {
                            phone: dto.contactNumber,
                        },
                    });

                if (!customer) {
                    customer =
                        await tx.customer.create({
                            data: {
                                name: dto.customerName,
                                phone: dto.contactNumber,
                                address: dto.deliveryAddress,
                            },
                        });
                }

                const orderItemsData: Prisma.OrderItemCreateWithoutOrderInput[] =
                    [];

                for (const item of dto.items) {
                    const product =
                        await tx.product.findUnique({
                            where: {
                                id: item.productId,
                            },
                        });

                    if (!product) {
                        throw new Error(
                            'Product not found',
                        );
                    }

                    if (
                        product.availableStock <
                        item.quantity
                    ) {
                        throw new Error(
                            `${product.name} has insufficient stock`,
                        );
                    }

                    const itemTotal =
                        product.sellingPrice *
                        item.quantity;

                    totalAmount += itemTotal;

                    orderItemsData.push({
                        product: {
                            connect: {
                                id: product.id,
                            },
                        },

                        quantity: item.quantity,

                        unitPrice:
                            product.sellingPrice,

                        totalPrice: itemTotal,
                    });

                    await tx.product.update({
                        where: {
                            id: product.id,
                        },
                        data: {
                            availableStock: {
                                decrement:
                                    item.quantity,
                            },

                            reservedStock: {
                                increment:
                                    item.quantity,
                            },
                        },
                    });

                    await tx.inventoryTransaction.create(
                        {
                            data: {
                                productId:
                                    product.id,

                                quantity:
                                    item.quantity,

                                type: 'RESERVE',

                                remarks: `Order ${orderNumber}`,
                            },
                        },
                    );
                }

                console.log(
                    'Creating Order...',
                );

                const order =
                    await tx.order.create({
                        data: {
                            orderNumber,

                            customerId:
                                customer.id,

                            deliveryDate:
                                new Date(
                                    dto.deliveryDate,
                                ),

                            deliveryAddress:
                                dto.deliveryAddress,

                            contactNumber:
                                dto.contactNumber,

                            notes: dto.notes,

                            totalAmount,

                            items: {
                                create:
                                    orderItemsData,
                            },
                        },

                        include: {
                            customer: true,

                            items: true,
                        },
                    });

                console.log(
                    'Order Created',
                );

                return order;
            },

            {
                timeout: 20000,
            },
        );
    }

    async findAll() {
        return this.prisma.order.findMany({
            include: {
                customer: true,
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async updateStatus(
        orderId: string,
        status: string,
    ) {
        return this.prisma.order.update({
            where: {
                id: orderId,
            },
            data: {
                status: status as any,
            },
        });
    }

    async findOne(id: string) {
        return this.prisma.order.findUnique({
            where: {
                id,
            },

            include: {
                customer: true,

                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
    }

    async cancelOrder(orderId: string) {
        return this.prisma.$transaction(
            async (tx) => {
                const order =
                    await tx.order.findUnique({
                        where: {
                            id: orderId,
                        },

                        include: {
                            items: true,
                        },
                    });

                if (!order) {
                    throw new Error(
                        'Order not found',
                    );
                }

                for (const item of order.items) {
                    await tx.product.update({
                        where: {
                            id: item.productId,
                        },

                        data: {
                            availableStock: {
                                increment:
                                    item.quantity,
                            },

                            reservedStock: {
                                decrement:
                                    item.quantity,
                            },
                        },
                    });

                    await tx.inventoryTransaction.create(
                        {
                            data: {
                                productId:
                                    item.productId,

                                quantity:
                                    item.quantity,

                                type: 'ADJUSTMENT',

                                remarks: `Order ${order.orderNumber} Cancelled`,
                            },
                        },
                    );
                }

                return tx.order.update({
                    where: {
                        id: orderId,
                    },

                    data: {
                        status: 'CANCELLED',
                    },
                });
            },
            {
                timeout: 20000,
            },
        );
    }

}