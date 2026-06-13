import { IsNumber, IsOptional, IsString } from 'class-validator';

export class AddStockDto {
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}
