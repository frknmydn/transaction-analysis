export interface PatternResult {
    type: 'subscription' | 'recurring' | 'one-time';
    merchant: string;
    amount: number | string;
    frequency?: string;
    confidence: number;
    nextExpected?: string;
    notes?: string;
  }