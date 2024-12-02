import { config } from '../config/constants';
import { SYMBOL_TO_PYTH_ID } from '../config/constants';


interface PythPriceFeed {
    price: string;
    conf: string;
    expo: number;
    publish_time: number;
}
export class PythService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.pythHermesBaseUrl;
  }

  async getPriceFeeds(symbols: string[]) {
    try {
      // Convert symbols to Pyth IDs using the constants mapping
      const ids = symbols.map(symbol => {
        const id = SYMBOL_TO_PYTH_ID[symbol.toUpperCase()];
        if (!id) throw new Error(`No Pyth price feed ID found for symbol: ${symbol}`);
        return id;
      });
      const queryString = ids.map(id => `ids[]=${id}`).join('&');
      const url = `${this.baseUrl}/api/latest_price_feeds?${queryString}`;
      
      console.log('Fetching from Pyth URL:', url); // Add this log
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch price feeds: ${response.status} ${errorText}`);
      }
  
      const data = (await response.json()) as PythPriceFeed[];
      console.log('Raw Pyth response:', data); // Add this log
      
      // Transform the response to match your frontend expectations
      const transformedData = symbols.map((symbol, index) => {
        const priceData = data[index];
        const result = {
          id: symbol.toLowerCase(),
          symbol: symbol.toUpperCase(),
          price: priceData && priceData.price ? parseFloat(priceData.price) / (10 ** priceData.expo) : 0,
          conf: priceData && priceData.conf ? parseFloat(priceData.conf) / (10 ** priceData.expo) : 0,
          timestamp: priceData ? priceData.publish_time : Date.now()
        };
        console.log(`Transformed data for ${symbol}:`, result); // Add this log
        return result;
      });
      
      return transformedData;
    } catch (error) {
      console.error('Error fetching price feeds:', error);
      throw error;
    }
  }
}