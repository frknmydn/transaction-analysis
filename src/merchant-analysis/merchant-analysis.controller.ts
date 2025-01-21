import { Body, Controller, Post } from '@nestjs/common';
import { MerchantAnalysisService } from './merchant-analysis.service';
import { NormalizeMerchantDto } from './dtos/normalize-merchant.dto';

@Controller('api/analyze')
export class MerchantAnalysisController {
  constructor(private readonly merchantAnalysisService: MerchantAnalysisService) {}

  @Post('merchant')
  async normalizeMerchant(@Body('transaction') dto: NormalizeMerchantDto) {
    const result = await this.merchantAnalysisService.normalize(dto);
    return { normalized: result };
  }
}