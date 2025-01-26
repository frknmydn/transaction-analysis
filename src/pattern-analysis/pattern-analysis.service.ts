import { Injectable } from '@nestjs/common';
import { OpenaiService } from '../ai/open-ai.service';

@Injectable()
export class PatternAnalysisService {
  constructor(private readonly openaiService: OpenaiService) {}

  async detect(transactions: any[]): Promise<any[]> {
    const patterns = await this.openaiService.detectPattern(transactions);
    return patterns;
  }
}