import { Injectable } from '@nestjs/common';
import { PatternResult } from './interfaces/pattern-result.interface';

interface Transaction {
  description: string;
  amount: number;
  date: string;
}

@Injectable()
export class PatternAnalysisService {
  async detect(transactions: Transaction[]): Promise<PatternResult[]> {
    const patterns: PatternResult[] = [];

    const groupedByMerchant: Record<string, Transaction[]> = {};

    for (const tx of transactions) {
      const key = this.clean(tx.description);
      if (!groupedByMerchant[key]) {
        groupedByMerchant[key] = [];
      }
      groupedByMerchant[key].push(tx);
    }

    for (const merchantKey of Object.keys(groupedByMerchant)) {
      const txs = groupedByMerchant[merchantKey];
      const merchant = this.identifyMerchant(merchantKey);

      if (this.isLikelySubscription(merchant, txs)) {
        patterns.push({
          type: 'subscription',
          merchant,
          amount: txs[0].amount,
          frequency: 'monthly',
          confidence: 0.98,
          nextExpected: this.calculateNextDate(txs[txs.length - 1].date, 30), 
        });
      } else if (this.isLikelyRecurring(merchant, txs)) {
        patterns.push({
          type: 'recurring',
          merchant,
          amount: `~${this.calculateApproxAmount(txs)}`,
          frequency: 'weekly',
          confidence: 0.85,
          notes: 'Regular activity',
        });
      }
    }

    return patterns;
  }

  private clean(description: string): string {
    return description.replace(/\s+/g, '').toUpperCase();
  }

  private identifyMerchant(cleanedDesc: string): string {
    if (cleanedDesc.includes('NETFLIX') || cleanedDesc.includes('NFLX')) {
      return 'Netflix';
    } else if (cleanedDesc.includes('SPOTIFY')) {
      return 'Spotify';
    } else if (cleanedDesc.includes('UBER')) {
      return 'Uber';
    } else if (cleanedDesc.includes('APPLE')) {
      return 'Apple';
    } else if (cleanedDesc.includes('AMZN')) {
      return 'Amazon';
    } 
    // ... Diğer basit eşleşmeler
    return 'Unknown';
  }

  private isLikelySubscription(merchant: string, txs: Transaction[]): boolean {
    // Netflix, Spotify, Apple gibi her ay bir ya da iki kere sabit tutar çekiliyorsa subscription
    const subscriptionMerchants = ['Netflix', 'Spotify', 'Apple'];

    if (!subscriptionMerchants.includes(merchant)) return false;
    if (txs.length < 2) return false;

    // Tarihlere bakıp periyodun yaklaşık 30 gün olup olmadığına dair check yapılabilir
    // Burada basit demo bırakıyoruz
    return true;
  }

  private isLikelyRecurring(merchant: string, txs: Transaction[]): boolean {
    // Uber, Starbucks gibi düzensiz ama sık tekrar eden harcamaları "recurring" sayalım
    const recurringMerchants = ['Uber', 'Starbucks', 'Shell'];
    if (!recurringMerchants.includes(merchant)) return false;
    if (txs.length < 2) return false;
    return true;
  }

  private calculateNextDate(lastDate: string, daysToAdd: number): string {
    const d = new Date(lastDate);
    d.setDate(d.getDate() + daysToAdd);
    return d.toISOString().split('T')[0];
  }

  private calculateApproxAmount(txs: Transaction[]): number {
    // Kabaca ortalama hesaplayalım
    const sum = txs.reduce((acc, t) => acc + t.amount, 0);
    return Math.round((sum / txs.length) * 100) / 100;
  }
}