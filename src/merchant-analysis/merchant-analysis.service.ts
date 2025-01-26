import { Injectable } from '@nestjs/common';
import { NormalizeMerchantDto } from './dtos/normalize-merchant.dto';
import { NormalizedMerchant } from './interfaces/normalized-merchant.interface';
import { OpenaiService } from '../ai/open-ai.service';

@Injectable()
export class MerchantAnalysisService {
  private readonly merchantCategories: Record<string, { category: string; subCategory: string }>;
  constructor(private readonly openaiService: OpenaiService) {
    this.merchantCategories = {
      "Amazon": { "category": "Shopping", "subCategory": "Online Retail" },
      "Netflix": { "category": "Entertainment", "subCategory": "Streaming Service" },
      "Uber": { "category": "Transportation", "subCategory": "Ride Sharing" },
      "Spotify": { "category": "Entertainment", "subCategory": "Music Streaming" },
      "Starbucks": { "category": "Food & Beverage", "subCategory": "Coffee Shop" },
      "Walmart": { "category": "Shopping", "subCategory": "Retail" },
      "Shell": { "category": "Transportation", "subCategory": "Gas Station" },
      "DoorDash": { "category": "Food & Beverage", "subCategory": "Food Delivery" },
      "Apple": { "category": "Digital Services", "subCategory": "App Store / Subscriptions" },
      "Target": { "category": "Shopping", "subCategory": "Retail" }
    };
  }

  async normalizeBatch(dtos: NormalizeMerchantDto[]): Promise<NormalizedMerchant[]> {
    const descriptions = dtos.map((dto) => this.cleanDescription(dto.description));

    const merchants = await this.openaiService.normalizeMerchants(descriptions);

    const subscriptionMerchants = ['Netflix', 'Spotify', 'Apple'];

    return merchants.map((merchant) => {
      const { category = 'Other', subCategory = 'Unknown' } =
        this.merchantCategories[merchant] || {};

      const isSubscription = subscriptionMerchants.includes(merchant);
      const flags: string[] = isSubscription ? ['subscription'] : [];

      return {
        merchant,
        category,
        subCategory,
        confidence: 0.95,
        isSubscription,
        flags,
      };
    });
  }

  private cleanDescription(description: string): string {
    return description.replace(/\s+/g, '').toUpperCase();
  }
}

