import { Controller, Get, Body, Post } from '@nestjs/common';
import { MerchantAnalysisService } from './merchant-analysis.service';
import { MemoryStoreService } from '../shared/memory-store.service';

@Controller('api/analyze')
export class MerchantAnalysisController {
  constructor(
    private readonly merchantAnalysisService: MerchantAnalysisService,
    private readonly memoryStoreService: MemoryStoreService,
  ) {}

  @Post('merchant')
  async normalizeMerchant(@Body('transaction') dto) {
    return {
      normalized: await this.merchantAnalysisService.normalizeBatch(dto),
    };
  }

  @Get('merchants')
  async getAllMerchants() {
    const normalized = this.memoryStoreService.getNormalizedResults();
    return { normalizedTransactions: normalized };
  }
}