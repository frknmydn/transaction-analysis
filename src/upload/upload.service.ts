import { Injectable, BadRequestException } from '@nestjs/common';
import { MerchantAnalysisService } from '../merchant-analysis/merchant-analysis.service';
import { PatternAnalysisService } from '../pattern-analysis/pattern-analysis.service';
import { Readable } from 'stream';
import * as csvParser from 'csv-parser';
import { MemoryStoreService } from '../shared/memory-store.service';
import { NormalizedMerchant } from 'src/merchant-analysis/interfaces/normalized-merchant.interface';

interface TransactionRow {
  description: string;
  amount: string;
  date: string;
}

export interface NormalizedResult {
  original: string;
  normalized: NormalizedMerchant;
}

@Injectable()
export class UploadService {
  constructor(
    private readonly merchantAnalysisService: MerchantAnalysisService,
    private readonly patternAnalysisService: PatternAnalysisService,
    private readonly memoryStoreService: MemoryStoreService,
  ) {}

  async parseAndStore(file: Express.Multer.File): Promise<{
    normalized_transactions: {
      original: string;
      normalized: NormalizedMerchant;
    }[];
    detected_patterns: any[];
  }> {
    if (!file || !file.buffer) {
      throw new BadRequestException('Invalid file upload');
    }
  
    const rows: TransactionRow[] = [];
  
    // Parse CSV
    await new Promise<void>((resolve, reject) => {
      const stream = Readable.from(file.buffer);
      stream
        .pipe(csvParser())
        .on('data', (data) => rows.push(data))
        .on('error', reject)
        .on('end', resolve);
    });

    // it should be batched i guess
    const normalizedResults = await this.merchantAnalysisService.normalizeBatch(
      rows.map((row) => ({
        description: row.description,
        amount: parseFloat(row.amount),
        date: row.date,
      })),
    );
  
    const normalized_transactions = rows.map((row, index) => ({
      original: row.description,
      normalized: normalizedResults[index],
    }));
  
    const detected_patterns = await this.patternAnalysisService.detect(
      rows.map((r) => ({
        description: r.description,
        amount: parseFloat(r.amount),
        date: r.date,
      })),
    );
  
    return {
      normalized_transactions,
      detected_patterns,
    };
  }
}