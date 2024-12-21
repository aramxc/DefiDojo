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
      console.log('Historical data received:', data);

      // Calculate price change, low, and high from the prices array
      const prices = data.prices.map((p: any) => p.price);
      const firstPrice = prices[0];
      const lastPrice = prices[prices.length - 1];
      const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100;
      const lowPrice = Math.min(...prices);
      const highPrice = Math.max(...prices);

      return {
        [symbol]: {
          priceChange: Number(priceChange.toFixed(2)),
          lowPrice: Number(lowPrice.toFixed(2)),
          highPrice: Number(highPrice.toFixed(2))
        }
      };
    } catch (error) {
      console.error('HistoricalPriceService: Error:', error);
      return {
        [symbol]: {
          priceChange: 0,
          lowPrice: 0,
          highPrice: 0
        }
      };
    }
  }
}

export const historicalPriceService = new HistoricalPriceService();