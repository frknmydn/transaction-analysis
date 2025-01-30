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
      // Detect patterns using OpenAI
      const patterns = await this.openaiService.detectPattern(transactions);

      // Group patterns by merchant to avoid duplicates
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

      // If the merchant already exists in the map, update the pattern if necessary
      if (patternMap.has(merchant)) {
        const existingPattern = patternMap.get(merchant);

        // Update the pattern if the new one has higher confidence
        if (pattern.confidence > existingPattern.confidence) {
          patternMap.set(merchant, pattern);
        }
      } else {
        // Add the pattern to the map if the merchant doesn't exist
        patternMap.set(merchant, pattern);
      }
    }

    // Convert the map back to an array
    return Array.from(patternMap.values());
  }
}