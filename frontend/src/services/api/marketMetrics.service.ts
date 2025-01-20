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

            const metricsResponse = await fetch(url);
            
            if (!metricsResponse.ok) {
                const errorText = await metricsResponse.text();
                console.error('Error response:', errorText);
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