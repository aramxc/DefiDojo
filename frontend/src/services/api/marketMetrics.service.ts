import { API_BASE_URL } from '../../config/constants';
import { MarketMetrics, FearGreed } from '@defidojo/shared-types';

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

            const [metricsResponse, fearGreedData] = await Promise.all([
                fetch(url),
                this.getFearGreedIndex()
            ]);
            
            if (!metricsResponse.ok) {
                const errorText = await metricsResponse.text();
                console.error('Error response:', errorText);
                throw new Error(`Failed to fetch market metrics: ${metricsResponse.status}`);
            }

            const metrics = await metricsResponse.json();
            
            // Combine the metrics with fear and greed data
            return {
                ...metrics,
                fearGreed: fearGreedData
            };

        } catch (error) {
            console.error('Error in getMarketMetrics:', error);
            throw error;
        }
    }

    async getFearGreedIndex(): Promise<FearGreed> {
        try {
            const response = await fetch(`${this.baseUrl}/fear-greed/current`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch fear and greed index: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error in getFearGreedIndex:', error);
            throw error;
        }
    }

    async getHistoricalFearGreedIndex(limit: number = 30): Promise<FearGreed[]> {
        try {
            const response = await fetch(`${this.baseUrl}/fear-greed/historical?limit=${limit}`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch historical fear and greed data: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error in getHistoricalFearGreedIndex:', error);
            throw error;
        }
    }
}

export const marketMetricsService = new MarketMetricsService();