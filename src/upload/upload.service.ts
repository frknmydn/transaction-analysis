// src/upload/upload.service.ts

import { Injectable } from '@nestjs/common';
import { MerchantAnalysisService } from '../merchant-analysis/merchant-analysis.service';
import { PatternAnalysisService } from '../pattern-analysis/pattern-analysis.service';
import { Readable } from 'stream';
import * as csvParser from 'csv-parser';
import { MemoryStoreService } from '../shared/memory-store.service';
import { NormalizedMerchant } from 'src/merchant-analysis/interfaces/normalized-merchant.interface';

@Injectable()
export class UploadService {
  constructor(
    private readonly merchantAnalysisService: MerchantAnalysisService,
    private readonly patternAnalysisService: PatternAnalysisService,
    private readonly memoryStoreService: MemoryStoreService,
  ) {}

  async parseAndStore(file: Express.Multer.File): Promise<any> {
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

    const normalizedResults: { original: any; normalized: NormalizedMerchant }[] = [];
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

    this.memoryStoreService.setNormalizedResults(normalizedResults);
    this.memoryStoreService.setDetectedPatterns(patterns);

    const totalSpend = this.calculateTotal(rows);
    const transactionCount = rows.length;
    

    return {
      rowCount: rows.length,
      totalSpend,
      message: 'Data parsed and stored successfully',
    };
  }

  private calculateTotal(rows: any[]): number {
    return rows.reduce((acc, r) => acc + parseFloat(r.amount), 0);
  }
}
