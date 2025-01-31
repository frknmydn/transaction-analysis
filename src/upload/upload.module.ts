import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { MerchantAnalysisModule } from '../merchant-analysis/merchant-analysis.module';
import { PatternAnalysisModule } from '../pattern-analysis/pattern-analysis.module';
import { SharedModule } from '../shared/shared.module';
import { SummaryStatsService } from './summary-stats.service';

@Module({
  imports: [
    MerchantAnalysisModule,
    PatternAnalysisModule,
    SharedModule,
  ],
  controllers: [UploadController],
  providers: [UploadService, SummaryStatsService],
})
export class UploadModule {}
