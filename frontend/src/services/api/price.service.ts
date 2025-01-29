import { API_BASE_URL } from '../../config/constants';
import { AssetPriceData } from '@defidojo/shared-types';

/**
 * Service for fetching cryptocurrency price data from Pyth Network
 * Provides methods for both real-time and historical price information (currently not using historical)
 */
export class PriceService {
  private baseUrl = `${API_BASE_URL}/prices`;

  /**
   * Fetches latest prices for multiple cryptocurrencies
   * @param symbols Array of trading symbols (e.g., ['BTC', 'ETH'])
   * @returns Promise containing array of price data
   * @throws Error if the fetch request fails
   */
  async getLatestPrices(symbols: string[]): Promise<AssetPriceData[]> {
    try {
      const url = `${this.baseUrl}/latest?symbols=${symbols.join(',')}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch price data');
      }
  
      const data = await response.json();

      return data.map((item: any) => ({
        symbol: item.symbol,
        price: parseFloat(item.price.replace(/,/g, '')),
        timestamp: item.timestamp
      }));

    } catch (error) {
      // Return zeroed data on error to prevent UI crashes
      return symbols.map(symbol => ({
        symbol,
        price: 0,
        timestamp: 0
      }));
    }
  }

  /**
   * Fetches historical price data for a specific cryptocurrency
   * @param symbol Trading symbol (e.g., 'BTC')
   * @param days Number of days of historical data to fetch
   * @returns Promise containing array of historical price data
   * @throws Error if the fetch request fails
   */
  async getPriceHistory(symbol: string, days: number = 7): Promise<AssetPriceData[]> {
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

export const priceService = new PriceService();