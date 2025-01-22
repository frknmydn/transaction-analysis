import { Injectable } from '@nestjs/common';
import { Transaction, PatternResult, MerchantPattern } from './interfaces/pattern-result.interface';

@Injectable()
export class PatternAnalysisService {
  private readonly merchantPatterns: MerchantPattern[] = [
    {
      name: 'Netflix',
      patterns: ['NFLX', 'NETFLIX'],
      category: 'Entertainment',
      subCategory: 'Streaming Service',
      flags: ['subscription', 'digital_service'],
      isSubscription: true
    },
    {
      name: 'Spotify',
      patterns: ['SPOTIFY'],
      category: 'Entertainment',
      subCategory: 'Music Streaming',
      flags: ['subscription', 'digital_service'],
      isSubscription: true
    },
    {
      name: 'Uber',
      patterns: ['UBER'],
      category: 'Transportation',
      subCategory: 'Ride Sharing',
      flags: ['transportation', 'service'],
      isSubscription: false
    },
    {
      name: 'Apple',
      patterns: ['APPLE.COM'],
      category: 'Technology',
      subCategory: 'Digital Services',
      flags: ['subscription', 'digital_service'],
      isSubscription: true
    },
    {
      name: 'Amazon',
      patterns: ['AMZN'],
      category: 'Shopping',
      subCategory: 'Online Retail',
      flags: ['online_purchase', 'marketplace'],
      isSubscription: false
    },
    {
      name: 'Starbucks',
      patterns: ['STARBUCKS'],
      category: 'Food & Dining',
      subCategory: 'Coffee Shop',
      flags: ['food', 'retail'],
      isSubscription: false
    },
    {
      name: 'Shell',
      patterns: ['SHELL OIL'],
      category: 'Transportation',
      subCategory: 'Gas Station',
      flags: ['gas', 'retail'],
      isSubscription: false
    },
    {
      name: 'Walmart',
      patterns: ['WALMART'],
      category: 'Shopping',
      subCategory: 'Retail',
      flags: ['retail', 'department_store'],
      isSubscription: false
    },
    {
      name: 'Target',
      patterns: ['TARGET'],
      category: 'Shopping',
      subCategory: 'Retail',
      flags: ['retail', 'department_store'],
      isSubscription: false
    },
    {
      name: 'DoorDash',
      patterns: ['DOORDASH'],
      category: 'Food & Dining',
      subCategory: 'Food Delivery',
      flags: ['food', 'delivery'],
      isSubscription: false
    }
  ];

  async detect(transactions: Transaction[]): Promise<PatternResult[]> {
    if (!Array.isArray(transactions)) {
      return [];
    }

    // Filter out invalid transactions before processing
    const validTransactions = transactions.filter(tx =>
      tx &&
      typeof tx === 'object' &&
      typeof tx.description === 'string' &&
      typeof tx.amount === 'number' &&
      typeof tx.date === 'string' &&
      !isNaN(Date.parse(tx.date))
    );

    if (validTransactions.length === 0) {
      return [];
    }

    const patterns: PatternResult[] = [];
    const groupedByMerchant = this.groupTransactionsByMerchant(validTransactions);

    for (const [merchantName, txs] of Object.entries(groupedByMerchant)) {
      try {
        const merchantInfo = this.getMerchantInfo(merchantName);

        if (this.isSubscriptionPattern(merchantInfo, txs)) {
          patterns.push(this.createSubscriptionPattern(merchantName, txs));
        } else if (this.isRecurringPattern(txs)) {
          patterns.push(this.createRecurringPattern(merchantName, txs));
        }
      } catch (error) {
        console.error(`Error processing merchant ${merchantName}:`, error);
        continue;
      }
    }

    return patterns;
  }

  private groupTransactionsByMerchant(transactions: Transaction[]): Record<string, Transaction[]> {
    const grouped: Record<string, Transaction[]> = {};

    for (const tx of transactions) {
      try {
        const merchantName = this.identifyMerchant(tx.description);
        if (!grouped[merchantName]) {
          grouped[merchantName] = [];
        }
        grouped[merchantName].push(tx);
      } catch (error) {
        console.error('Error grouping transaction:', error);
        continue;
      }
    }

    return grouped;
  }

  private identifyMerchant(description: string | undefined): string {
    if (!description) {
      return 'Unknown';
    }

    const cleanDescription = description.trim().toUpperCase();

    for (const merchant of this.merchantPatterns) {
      if (merchant.patterns.some(pattern =>
        pattern && cleanDescription.includes(pattern.toUpperCase())
      )) {
        return merchant.name;
      }
    }
    return 'Unknown';
  }

  private getMerchantInfo(merchantName: string): MerchantPattern | undefined {
    return this.merchantPatterns.find(m => m.name === merchantName);
  }

  /**
   * Tek bir transaction gelse bile, isSubscription=true olan merchantlar için bunu "subscription" sayar.
   */
  private isSubscriptionPattern(merchantInfo: MerchantPattern | undefined, transactions: Transaction[]): boolean {
    if (!merchantInfo?.isSubscription || !Array.isArray(transactions)) {
      return false;
    }

    try {
      // 1 adet transaction dahi olsa abone varsayalım
      if (transactions.length === 1) {
        return true;
      }

      // 2 veya daha fazla transaction varsa tarih aralığına göre kontrol
      if (transactions.length < 2) {
        return false;
      }

      const amounts = new Set(transactions.map(t => t.amount));
      if (amounts.size !== 1) return false;

      const sortedDates = transactions
        .map(t => new Date(t.date).getTime())
        .sort((a, b) => a - b);

      const intervals = this.calculateIntervals(sortedDates);
      if (intervals.length === 0) return false;

      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

      return Math.abs(avgInterval - 30) <= 5; // Approximately monthly
    } catch (error) {
      console.error('Error checking subscription pattern:', error);
      return false;
    }
  }

  private isRecurringPattern(transactions: Transaction[]): boolean {
    if (!Array.isArray(transactions) || transactions.length < 3) {
      return false;
    }

    try {
      const sortedDates = transactions
        .map(t => new Date(t.date).getTime())
        .sort((a, b) => a - b);

      const intervals = this.calculateIntervals(sortedDates);
      if (intervals.length === 0) return false;

      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

      // Örnek: 7 günden kısa periyotları "weekly" kabul ediyoruz
      return avgInterval <= 7;
    } catch (error) {
      console.error('Error checking recurring pattern:', error);
      return false;
    }
  }

  private calculateIntervals(timestamps: number[]): number[] {
    if (!Array.isArray(timestamps) || timestamps.length < 2) {
      return [];
    }

    const intervals: number[] = [];
    for (let i = 1; i < timestamps.length; i++) {
      const days = (timestamps[i] - timestamps[i - 1]) / (1000 * 60 * 60 * 24);
      if (!isNaN(days)) {
        intervals.push(days);
      }
    }
    return intervals;
  }

  private createSubscriptionPattern(merchantName: string, transactions: Transaction[]): PatternResult {
    try {
      const lastTx = transactions[transactions.length - 1];
      const lastDate = new Date(lastTx.date);
      const nextDate = new Date(lastDate);
      nextDate.setMonth(nextDate.getMonth() + 1);

      // Tek transaction da olsa, ilk transaction'ın tutarını pozitif göstermeyi seçiyoruz:
      const absoluteAmount = Math.abs(transactions[0].amount);

      return {
        type: 'subscription',
        merchant: merchantName,
        amount: absoluteAmount,
        frequency: 'monthly',
        confidence: 0.98,
        nextExpected: nextDate.toISOString().split('T')[0],
      };
    } catch (error) {
      console.error('Error creating subscription pattern:', error);
      throw error;
    }
  }

  private createRecurringPattern(merchantName: string, transactions: Transaction[]): PatternResult {
    try {
      const avgAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0) / transactions.length;

      return {
        type: 'recurring',
        merchant: merchantName,
        amount: `~${avgAmount.toFixed(2)}`,
        frequency: 'weekly',
        confidence: 0.85,
        notes: this.generateRecurringNote(transactions),
      };
    } catch (error) {
      console.error('Error creating recurring pattern:', error);
      throw error;
    }
  }

  private generateRecurringNote(transactions: Transaction[]): string {
    try {
      const weekdayCount = new Array(7).fill(0);
      transactions.forEach(tx => {
        const day = new Date(tx.date).getDay();
        if (!isNaN(day)) {
          weekdayCount[day]++;
        }
      });

      const maxCount = Math.max(...weekdayCount);
      const preferredDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        .filter((_, index) => weekdayCount[index] === maxCount);

      if (preferredDays.length === 1) {
        return `Regular ${preferredDays[0]} activity`;
      }
      return 'Regular activity';
    } catch (error) {
      console.error('Error generating recurring note:', error);
      return 'Regular activity';
    }
  }
}
