import { API_BASE_URL } from '../../config/constants';
import { MarketMetrics } from '@defidojo/shared-types';

/**
 * Service for fetching detailed market metrics for crypto assets
 * Provides methods to fetch comprehensive market data including price, volume, and market cap
 */
export class MarketMetricsService {
    private baseUrl = `${API_BASE_URL}/market-metrics`;

    /**
     * Fetches comprehensive market metrics for a specific asset
     * @param symbol Trading symbol (e.g., 'BTC')
     * @param coingeckoId Optional CoinGecko ID for fresh data fetch
     * @returns Promise containing market metrics data
     * @throws Error if the fetch request fails
     */
    async getMarketMetrics(symbol: string, coingeckoId?: string): Promise<MarketMetrics> {
        try {
            // Build URL with optional coingeckoId
            const url = coingeckoId 
                ? `${this.baseUrl}/${symbol}?coingeckoId=${coingeckoId}`
                : `${this.baseUrl}/${symbol}`;

            const metricsResponse = await fetch(url);
            
            if (!metricsResponse.ok) {
                const errorText = await metricsResponse.text();
                throw new Error(`Failed to fetch market metrics: ${metricsResponse.status}`);
            }

            const metrics = await metricsResponse.json();
            return metrics;

        } catch (error) {
            console.error('Error in getMarketMetrics:', error);
            throw error;
        }
    }
}

export const marketMetricsService = new MarketMetricsService();