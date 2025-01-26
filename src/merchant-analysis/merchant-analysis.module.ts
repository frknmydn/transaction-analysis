import { Module } from '@nestjs/common';
import { MerchantAnalysisController } from './merchant-analysis.controller';
import { MerchantAnalysisService } from './merchant-analysis.service';
import { SharedModule } from '../shared/shared.module';
import { OpenaiModule } from 'src/ai/open-ai.module';

@Module({
  imports: [
    SharedModule,
    OpenaiModule,
  ],
  controllers: [MerchantAnalysisController],
  providers: [MerchantAnalysisService],
  exports: [MerchantAnalysisService],
})
export class MerchantAnalysisModule {}