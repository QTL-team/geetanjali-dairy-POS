import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateOrderReturnDto {
  @IsNotEmpty()
  @IsString()
  orderItemId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  returnedQuantity: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}
