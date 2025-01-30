import { Injectable, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';

@Injectable()
export class OpenaiService {
  private readonly logger = new Logger(OpenaiService.name);
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async normalizeMerchants(descriptions: string[]): Promise<string[]> {
    const prompt = `Normalize the following transaction descriptions into merchant names. Return the merchant names as a JSON array. Example:
    Input: ["AMZN MKTP US*Z1234ABC", "NFLX DIGITAL NTFLX US"]
    Output: ["Amazon", "Netflix"]

    Input:\n${descriptions
      .map((desc, index) => `${index + 1}. ${desc}`)
      .join('\n')}\nOutput:`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an assistant that normalizes transaction descriptions.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const content = response.choices[0].message?.content?.trim() || '[]';
      const cleanedContent = content.replace(/json\n|```/g, '').trim();

      return JSON.parse(cleanedContent);
    } catch (error) {
      this.logger.error('Error normalizing merchants:', error);
      throw new Error('Failed to normalize merchants');
    }
  }

  async detectPattern(transactions: any[]): Promise<any> {
    const prompt = `Analyze the following transactions and detect patterns (e.g., subscriptions, recurring payments). Return a JSON object with the detected patterns. Example:
    Input: [{"description": "NETFLIX", "amount": -19.99, "date": "2024-01-01"}]
    Output: {"patterns": [{"type": "subscription", "merchant": "Netflix", "amount": 19.99, "frequency": "monthly", "confidence": 0.98, "next_expected": "2024-02-01"}]}

    Input:\n${JSON.stringify(transactions)}\nOutput:`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an assistant that analyzes transaction patterns.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const content = response.choices[0].message?.content?.trim() || '{}';
      const cleanedContent = content.replace(/json\n|```/g, '').trim();

      return JSON.parse(cleanedContent);
    } catch (error) {
      this.logger.error('Error detecting patterns:', error);
      throw new Error('Failed to detect patterns');
    }
  }
}