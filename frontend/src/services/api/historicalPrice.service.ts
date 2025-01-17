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

export type TimeframeType = '1D' | '7D' | '1M' | '6M' | '1Y' | '5Y' | 'Custom';

export class HistoricalPriceService {
  private baseUrl = `${API_BASE_URL}/prices`;

  async getHistoricalPrices(
    symbol: string,
    timeframe: TimeframeType,
    customRange?: { from: number; to: number }
  ): Promise<HistoricalPriceData> {
    try {
      let url = `${this.baseUrl}/historical/${symbol.toLowerCase()}/${timeframe}`;
      
      // Add custom range parameters if provided
      if (customRange) {
        url += `?from=${customRange.from}&to=${customRange.to}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch historical price data: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        [symbol]: {
          data: data.data,
          metrics: {
            price: data.metrics.price,
            marketCap: data.metrics.marketCap,
            volume: data.metrics.volume
          }
        }
      };
    } catch (error) {
      console.error('Frontend: HistoricalPriceService Error:', error);
      throw error;
    }
  }
}

export const historicalPriceService = new HistoricalPriceService();