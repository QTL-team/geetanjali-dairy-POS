import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { UnitType } from '../../common/enums/unit-type.enum';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  gujaratiName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(UnitType)
  unit: UnitType;

  @IsNumber()
  sellingPrice: number;

  @IsOptional()
  @IsNumber()
  availableStock?: number;

  @IsOptional()
  @IsNumber()
  lowStockThreshold?: number;
}
