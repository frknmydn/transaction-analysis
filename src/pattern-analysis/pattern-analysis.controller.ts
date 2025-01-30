import { Body, Controller, Get, Post } from '@nestjs/common';
import { PatternAnalysisService } from './pattern-analysis.service';
import { DetectPatternsDto } from './dtos/detect-patterns.dto';
import { MemoryStoreService } from '../shared/memory-store.service';

@Controller('api/analyze')
export class PatternAnalysisController {
  constructor(
    private readonly patternAnalysisService: PatternAnalysisService,
    private readonly memoryStoreService: MemoryStoreService,
  ) {}

  @Post('patterns')
  async detectPatterns(@Body() dto: DetectPatternsDto) {
    const patterns = await this.patternAnalysisService.detect(dto.transactions);
    return { patterns };
  }

}