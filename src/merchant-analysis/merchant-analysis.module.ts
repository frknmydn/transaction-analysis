import { Module } from '@nestjs/common';
import { MerchantAnalysisController } from './merchant-analysis.controller';
import { MerchantAnalysisService } from './merchant-analysis.service';

@Module({
  controllers: [MerchantAnalysisController],
  providers: [MerchantAnalysisService],
  exports: [MerchantAnalysisService],
})
export class MerchantAnalysisModule {}
