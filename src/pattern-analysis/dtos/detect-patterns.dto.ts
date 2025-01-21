import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class TransactionDto {
  description: string;
  amount: number;
  date: string;
}

export class DetectPatternsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionDto)
  transactions: TransactionDto[];
}