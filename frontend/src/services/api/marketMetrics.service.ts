import { MarketMetrics } from '@defidojo/shared-types';

export const marketMetricsService = {
    getMarketMetrics: async (symbol: string): Promise<MarketMetrics> => {
        return await marketMetricsService.getMarketMetrics(symbol);
    }
};