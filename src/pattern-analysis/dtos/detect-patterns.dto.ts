import { Type } from 'class-transformer';
import { IsArray, IsString, IsNumber, IsDateString, ValidateNested } from 'class-validator';

export class TransactionDto {
  @IsString()
  description: string;

  @IsNumber()
  amount: number;

  @IsDateString()
  date: string;
}

export class DetectPatternsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionDto)
  transactions: TransactionDto[];
}