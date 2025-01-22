import { Module } from '@nestjs/common';
import { PatternAnalysisService } from './pattern-analysis.service';
import { PatternAnalysisController } from './pattern-analysis.controller';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    SharedModule, 
  ],
  controllers: [PatternAnalysisController],
  providers: [PatternAnalysisService],
  exports: [PatternAnalysisService],
})
export class PatternAnalysisModule {}