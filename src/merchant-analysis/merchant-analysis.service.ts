import { Injectable, Logger } from '@nestjs/common';
import { OpenaiService } from '../ai/open-ai.service';
import { NormalizedMerchant } from './interfaces/normalized-merchant.interface';

@Injectable()
export class MerchantAnalysisService {
  private readonly logger = new Logger(MerchantAnalysisService.name);

  constructor(private readonly openaiService: OpenaiService) { }

  async normalizeSingle(description: string): Promise<NormalizedMerchant> {
    try {
      const normalizedNames = await this.openaiService.normalizeMerchants([description]);
      const name = normalizedNames[0] || 'Unknown Merchant';

      return this.createNormalizedMerchant(name);
    } catch (error) {
      this.logger.error('Error normalizing merchant:', error);
      throw new Error('Failed to normalize merchant');
    }
  }

  async normalizeBatch(
    transactions: { description: string; amount: number; date: string }[],
  ): Promise<NormalizedMerchant[]> {
    try {
      const descriptions = transactions.map((t) => t.description);
      const normalizedNames = await this.openaiService.normalizeMerchants(descriptions);
      return normalizedNames.map((name) => this.createNormalizedMerchant(name));
      
    } catch (error) {
      this.logger.error('Error normalizing merchants:', error);
      throw new Error('Failed to normalize merchants');
    }
  }

  private createNormalizedMerchant(name: string): NormalizedMerchant {
    return {
      merchant: name || 'Unknown Merchant',
      category: this.inferCategory(name),
      subCategory: this.inferSubCategory(name),
      confidence: 0.95,
      isSubscription: this.isSubscription(name),
      flags: this.inferFlags(name),
    };
  }

  private inferCategory(merchant: string): string {
    // Enhanced category inference
    const merchantLower = merchant.toLowerCase();
    if (merchantLower.includes('amazon')) return 'Shopping';
    if (merchantLower.includes('netflix')) return 'Entertainment';
    if (merchantLower.includes('uber')) return 'Transportation';
    if (merchantLower.includes('spotify')) return 'Entertainment';
    if (merchantLower.includes('apple')) return 'Technology';
    if (merchantLower.includes('doordash')) return 'Food & Dining';
    if (merchantLower.includes('target')) return 'Retail';
    return 'Other';
  }

  private inferSubCategory(merchant: string): string {
    // Enhanced sub-category inference
    const merchantLower = merchant.toLowerCase();
    if (merchantLower.includes('amazon')) return 'Online Retail';
    if (merchantLower.includes('netflix')) return 'Streaming Service';
    if (merchantLower.includes('uber')) return 'Ride Sharing';
    if (merchantLower.includes('spotify')) return 'Music Streaming';
    if (merchantLower.includes('apple')) return 'Digital Services';
    if (merchantLower.includes('doordash')) return 'Food Delivery';
    if (merchantLower.includes('target')) return 'Department Store';
    return 'Other';
  }

  private isSubscription(merchant: string): boolean {
    // Enhanced subscription detection
    const subscriptionMerchants = [
      'netflix', 
      'spotify', 
      'amazon prime',
      'apple.com',
      'apple music',
      'apple tv'
    ];
    return subscriptionMerchants.some(sub => 
      merchant.toLowerCase().includes(sub)
    );
  }

  private inferFlags(merchant: string): string[] {
    // Enhanced flag inference
    const merchantLower = merchant.toLowerCase();
    const flags: string[] = [];

    if (merchantLower.includes('amazon')) {
      flags.push('online_purchase', 'marketplace');
    }
    if (merchantLower.includes('netflix')) {
      flags.push('subscription', 'digital_service');
    }
    if (merchantLower.includes('uber')) {
      flags.push('transportation', 'service');
    }
    if (merchantLower.includes('apple.com')) {
      flags.push('digital_service', 'technology');
    }
    if (merchantLower.includes('doordash')) {
      flags.push('food_delivery', 'service');
    }
    if (merchantLower.includes('target')) {
      flags.push('retail', 'in_store');
    }

    return flags;
  }
}