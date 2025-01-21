import { Body, Controller, Post } from '@nestjs/common';
import { PatternAnalysisService } from './pattern-analysis.service';
import { DetectPatternsDto } from './dtos/detect-patterns.dto';

@Controller('api/analyze')
export class PatternAnalysisController {
  constructor(private readonly patternAnalysisService: PatternAnalysisService) {}

  @Post('patterns')
  async detectPatterns(@Body() dto: DetectPatternsDto) {
    const patterns = await this.patternAnalysisService.detect(dto.transactions);
    return { patterns };
  }
}