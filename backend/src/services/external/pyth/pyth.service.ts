import { config } from '../../../config/constants';
import { SYMBOL_TO_PYTH_ID } from '../../../config/constants';

// Types for Pyth price feed response
type PythPrice = {
  price: string;
  conf: string;
  expo: number;
  publish_time: number;
};

interface PythPriceFeed {
  id: string;
  price: PythPrice;
  ema_price: PythPrice;
}

export class PythService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.pythHermesBaseUrl;
  }

  /**
   * Fetches and formats price data from Pyth Network
   * @param symbols Array of trading pairs (e.g., ["BTC/USD", "ETH/USD"])
   * @returns Formatted price data with USD formatting
   */
  async getPriceFeeds(symbols: string[]) {
    try {
      const data = await this.fetchPriceData(symbols);
      return this.transformPriceData(symbols, data);
    } catch (error) {
      console.error('Error fetching price feeds:', error);
      throw error;
    }
  }

  /**
   * Formats a numerical value to USD string with commas
   * @param value The price or confidence value as a string
   * @param expo The exponent to adjust the value
   * @returns Formatted USD string
   */
  private formatUsdValue(value: string, expo: number): string {
    const actualValue = parseFloat(value) * Math.pow(10, expo);
    return actualValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  /**
   * Fetches raw price data from Pyth API
   * @param symbols Array of trading pairs
   * @returns Raw price data from Pyth API
   */
  private async fetchPriceData(symbols: string[]): Promise<PythPriceFeed[]> {
    const ids = symbols.map(symbol => {
      const id = SYMBOL_TO_PYTH_ID[symbol.toUpperCase()];
      if (!id) throw new Error(`No Pyth price feed ID found for symbol: ${symbol}`);
      return id;
    });

    const queryString = ids.map(id => `ids[]=${id}`).join('&');
    const url = `${this.baseUrl}/api/latest_price_feeds?${queryString}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Pyth API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Transforms raw Pyth data into formatted price feed data
   * @param symbols Array of trading pairs
   * @param data Raw price data from Pyth API
   * @returns Formatted price data
   */
  private transformPriceData(symbols: string[], data: PythPriceFeed[]) {
    return symbols.map((symbol, index) => {
      const priceData = data[index];
      
      return {
        id: symbol.toLowerCase(),
        symbol: symbol.toUpperCase(),
        price: priceData?.price 
          ? this.formatUsdValue(priceData.price.price, priceData.price.expo) 
          : "0.00",
        conf: priceData?.price 
          ? this.formatUsdValue(priceData.price.conf, priceData.price.expo) 
          : "0.00",
        timestamp: priceData?.price?.publish_time || Date.now(),
      };
    });
  }
}