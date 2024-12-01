import { config } from '../config/config';

export class PythService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.pythHermesBaseUrl;
  }

  async getPriceFeeds(ids: string[]) {
    try {
      const response = await fetch(`${this.baseUrl}/api/latest_price_feeds?ids[]=${ids.join('&ids[]=')}`)
      if (!response.ok) throw new Error('Failed to fetch price feeds');
      return await response.json();
    } catch (error) {
      console.error('Error fetching price feeds:', error);
      throw error;
    }
  }
}
