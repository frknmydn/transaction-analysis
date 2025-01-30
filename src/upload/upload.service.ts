import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { MerchantAnalysisService } from '../merchant-analysis/merchant-analysis.service';
import { PatternAnalysisService } from '../pattern-analysis/pattern-analysis.service';
import { Readable } from 'stream';
import * as csvParser from 'csv-parser';
import { NormalizedMerchant } from 'src/merchant-analysis/interfaces/normalized-merchant.interface';

interface TransactionRow {
  description: string;
  amount: string;
  date: string;
}

export interface NormalizedResult {
  original: string;
  normalized?: NormalizedMerchant;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    private readonly merchantAnalysisService: MerchantAnalysisService,
    private readonly patternAnalysisService: PatternAnalysisService,
  ) {}

  private getUniqueTransactions(transactions: NormalizedResult[]): NormalizedResult[] {
    // Create a map to store unique transactions with their normalized data
    const uniqueTransactionsMap = new Map<string, NormalizedResult>();

    // Iterate through transactions, keeping only the first occurrence with normalized data
    transactions.forEach(transaction => {
      const existing = uniqueTransactionsMap.get(transaction.original);
      
      // Only add if not exists, or if current has normalized data but existing doesn't
      if (!existing || (!existing.normalized && transaction.normalized)) {
        uniqueTransactionsMap.set(transaction.original, transaction);
      }
    });

    return Array.from(uniqueTransactionsMap.values());
  }

  async parseAndStore(file: Express.Multer.File): Promise<{
    normalized_transactions: NormalizedResult[];
    detected_patterns: any[];
  }> {
    if (!file || !file.buffer) {
      throw new BadRequestException('Invalid file upload');
    }

    const rows: TransactionRow[] = [];

    // Parse CSV
    try {
      await new Promise<void>((resolve, reject) => {
        const stream = Readable.from(file.buffer);
        stream
          .pipe(csvParser())
          .on('data', (data) => rows.push(data))
          .on('error', (error) => {
            this.logger.error('Error parsing CSV:', error);
            reject(new BadRequestException('Failed to parse CSV file'));
          })
          .on('end', resolve);
      });
    } catch (error) {
      this.logger.error('Error processing file:', error);
      throw new BadRequestException('Failed to process file');
    }

    // Normalize merchants
    const normalizedResults = await this.merchantAnalysisService.normalizeBatch(
      rows.map((row) => ({
        description: row.description,
        amount: parseFloat(row.amount),
        date: row.date,
      })),
    );

    const transactions = rows.map((row, index) => ({
      original: row.description,
      normalized: normalizedResults[index],
    }));

    // Get unique transactions
    const normalized_transactions = this.getUniqueTransactions(transactions);

    // Detect patterns
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