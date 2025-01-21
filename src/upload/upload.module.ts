import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { MerchantAnalysisModule } from '../merchant-analysis/merchant-analysis.module';
import { PatternAnalysisModule } from '../pattern-analysis/pattern-analysis.module';

@Module({
  imports: [MerchantAnalysisModule, PatternAnalysisModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}