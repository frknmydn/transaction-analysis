import { Injectable } from '@nestjs/common';

@Injectable()
export class MemoryStoreService {
  private normalizedResults: any[] = [];
  private detectedPatterns: any[] = [];

  setNormalizedResults(results: any[]) {
    this.normalizedResults = results;
  }
  getNormalizedResults() {
    return this.normalizedResults;
  }

  setDetectedPatterns(patterns: any[]) {
    this.detectedPatterns = patterns;
  }
  getDetectedPatterns() {
    return this.detectedPatterns;
  }
}