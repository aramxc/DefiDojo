import { Request, Response } from 'express';
import { CoinGeckoService } from '../services/external/coingecko/coingecko.service';
import NodeCache from 'node-cache';
import { AssetHistoricalRangeData } from '@defidojo/shared-types';

export class MarketMetricsController {
    private static instance: MarketMetricsController;
    private coinGeckoService = new CoinGeckoService();
    private cache = new NodeCache({ 
        stdTTL: 2 * 60, // 2 minutes for metrics
        checkperiod: 60 
    });
    private historicalCache = new NodeCache({ 
        stdTTL: 30 * 60, // 30 minutes
        checkperiod: 60 
    });

    constructor() {
        if (MarketMetricsController.instance) {
            return MarketMetricsController.instance;
        }
        MarketMetricsController.instance = this;
    }

    getMarketMetrics = async (req: Request, res: Response) => {
        try {
            const { symbol } = req.params;
            const { coingeckoId } = req.query;
            
            if (!symbol || !coingeckoId) {
                return res.status(400).json({ error: 'Symbol and coingeckoId parameters are required' });
            }

            // Check metrics cache first
            const metricsCacheKey = `market-metrics-${symbol.toLowerCase()}-${coingeckoId}`;
            const cachedMetrics = this.cache.get(metricsCacheKey);
            if (cachedMetrics) {
                console.log(`Returning cached market metrics for ${symbol}`);
                return res.json(cachedMetrics);
            }

            // Try to use cached historical data first
            const timeRange = {
                from: Date.now() - 30 * 24 * 60 * 60 * 1000,
                to: Date.now()
            };
            const historyCacheKey = `historical-${coingeckoId}-1M-${timeRange.from}-${timeRange.to}`;
            let historicalData = this.historicalCache.get(historyCacheKey);

            if (!historicalData) {
                console.log(`Fetching fresh historical data for ${symbol}`);
                historicalData = await this.coinGeckoService.getHistoricalRangeData(
                    coingeckoId as string,
                    timeRange.from,
                    timeRange.to
                );
                this.historicalCache.set(historyCacheKey, historicalData);
            }

            // Calculate metrics using historical data
            const metrics = await this.coinGeckoService.calculateMarketMetrics(historicalData as AssetHistoricalRangeData);
            this.cache.set(metricsCacheKey, metrics);
            
            res.json(metrics);
        } catch (error) {
            console.error('Error in getMarketMetrics:', error);
            
            // If we have cached data, return it even if it's stale
            const { symbol } = req.params;
            const { coingeckoId } = req.query;
            if (symbol && coingeckoId) {
                const cacheKey = `market-metrics-${symbol.toLowerCase()}-${coingeckoId}`;
                const staleCachedData = this.cache.get(cacheKey);
                if (staleCachedData) {
                    console.log(`Returning stale cached data for ${symbol} due to error`);
                    return res.json({
                        ...staleCachedData,
                        isStaleData: true
                    });
                }
            }

            res.status(500).json({ 
                error: 'Failed to fetch market metrics',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * Helper method to clear cache (useful for development/testing)
     * @param symbol Optional - specific symbol to clear from cache
     * @param coingeckoId Optional - specific coingeckoId to clear from cache
     */
    clearCache = (symbol?: string, coingeckoId?: string) => {
        if (symbol && coingeckoId) {
            const metricsCacheKey = `market-metrics-${symbol.toLowerCase()}-${coingeckoId}`;
            const historyCacheKey = `historical-${coingeckoId}-1M`;
            this.cache.del(metricsCacheKey);
            this.historicalCache.del(historyCacheKey);
            console.log(`Cleared cache for ${symbol}`);
        } else {
            this.cache.flushAll();
            this.historicalCache.flushAll();
            console.log('Cleared entire market metrics cache');
        }
    };
}