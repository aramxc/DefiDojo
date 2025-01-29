import { API_BASE_URL } from '../../config/constants';

/**
 * Represents metrics for a historical data point (high, low, change)
 */
export interface HistoricalMetrics {
  high: number;
  low: number;
  change: number;
}

/**
 * Represents a single historical data point with price, market cap, and volume
 */
export interface HistoricalDataPoint {
  timestamp: number;
  price: number;
  marketCap: number;
  volume: number;
}

/**
 * Represents historical price data for an asset, including metrics
 */
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

/**
 * Service for fetching historical price data for crypto assets
 */
export class HistoricalPriceService {
  private baseUrl = `${API_BASE_URL}/prices`;

  /**
   * Fetches historical price data for a given symbol and timeframe
   * @param symbol The trading symbol (e.g., 'BTC')
   * @param timeframe The time period to fetch data for
   * @param customRange Optional date range for custom timeframes
   * @returns Promise containing historical price data
   */
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