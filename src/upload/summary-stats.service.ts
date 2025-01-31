import { Injectable } from '@nestjs/common';

interface TransactionInput {
  description: string;
  amount: number;
  date: string;
}

@Injectable()
export class SummaryStatsService {
  computeSummary(transactions: TransactionInput[]) {
    const negativeTxns = transactions.filter((txn) => txn.amount);

    const totalSpend = negativeTxns.reduce(
      (acc, txn) => acc + Math.abs(txn.amount),
      0,
    );

    const transactionCount = negativeTxns.length;

    const avgTransaction = transactionCount
      ? totalSpend / transactionCount
      : 0;

    return {
      totalSpend: parseFloat(totalSpend.toFixed(2)),
      transactions: transactionCount,
      avgTransaction: parseFloat(avgTransaction.toFixed(2)),
      merchants: 0,
    };
  }

  computeDistinctMerchants(normalizedMerchants: { merchant: string }[]) {
    const merchantSet = new Set<string>();
    for (const item of normalizedMerchants) {
      merchantSet.add(item.merchant);
    }
    return merchantSet.size;
  }
}