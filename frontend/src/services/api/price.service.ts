import { API_BASE_URL } from '../../config/constants';

export interface PriceData {
  id: string;
  price: number;
  conf: number;
  timestamp: number;
  symbol?: string;
}

export class PriceService {
  private baseUrl = `${API_BASE_URL}/prices`;

  async getLatestPrices(symbols: string[]): Promise<PriceData[]> {
    try {
      const url = `${this.baseUrl}/latest?symbols=${symbols.join(',')}`;
      console.log('Fetching prices from:', url); 
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch price data');
      }
  
      const data = await response.json();
      console.log('Received price data:', data); 
      return data;
    } catch (error) {
      console.error('Error fetching prices:', error);
      throw error;
    }
  }

  async getPriceHistory(symbol: string, days: number = 7): Promise<PriceData[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/historical?symbol=${symbol}&days=${days}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch historical price data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching price history:', error);
      throw error;
    }
  }
}

// Create a singleton instance
export const priceService = new PriceService();