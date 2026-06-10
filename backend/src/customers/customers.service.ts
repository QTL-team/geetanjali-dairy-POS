import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: dto,
    });
  }

  findAll() {
    return this.prisma.customer.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}