import { Request, Response } from 'express';
import NodeCache from 'node-cache';
import { InfoService } from '../services/snowflake/info.service';
import { CoinGeckoService } from '../services/external/coingecko/coingecko.service';
import { transformSnowflakeToApi, transformCoinGeckoToApi } from '../utils/transformers';

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
            const symbol = req.params.symbol;
            
            if (!symbol) {
                return res.status(400).json({ message: 'Symbol is required' });
            }

            const asset = await this.infoService.getAssetInfoBySymbol(symbol.toUpperCase());
            
            // Send only the essential fields needed for ID lookup
            const response = {
                symbol: asset.symbol,
                coingeckoId: asset.coingeckoId,
                pythPriceFeedId: asset.pythPriceFeedId,
                name: asset.name
            };
            
            res.json(response);
        } catch (error) {
            res.status(404).json({ 
                message: `No asset found for symbol:`,
                error: 'NOT_FOUND'
            });
        }
    }

    async getAssetInfoBySymbol(req: Request, res: Response) {
        try {
            const { symbol } = req.params;
            const realTime = req.query.realTime === 'true';

            if (realTime) {
                // Get real-time data from CoinGecko
                const coingeckoData = await this.coingeckoService.getAssetInfoBySymbol(symbol.toUpperCase());
                const transformedCoinGeckoData = transformCoinGeckoToApi(coingeckoData);
                return res.status(200).json(transformedCoinGeckoData);
            } else {
                // Get static data from Snowflake
                const snowflakeData = await this.infoService.getAssetInfoBySymbol(symbol.toUpperCase());
                const transformedSnowflakeData = transformSnowflakeToApi(snowflakeData);
                return res.status(200).json(transformedSnowflakeData);
            }
        } catch (error) {
            console.error('Error in getAssetInfoBySymbol:', error);
            res.status(500).json({ 
                message: 'Failed to fetch asset info',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getAssetInfoById(req: Request, res: Response) {
        try {
            const { coingeckoId } = req.params;
            const realTime = req.query.realTime === 'true';
            
            if (!coingeckoId) {
                console.error('❌ Backend: Missing coingeckoId parameter');
                return res.status(400).json({ message: 'Coingecko ID is required' });
            }

            console.log('🔍 Backend: Processing request:', { coingeckoId, realTime });

            const cacheKey = this.getCacheKey('asset_info', coingeckoId, realTime);
            
            // Check cache first
            const cachedData = this.cache.get(cacheKey);
            if (cachedData) {
                console.log('📦 Backend: Returning cached data for:', coingeckoId);
                return res.status(200).json(cachedData);
            }

            // Try to get real-time data if requested
            if (realTime) {
                try {
                    console.log('🔄 Backend: Fetching real-time data from CoinGecko for:', coingeckoId);
                    const realTimeData = await this.coingeckoService.getAssetInfoById(coingeckoId);
                    if (realTimeData) {
                        const transformedData = transformCoinGeckoToApi(realTimeData);
                        this.cache.set(cacheKey, transformedData);
                        return res.status(200).json(transformedData);
                    }
                } catch (error) {
                    console.warn('⚠️ Backend: Failed to fetch real-time data, falling back to Snowflake');
                }
            }

            // Fallback to Snowflake data
            console.log('📊 Backend: Fetching Snowflake data for:', coingeckoId);
            const snowflakeData = await this.infoService.getAssetInfoById(coingeckoId);
            if (!snowflakeData) {
                console.error('❌ Backend: Asset not found in Snowflake');
                return res.status(404).json({ message: 'Asset not found' });
            }

            const transformedData = transformSnowflakeToApi(snowflakeData);
            this.cache.set(cacheKey, transformedData);
            return res.status(200).json(transformedData);

        } catch (error) {
            console.error('❌ Backend: Error in getAssetInfoById:', error);
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
            const transformedAssets = assets.map(asset => transformSnowflakeToApi(asset));
            res.status(200).json(transformedAssets);
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
            const transformedCoinGeckoData = transformCoinGeckoToApi(marketData);
            this.cache.set(cacheKey, transformedCoinGeckoData);
            res.status(200).json(transformedCoinGeckoData);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch market data' });
        }
    }
}
