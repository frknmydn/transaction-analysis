import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { MerchantAnalysisService } from '../merchant-analysis/merchant-analysis.service';
import { PatternAnalysisService } from '../pattern-analysis/pattern-analysis.service';
import { Readable } from 'stream';
import * as csvParser from 'csv-parser';
import { NormalizedMerchant } from 'src/merchant-analysis/interfaces/normalized-merchant.interface';
import { SummaryStatsService } from './summary-stats.service';

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
    private readonly summaryStatsService: SummaryStatsService,
  ) { }

  private getUniqueTransactions(transactions: NormalizedResult[]): NormalizedResult[] {
    // its a map to store unique transactions with their normalized data
    const uniqueTransactionsMap = new Map<string, NormalizedResult>();

    transactions.forEach(transaction => {
      const existing = uniqueTransactionsMap.get(transaction.original);

      // add if not exists, or if current has normalized data but existing doesn't
      if (!existing || (!existing.normalized && transaction.normalized)) {
        uniqueTransactionsMap.set(transaction.original, transaction);
      }
    });

    return Array.from(uniqueTransactionsMap.values());
  }

  async parseAndStore(file: Express.Multer.File): Promise<{
    normalized_transactions: NormalizedResult[];
    detected_patterns: any[];
    summary: {
      totalSpend: number;
      transactions: number;
      avgTransaction: number;
      merchants: number;
    };
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

    const normalized_transactions = this.getUniqueTransactions(transactions);

    const detected_patterns = await this.patternAnalysisService.detect(
      rows.map((r) => ({
        description: r.description,
        amount: parseFloat(r.amount),
        date: r.date,
      })),
    );

    const { totalSpend, transactions: transactionCount, avgTransaction } =
      this.summaryStatsService.computeSummary(
        rows.map((row) => ({
          description: row.description,
          amount: parseFloat(row.amount),
          date: row.date,
        }))
      );

    const merchants =
      this.summaryStatsService.computeDistinctMerchants(normalizedResults);

    const summary = {
      totalSpend,
      transactions: transactionCount,
      avgTransaction,
      merchants,
    };

    return {
      normalized_transactions,
      detected_patterns,
      summary,
    };
  }
}