import { Request, Response } from 'express';
import { CoinGeckoService } from '../services/external/coingecko/coingecko.service';
import { SYMBOL_TO_COINGECKO_ID } from '../config/constants';
import NodeCache from 'node-cache';

export class HistoricalPriceController {
    private static instance: HistoricalPriceController;
    private coinGeckoService = new CoinGeckoService();
    private cache = new NodeCache({ 
        stdTTL: 24 * 60 * 60, // 24 hours in seconds
        checkperiod: 60 // Check for expired keys every minute
    });

    constructor() {
        if (HistoricalPriceController.instance) {
            return HistoricalPriceController.instance;
        }
        HistoricalPriceController.instance = this;
    }

    getHistoricalPrices = async (req: Request, res: Response) => {
        try {
            const { coinId, timeframe } = req.params;
            const { from: fromQuery, to: toQuery } = req.query;
            const symbol = coinId.toUpperCase();
            const geckoId = SYMBOL_TO_COINGECKO_ID[symbol];
            
            if (!geckoId) {
                return res.status(400).json({ error: `Unsupported symbol: ${symbol}` });
            }

            // Handle custom or predefined timeframes
            const timeRange = timeframe === 'Custom' && fromQuery && toQuery
                ? this.validateCustomTimeRange(Number(fromQuery), Number(toQuery))
                : this.getTimeRange(timeframe);

            if (!timeRange) {
                return res.status(400).json({ 
                    error: 'Invalid time range',
                    message: 'From date must be before to date'
                });
            }

            // Try to get cached data first
            const cacheKey = `historical-${geckoId}-${timeframe}-${timeRange.from}-${timeRange.to}`;
            const cachedData = this.cache.get(cacheKey);
            if (cachedData) return res.json(cachedData);

            // Fetch and format new data
            const data = await this.coinGeckoService.getHistoricalRangeData(
                geckoId, 
                timeRange.from, 
                timeRange.to
            );
            
            const formattedData = this.formatHistoricalData(data, geckoId, symbol, timeframe);

            // Cache the formatted data
            const cacheDuration = timeframe === '1D' ? 2 * 60 : 24 * 60 * 60;
            this.cache.set(cacheKey, formattedData, cacheDuration);

            res.json(formattedData);
        } catch (error) {
            console.error(`API Error: ${req.params.coinId} ${req.params.timeframe}`, 
                error instanceof Error ? error.message : 'Unknown error');
            res.status(500).json({ 
                error: 'Failed to fetch historical data',
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    };

    private validateCustomTimeRange(from: number, to: number): { from: number; to: number } | null {
        return (!isNaN(from) && !isNaN(to) && from < to) 
            ? { from, to }
            : null;
    }

    private getTimeRange(timeframe: string): { from: number; to: number } {
        const now = Date.now();
        const timeframes: { [key: string]: number } = {
            '1D': 24 * 60 * 60 * 1000,
            '7D': 7 * 24 * 60 * 60 * 1000,
            '1M': 30 * 24 * 60 * 60 * 1000,
            '6M': 180 * 24 * 60 * 60 * 1000,
            '1Y': 365 * 24 * 60 * 60 * 1000,
            '5Y': 5 * 365 * 24 * 60 * 60 * 1000
        };

        return {
            from: now - (timeframes[timeframe] || timeframes['1D']),
            to: now
        };
    }

    private formatHistoricalData(data: any, geckoId: string, symbol: string, timeframe: string) {
        return {
            id: geckoId,
            symbol: symbol,
            timeframe,
            data: Array.from({ length: data.prices.length }, (_, i) => ({
                timestamp: data.prices[i]?.[0] ?? 0,
                price: data.prices[i]?.[1] ?? 0,
                marketCap: data.market_caps[i]?.[1] ?? 0,
                volume: data.total_volumes[i]?.[1] ?? 0
            })),
            metrics: {
                price: this.calculateMetrics(data.prices.map((p: any) => p?.[1] ?? 0)),
                marketCap: this.calculateMetrics(data.market_caps.map((m: any) => m?.[1] ?? 0)),
                volume: this.calculateMetrics(data.total_volumes.map((v: any) => v?.[1] ?? 0))
            }
        };
    }

    private calculateMetrics(values: number[]) {
        return {
            high: Math.max(...values),
            low: Math.min(...values),
            change: ((values[values.length - 1] - values[0]) / values[0]) * 100
        };
    }
}