import { API_BASE_URL } from '../../config/constants';
import { MarketMetrics } from '@defidojo/shared-types';

export class MarketMetricsService {
    private baseUrl = `${API_BASE_URL}/market-metrics`;

    async getMarketMetrics(symbol: string, coingeckoId?: string): Promise<MarketMetrics> {
        try {
            console.log('Fetching market metrics for:', symbol, coingeckoId ? `with CoinGecko ID: ${coingeckoId}` : '(from cache)');
            
            // Build URL with optional coingeckoId
            const url = coingeckoId 
                ? `${this.baseUrl}/${symbol}?coingeckoId=${coingeckoId}`
                : `${this.baseUrl}/${symbol}`;
                
            console.log('Full URL:', url);

            const response = await fetch(url);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Failed to fetch market metrics: ${response.status}`);
            }

            const data = await response.json();
            console.log('Received market metrics:', data);
            return data;

        } catch (error) {
            console.error('Error in getMarketMetrics:', error);
            throw error;
        }
    }
}

// Create a singleton instance
export const marketMetricsService = new MarketMetricsService();