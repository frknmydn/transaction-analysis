export interface NormalizedMerchant {
    merchant: string;
    category: string;
    subCategory: string;
    confidence: number;
    isSubscription: boolean;
    flags?: string[];
  }