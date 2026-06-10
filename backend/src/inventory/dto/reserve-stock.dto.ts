import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ReserveStockDto {
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}