import { Controller, Get, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { MerchantAnalysisService } from './merchant-analysis.service';
import { MemoryStoreService } from '../shared/memory-store.service';
import { NormalizeMerchantDto } from './dtos/normalize-merchant.dto';
import { NormalizedMerchant } from './interfaces/normalized-merchant.interface';

@Controller('api/analyze')
export class MerchantAnalysisController {
  constructor(
    private readonly merchantAnalysisService: MerchantAnalysisService,
    private readonly memoryStoreService: MemoryStoreService,
  ) {}

  @Post('merchant')
  @UsePipes(new ValidationPipe({ transform: true })) // Enable validation and transformation
  async normalizeMerchant(
    @Body('transaction') dto: NormalizeMerchantDto,
  ): Promise<{ normalized: NormalizedMerchant }> {
    // Normalize the merchant
    const normalized = await this.merchantAnalysisService.normalizeSingle(dto.description);
    return { normalized };
  }

}