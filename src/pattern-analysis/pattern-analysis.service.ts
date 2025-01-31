import { Injectable, Logger } from '@nestjs/common';
import { OpenaiService } from '../ai/open-ai.service';

@Injectable()
export class PatternAnalysisService {
  private readonly logger = new Logger(PatternAnalysisService.name);

  constructor(private readonly openaiService: OpenaiService) {}

  async detect(
    transactions: { description: string; amount: number; date: string }[],
  ): Promise<any[]> {
    try {
      const patterns = await this.openaiService.detectPattern(transactions);

      // it gorups patterns by merchant to avoid duplicates
      const uniquePatterns = this.groupPatternsByMerchant(patterns.patterns || []);

      return uniquePatterns;
    } catch (error) {
      this.logger.error('Error detecting patterns:', error);
      throw new Error('Failed to detect patterns');
    }
  }

  private groupPatternsByMerchant(patterns: any[]): any[] {
    const patternMap = new Map<string, any>();

    for (const pattern of patterns) {
      const merchant = pattern.merchant.toLowerCase();

      if (patternMap.has(merchant)) {
        const existingPattern = patternMap.get(merchant);

        if (pattern.confidence > existingPattern.confidence) {
          patternMap.set(merchant, pattern);
        }
      } else {
        patternMap.set(merchant, pattern);
      }
    }

    return Array.from(patternMap.values());
  }
}