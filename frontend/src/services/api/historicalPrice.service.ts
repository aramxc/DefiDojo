import { API_BASE_URL } from '../../config/constants';

export interface HistoricalPriceData {
  [key: string]: {
    priceChange: number;
    lowPrice: number;
    highPrice: number;
  };
}

export class HistoricalPriceService {
  private baseUrl = `${API_BASE_URL}/prices`;

  async getHistoricalPrices(
    symbol: string, 
    days: number = 30
  ): Promise<HistoricalPriceData> {
    try {
      const url = `${this.baseUrl}/historical/${symbol.toLowerCase()}/${days}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch historical price data: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('HistoricalPriceService: Error:', error);
      throw error;
    }
  }
}

export const historicalPriceService = new HistoricalPriceService();