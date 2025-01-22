import { Request, Response } from 'express';
import NodeCache from 'node-cache';
import { InfoService } from '../services/snowflake/info.service';
import { CoinGeckoService } from '../services/external/coingecko/coingecko.service';

export class InfoController {
    private infoService: InfoService;
    private coingeckoService: CoinGeckoService;
    private cache: NodeCache;
    

    constructor() {
        this.infoService = new InfoService();
        this.coingeckoService = new CoinGeckoService();
        // Set TTL to 5 minutes for real-time data and check expired keys every 60 seconds
        this.cache = new NodeCache({ 
            stdTTL: 300,
            checkperiod: 60,
            useClones: false
        });
    }

    private getCacheKey(type: string, identifier: string, realTime: boolean = false): string {
        return `${type}:${identifier}:${realTime}`;
    }

    async getAssetIdBySymbol(req: Request, res: Response) {
        try {
            const { symbol } = req.params;
            const assetId = await this.coingeckoService.getCoinList(symbol.toUpperCase());
            res.status(200).json(assetId);
        } catch (error) {
            console.error('Error fetching asset id:', error);
            res.status(500).json({ message: 'Failed to fetch asset id' });
        }
    }

    async getAssetInfoBySymbol(req: Request, res: Response) {
        try {
            const { symbol } = req.params;
            // Just return the Snowflake data (includes COINGECKO_ID)
            const data = await this.infoService.getAssetInfoBySymbol(symbol.toUpperCase());
            if (!data) {
                return res.status(404).json({ message: 'Asset not found' });
            }
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch asset info' });
        }
    }

    async getAssetInfoById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            
            if (!id) {
                return res.status(400).json({ message: 'Asset ID is required' });
            }

            const getRealTimeData = req.query.getRealTimeData === 'true';
            const cacheKey = this.getCacheKey('id', id, getRealTimeData);

            const cachedData = this.cache.get(cacheKey);
            if (cachedData) {
                console.log(`Cache hit for ${cacheKey}`);
                return res.status(200).json(cachedData);
            }

            console.log(`Cache miss for ${cacheKey}`);

            if (getRealTimeData) {
                try {
                    const realTimeData = await this.coingeckoService.getAssetInfoById(id);
                    if (realTimeData) {
                        this.cache.set(cacheKey, realTimeData);
                        return res.status(200).json(realTimeData);
                    }
                } catch (error) {
                    console.warn('Failed to fetch real-time data, falling back to Snowflake data:', error);
                }
            }

            // Fallback to Snowflake data
            const snowflakeData = await this.infoService.getAssetInfoById(id);
            if (!snowflakeData) {
                return res.status(404).json({ message: 'Asset not found' });
            }

            this.cache.set(cacheKey, snowflakeData);
            return res.status(200).json(snowflakeData);
        } catch (error) {
            console.error('Error in getAssetInfoById:', error);
            return res.status(500).json({ 
                message: 'Failed to fetch asset info',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getTopAssets(req: Request, res: Response) {
        try {
            const limit = parseInt(req.params.limit) || 100;

            // Validate limit
            if (isNaN(limit) || limit < 1 || limit > 1000) {
                return res.status(400).json({ message: 'Limit must be a number between 1 and 1000' });
            }

            const assets = await this.infoService.getTopAssets(limit);
            res.status(200).json(assets);
        } catch (error) {
            console.error('Error fetching top assets:', error);
            if (error instanceof Error) {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: 'Failed to fetch top assets' });
        }
    }

    async getMarketData(req: Request, res: Response) {
        try {
            const { coingeckoId } = req.params;
            const cacheKey = `market_${coingeckoId}`;
            
            // Check cache first
            const cachedData = this.cache.get(cacheKey);
            if (cachedData) {
                return res.status(200).json(cachedData);
            }

            // Fetch fresh market data
            const marketData = await this.coingeckoService.getCoinMarketData(coingeckoId);
            this.cache.set(cacheKey, marketData);
            res.status(200).json(marketData);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch market data' });
        }
    }
}
