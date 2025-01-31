import { Injectable, Logger } from '@nestjs/common';
import { OpenaiService } from '../ai/open-ai.service';
import { MemoryStoreService } from '../shared/memory-store.service';
import { NormalizedMerchant } from './interfaces/normalized-merchant.interface';

@Injectable()
export class MerchantAnalysisService {
  private readonly logger = new Logger(MerchantAnalysisService.name);

  constructor(
    private readonly openaiService: OpenaiService,
    private readonly memoryStore: MemoryStoreService,
  ) {}

  async normalizeSingle(description: string): Promise<NormalizedMerchant> {
    try {
      // it retrieves caches first
      if (this.memoryStore.hasMerchant(description)) {
        return this.memoryStore.getMerchant(description);
      }

      // if not in cache, normalize using OpenAI
      const normalizedNames = await this.openaiService.normalizeMerchants([description]);
      const name = normalizedNames[0] || 'Unknown Merchant';
      const normalizedMerchant = this.createNormalizedMerchant(name);

      this.memoryStore.setMerchant(description, normalizedMerchant);

      return normalizedMerchant;
    } catch (error) {
      this.logger.error('Error normalizing merchant:', error);
      throw new Error('Failed to normalize merchant');
    }
  }

  async normalizeBatch(
    transactions: { description: string; amount: number; date: string }[],
  ): Promise<NormalizedMerchant[]> {
    try {
      const results: NormalizedMerchant[] = [];
      const descriptionsToNormalize: string[] = [];
      const indexMap: number[] = [];

      transactions.forEach((transaction, index) => {
        if (this.memoryStore.hasMerchant(transaction.description)) {
          results[index] = this.memoryStore.getMerchant(transaction.description);
        } else {
          descriptionsToNormalize.push(transaction.description);
          indexMap.push(index);
        }
      });

      if (descriptionsToNormalize.length > 0) {
        const normalizedNames = await this.openaiService.normalizeMerchants(descriptionsToNormalize);
        
        normalizedNames.forEach((name, i) => {
          const normalizedMerchant = this.createNormalizedMerchant(name);
          const originalDescription = descriptionsToNormalize[i];
          const originalIndex = indexMap[i];
          
          this.memoryStore.setMerchant(originalDescription, normalizedMerchant);
          
          results[originalIndex] = normalizedMerchant;
        });
      }

      return results;
    } catch (error) {
      this.logger.error('Error normalizing merchants:', error);
      throw new Error('Failed to normalize merchants');
    }
  }

  // Rest of the methods remain the same
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
    // Category inference logic remains the same
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
    // Sub-category inference logic remains the same
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