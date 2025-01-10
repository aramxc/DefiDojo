import { API_BASE_URL } from '../../config/constants';

export interface HistoricalMetrics {
  high: number;
  low: number;
  change: number;
}

export interface HistoricalDataPoint {
  timestamp: number;
  price: number;
  marketCap: number;
  volume: number;
}

export interface HistoricalPriceData {
  [key: string]: {
    data: HistoricalDataPoint[];
    metrics: {
      price: HistoricalMetrics;
      marketCap: HistoricalMetrics;
      volume: HistoricalMetrics;
    };
  };
}

export type TimeframeType = '1D' | '7D' | '1M' | '6M' | '1Y' | '5Y';

export class HistoricalPriceService {
  private baseUrl = `${API_BASE_URL}/prices`;
  private cache: Map<string, { data: HistoricalPriceData; timestamp: number }> = new Map();

  // TTL = Time To Live
  private getCacheTTL(timeframe: TimeframeType): number {
    switch (timeframe) {
      case '1D': 
        return 15 * 60 * 1000; // 15 minutes
      case '7D': 
        return 12 * 60 * 60 * 1000; // 12 hours
      case '1M':
        return 24 * 60 * 60 * 1000; // 24 hours
      case '6M':
      case '1Y':
        return 7 * 24 * 60 * 60 * 1000; // 7 days
      default:
        return 15 * 60 * 1000; // default to 15 minutes
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
      
      const formattedData = {
        [symbol]: {
          data: data.data,
          metrics: {
            price: data.metrics.price,
            marketCap: data.metrics.marketCap,
            volume: data.metrics.volume
          }
        }
      };

      this.cache.set(cacheKey, {
        data: formattedData,
        timestamp: Date.now()
      });

      return formattedData;
    } catch (error) {
      console.error('HistoricalPriceService: Error:', error);
      return {
        [symbol]: {
          data: [],
          metrics: {
            price: { high: 0, low: 0, change: 0 },
            marketCap: { high: 0, low: 0, change: 0 },
            volume: { high: 0, low: 0, change: 0 }
          }
        }
      };
    }
  }
}

export const historicalPriceService = new HistoricalPriceService();