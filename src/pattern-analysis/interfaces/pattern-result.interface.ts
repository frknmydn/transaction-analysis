export interface Transaction {
  description: string;
  amount: number;
  date: string;
}

export interface PatternResult {
  type: 'subscription' | 'recurring' | 'one-time';
  merchant: string;
  amount: number | string;
  frequency?: string;
  confidence: number;
  nextExpected?: string;
  notes?: string;
}

export interface MerchantPattern {
  name: string;
  patterns: string[];
  category: string;
  subCategory: string;
  flags: string[];
  isSubscription: boolean;
}