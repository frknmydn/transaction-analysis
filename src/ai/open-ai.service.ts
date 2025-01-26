import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';

@Injectable()
export class OpenaiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async normalizeMerchants(descriptions: string[]): Promise<string[]> {
    const prompt = `Normalize the following transaction descriptions into merchant names:\n${descriptions
      .map((desc, index) => `${index + 1}. ${desc}`)
      .join('\n')}\nReturn the merchant names as a JSON array.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an assistant that normalizes transaction descriptions.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const content = response.choices[0].message?.content ? response.choices[0].message.content.trim() : '';

    try {
      const cleanedContent = content.replace(/```json\n|```/g, '').trim();
      return JSON.parse(cleanedContent || '[]'); 
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      return [];
    }
  }

  async detectPattern(transactions: any[]): Promise<any> {
    const prompt = `Analyze the following transactions and detect patterns (e.g., subscriptions, recurring payments): ${JSON.stringify(
      transactions,
    )}. Return a JSON object with the detected patterns.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an assistant that analyzes transaction patterns.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const message = response.choices[0].message;
    const content = message && message.content ? message.content.trim() : '';
    try {
      return JSON.parse(content || '{}');
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      return { error: 'Failed to parse JSON response' };
    }
  }
}
