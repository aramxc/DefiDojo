import { Request, Response } from 'express';
import { CoinGeckoService } from '../services/external/coingecko/coingecko.service';
import { SYMBOL_TO_COINGECKO_ID } from '../config/constants';
import NodeCache from 'node-cache';

export class HistoricalPriceController {
    private static instance: HistoricalPriceController;
    private coinGeckoService: CoinGeckoService = new CoinGeckoService();
    private cache: NodeCache = new NodeCache({ 
        stdTTL: 24 * 60 * 60,
        checkperiod: 60
    });

    constructor() {
        if (HistoricalPriceController.instance) {
            return HistoricalPriceController.instance;
        }
        HistoricalPriceController.instance = this;
        
        // Log cache initialization
        console.log('HistoricalPriceController initialized with new cache');
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

            let timeRange: { from: number; to: number };

            if (timeframe === 'Custom' && fromQuery && toQuery) {
                // Validate custom time range
                const from = Number(fromQuery);
                const to = Number(toQuery);
                
                if (isNaN(from) || isNaN(to) || from >= to) {
                    return res.status(400).json({ 
                        error: 'Invalid custom time range',
                        message: 'From date must be before to date'
                    });
                }

                timeRange = { from, to };
            } else {
                timeRange = this.getTimeRange(timeframe);
            }

            const cacheKey = `historical-${geckoId}-${timeframe}-${timeRange.from}-${timeRange.to}`;
            
            const cachedData = this.cache.get(cacheKey);
            if (cachedData) {
                console.log(`Cache hit for ${symbol} ${timeframe}`);
                return res.json(cachedData);
            }

            console.log(`Cache miss for ${symbol} ${timeframe} - fetching from API`);
            
            const data = await this.coinGeckoService.getHistoricalRangeData(
                geckoId, 
                timeRange.from, 
                timeRange.to
            );
            
            const formattedData = {
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
                    price: this.calculateMetrics(data.prices.map(p => p?.[1] ?? 0)),
                    marketCap: this.calculateMetrics(data.market_caps.map(m => m?.[1] ?? 0)),
                    volume: this.calculateMetrics(data.total_volumes.map(v => v?.[1] ?? 0))
                }
            };

            const cacheDuration = this.getCacheTTL(timeframe);
            const cacheSuccess = this.cache.set(cacheKey, formattedData, cacheDuration);
            console.log(`Cache ${cacheSuccess ? 'set' : 'failed'} for ${symbol} ${timeframe} (TTL: ${cacheDuration}s)`);

            res.json(formattedData);
        } catch (error: unknown) {
            console.error(`API Error: ${req.params.coinId} ${req.params.timeframe}`, 
                error instanceof Error ? error.message : 'Unknown error');
            res.status(500).json({ 
                error: 'Failed to fetch historical data',
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    };

    private getCacheTTL(timeframe: string): number {
        switch (timeframe) {
            case '1D':
                return 2 * 60;  // 2 minutes
            default:
                return 24 * 60 * 60;  // 24 hours
        }
    }

    private getTimeRange(timeframe: string): { from: number; to: number } {
        const now = Date.now();
        const to = now;
        let from: number;

        switch (timeframe) {
            case '1D':
                from = now - 24 * 60 * 60 * 1000;
                break;
            case '7D':
                from = now - 7 * 24 * 60 * 60 * 1000;
                break;
            case '1M':
                from = now - 30 * 24 * 60 * 60 * 1000;
                break;
            case '6M':
                from = now - 180 * 24 * 60 * 60 * 1000;
                break;
            case '1Y':
                from = now - 365 * 24 * 60 * 60 * 1000;
                break;
            case '5Y':
                from = now - 5 * 365 * 24 * 60 * 60 * 1000;
                break;
            default:
                from = now - 24 * 60 * 60 * 1000;
        }

        return { from, to };
    }

    private calculateMetrics(prices: number[]) {
        return {
            high: Math.max(...prices),
            low: Math.min(...prices),
            change: ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100
        };
    }
}