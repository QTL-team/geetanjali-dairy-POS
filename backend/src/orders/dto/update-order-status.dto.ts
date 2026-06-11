import { IsEnum } from 'class-validator';

export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}