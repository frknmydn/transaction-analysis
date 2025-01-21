import { Injectable } from '@nestjs/common';
import { MerchantAnalysisService } from '../merchant-analysis/merchant-analysis.service';
import { PatternAnalysisService } from '../pattern-analysis/pattern-analysis.service';
import * as csvParser from 'csv-parser';
import { Readable } from 'stream';
import { NormalizedMerchant } from 'src/merchant-analysis/interfaces/normalized-merchant.interface';

@Injectable()
export class UploadService {
  constructor(
    private readonly merchantAnalysisService: MerchantAnalysisService,
    private readonly patternAnalysisService: PatternAnalysisService,
  ) {}

  async parseAndProcess(file: Express.Multer.File): Promise<any> {
    const rows: any[] = [];

    // 1. CSV parse
    await new Promise<void>((resolve, reject) => {
      const stream = Readable.from(file.buffer);
      stream
        .pipe(csvParser())
        .on('data', (data) => rows.push(data))
        .on('error', reject)
        .on('end', resolve);
    });

    // 2. Merchant Normalization
    const normalizedResults: { original: string; normalized: NormalizedMerchant }[] = [];
    for (const row of rows) {
      const description = row.description;
      const amount = parseFloat(row.amount);
      const date = row.date;

      const normalized = await this.merchantAnalysisService.normalize({
        description,
        amount,
        date,
      });

      normalizedResults.push({
        original: description,
        normalized,
      });
    }

    // 3. Pattern Detection (toplu)
    const patterns = await this.patternAnalysisService.detect(
      rows.map((r) => ({
        description: r.description,
        amount: parseFloat(r.amount),
        date: r.date,
      })),
    );

    return {
      rowCount: rows.length,
      normalizedTransactions: normalizedResults,
      detectedPatterns: patterns,
    };
  }
}