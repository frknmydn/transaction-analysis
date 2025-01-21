import { Injectable } from '@nestjs/common';
import { NormalizeMerchantDto } from './dtos/normalize-merchant.dto';
import { NormalizedMerchant } from './interfaces/normalized-merchant.interface';

@Injectable()
export class MerchantAnalysisService {
  async normalize(dto: NormalizeMerchantDto): Promise<NormalizedMerchant> {
    const cleanedDesc = this.cleanDescription(dto.description);
    let merchant = 'Unknown';
    let category = 'Other';
    let subCategory = 'Unknown';

    if (cleanedDesc.includes('AMZN')) {
      merchant = 'Amazon';
      category = 'Shopping';
      subCategory = 'Online Retail';
    } else if (cleanedDesc.includes('NFLX') || cleanedDesc.includes('NETFLIX')) {
      merchant = 'Netflix';
      category = 'Entertainment';
      subCategory = 'Streaming Service';
    } else if (cleanedDesc.includes('UBER')) {
      merchant = 'Uber';
      category = 'Transportation';
      subCategory = 'Ride Sharing';
    } else if (cleanedDesc.includes('SPOTIFY')) {
      merchant = 'Spotify';
      category = 'Entertainment';
      subCategory = 'Music Streaming';
    } else if (cleanedDesc.includes('STARBUCKS')) {
      merchant = 'Starbucks';
      category = 'Food & Beverage';
      subCategory = 'Coffee Shop';
    } else if (cleanedDesc.includes('WALMART')) {
      merchant = 'Walmart';
      category = 'Shopping';
      subCategory = 'Retail';
    } else if (cleanedDesc.includes('SHELL')) {
      merchant = 'Shell';
      category = 'Transportation';
      subCategory = 'Gas Station';
    } else if (cleanedDesc.includes('DOORDASH')) {
      merchant = 'DoorDash';
      category = 'Food & Beverage';
      subCategory = 'Food Delivery';
    } else if (cleanedDesc.includes('APPLE')) {
      merchant = 'Apple';
      category = 'Digital Services';
      subCategory = 'App Store / Subscriptions';
    } else if (cleanedDesc.includes('TARGET')) {
      merchant = 'Target';
      category = 'Shopping';
      subCategory = 'Retail';
    }

    const confidence = 0.95;
    const flags: string[] = [];

    const subscriptionMerchants = ['Netflix', 'Spotify', 'Apple'];
    const isSubscription = subscriptionMerchants.includes(merchant);

    if (isSubscription) flags.push('subscription');

    return {
      merchant,
      category,
      subCategory,
      confidence,
      isSubscription,
      flags,
    };
  }

  private cleanDescription(description: string): string {
    return description.replace(/\s+/g, '').toUpperCase();
  }
}