import { Request, Response } from 'express';
import { CoinGeckoService } from '../services/coingecko.service';
import { SYMBOL_TO_COINGECKO_ID } from '../config/constants';
import NodeCache from 'node-cache';

export class HistoricalPriceController {
    private coinGeckoService: CoinGeckoService;
    private cache: NodeCache;

    constructor() {
        this.coinGeckoService = new CoinGeckoService();
        this.cache = new NodeCache();
    }

    private getCacheTTL(timeframe: string): number {
        switch (timeframe) {
            case '1D': return 30;
            case '7D':
            case '1M': return 1800;
            case '6M':
            case '1Y': return 43200;
            default: return 1800;
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
            default:
                from = now - 24 * 60 * 60 * 1000;
        }

        return { from, to };
    }

    getHistoricalPrices = async (req: Request, res: Response) => {
        try {
            const { coinId, timeframe } = req.params;
            const symbol = coinId.toUpperCase();
            const geckoId = SYMBOL_TO_COINGECKO_ID[symbol];
            
            if (!geckoId) {
                return res.status(400).json({ error: `Unsupported symbol: ${symbol}` });
            }

            const cacheKey = `${geckoId}-${timeframe}`;
            const cachedData = this.cache.get(cacheKey);
            
            if (cachedData) {
                return res.json(cachedData);
            }

            const { from, to } = this.getTimeRange(timeframe);
            const data = await this.coinGeckoService.getHistoricalRangeData(geckoId, from, to);
            
            const formattedData = {
                id: geckoId,
                symbol: symbol,
                timeframe,
                prices: data.prices.map(([timestamp, price]: [number, number]) => ({
                    timestamp: timestamp * 1000,
                    price
                }))
            };

            this.cache.set(cacheKey, formattedData, this.getCacheTTL(timeframe));
            res.json(formattedData);
        } catch (error) {
            console.error('Historical price error:', error);
            res.status(500).json({ error: 'Failed to fetch historical data' });
        }
    };
} 