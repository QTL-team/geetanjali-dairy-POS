import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  amount: number;

  @IsString()
  method: string;

  @IsOptional()
  @IsString()
  notes: string;
}
