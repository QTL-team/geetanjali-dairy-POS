import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ReturnStockDto {
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}
