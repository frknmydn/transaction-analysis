import { Module } from '@nestjs/common';
import { PatternAnalysisService } from './pattern-analysis.service';
import { PatternAnalysisController } from './pattern-analysis.controller';

@Module({
  controllers: [PatternAnalysisController],
  providers: [PatternAnalysisService],
  exports: [PatternAnalysisService],
})
export class PatternAnalysisModule {}