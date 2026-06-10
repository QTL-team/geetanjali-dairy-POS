import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export enum UnitType {
  KG = 'KG',
  LITER = 'LITER',
  PIECE = 'PIECE',
}

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(UnitType)
  unit: UnitType;

  @IsNumber()
  sellingPrice: number;
}