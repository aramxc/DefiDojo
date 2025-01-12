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

  async getHistoricalPrices(
    symbol: string,
    timeframe: TimeframeType
  ): Promise<HistoricalPriceData> {
    try {
      console.log('Frontend: Requesting historical data:', { symbol, timeframe });
      
      const url = `${this.baseUrl}/historical/${symbol.toLowerCase()}/${timeframe}`;
      console.log('Frontend: Request URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Frontend: API Error:', {
          status: response.status,
          data: errorData
        });
        throw new Error(errorData.message || `Failed to fetch historical price data: ${response.status}`);
      }

      const data = await response.json();
      console.log('Frontend: Received data successfully');
      
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