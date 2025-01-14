import { MarketMetrics } from '@defidojo/shared-types';

export const marketMetricsService = {
    getMarketMetrics: async (symbol: string): Promise<MarketMetrics> => {
        const response = await fetch(`/api/market-metrics/${symbol}`);
        if (!response.ok) {
            throw new Error('Failed to fetch market metrics');
        }
        return response.json();
    }
};