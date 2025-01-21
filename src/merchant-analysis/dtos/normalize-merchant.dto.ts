import { IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class NormalizeMerchantDto {
  @IsNotEmpty()
  description: string;

  @IsNumber()
  amount: number;

  @IsDateString()
  date: string;
}