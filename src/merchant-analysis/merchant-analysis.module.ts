import { Module } from '@nestjs/common';
import { MerchantAnalysisController } from './merchant-analysis.controller';
import { MerchantAnalysisService } from './merchant-analysis.service';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    SharedModule, 
  ],
  controllers: [MerchantAnalysisController],
  providers: [MerchantAnalysisService],
  exports: [MerchantAnalysisService],
})
export class MerchantAnalysisModule {}