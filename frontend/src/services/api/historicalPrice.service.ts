import { API_BASE_URL } from '../../config/constants';

export interface HistoricalPriceData {
  [key: string]: {
    priceChange: number;
    lowPrice: number;
    highPrice: number;
    prices: Array<{ timestamp: number; price: number }>;
  };
}

export type TimeframeType = '1D' | '7D' | '1M' | '6M' | '1Y';

export class HistoricalPriceService {
  private baseUrl = `${API_BASE_URL}/prices`;
  private cache: Map<string, { data: HistoricalPriceData; timestamp: number }> = new Map();

  private getCacheTTL(timeframe: TimeframeType): number {
    switch (timeframe) {
      case '1D': return 30 * 1000; // 30 seconds
      case '7D':
      case '1M': return 30 * 60 * 1000; // 30 minutes
      case '6M':
      case '1Y': return 12 * 60 * 60 * 1000; // 12 hours
      default: return 30 * 60 * 1000;
    }
  }

  private isCacheValid(cacheKey: string): boolean {
    const cached = this.cache.get(cacheKey);
    if (!cached) return false;
    
    const now = Date.now();
    return (now - cached.timestamp) < this.getCacheTTL(cacheKey.split('-')[1] as TimeframeType);
  }

  async getHistoricalPrices(
    symbol: string,
    timeframe: TimeframeType
  ): Promise<HistoricalPriceData> {
    try {
      const cacheKey = `${symbol}-${timeframe}`;
      
      // Check cache first
      if (this.isCacheValid(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (cached) return cached.data;
      }

      const url = `${this.baseUrl}/historical/${symbol.toLowerCase()}/${timeframe}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch historical price data: ${response.status}`);
      }

      const data = await response.json();
      
      // Calculate price metrics
      const prices = data.prices;
      const firstPrice = prices[0].price;
      const lastPrice = prices[prices.length - 1].price;
      const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100;
      const allPrices = prices.map((p: any) => p.price);
      const lowPrice = Math.min(...allPrices);
      const highPrice = Math.max(...allPrices);

      const formattedData = {
        [symbol]: {
          priceChange: Number(priceChange.toFixed(2)),
          lowPrice: Number(lowPrice.toFixed(2)),
          highPrice: Number(highPrice.toFixed(2)),
          prices: data.prices
        }
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: formattedData,
        timestamp: Date.now()
      });

      return formattedData;
    } catch (error) {
      console.error('HistoricalPriceService: Error:', error);
      return {
        [symbol]: {
          priceChange: 0,
          lowPrice: 0,
          highPrice: 0,
          prices: []
        }
      };
    }
  }
}

export const historicalPriceService = new HistoricalPriceService();