import { Module } from '@nestjs/common';
import { PatternAnalysisService } from './pattern-analysis.service';
import { PatternAnalysisController } from './pattern-analysis.controller';
import { SharedModule } from '../shared/shared.module';
import { OpenaiModule } from 'src/ai/open-ai.module';

@Module({
  imports: [
    SharedModule, 
    OpenaiModule
  ],
  controllers: [PatternAnalysisController],
  providers: [PatternAnalysisService],
  exports: [PatternAnalysisService],
})
export class PatternAnalysisModule {}