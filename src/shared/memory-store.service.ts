import { Injectable } from '@nestjs/common';

@Injectable()
export class MemoryStoreService {
  private merchantStore = new Map<string, any>();

  setMerchant(originalDescription: string, normalizedData: any): void {
    this.merchantStore.set(originalDescription, normalizedData);
  }

  getMerchant(originalDescription: string): any | undefined {
    return this.merchantStore.get(originalDescription);
  }

  hasMerchant(originalDescription: string): boolean {
    return this.merchantStore.has(originalDescription);
  }

  clearStore(): void {
    this.merchantStore.clear();
  }
}