import { Request, Response } from 'express';
import { CoinGeckoService } from '../services/external/coingecko/coingecko.service';
import { CoinMarketCapService } from '../services/external/coinmarketcap/coinmarketcap.service';
import NodeCache from 'node-cache';

export class MarketMetricsController {
    private static instance: MarketMetricsController;
    private coinGeckoService: CoinGeckoService = new CoinGeckoService();
    private coinMarketCapService: CoinMarketCapService = new CoinMarketCapService();
    private cache: NodeCache = new NodeCache({ 
        stdTTL: 24 * 60 * 60,
        checkperiod: 60
    });

    constructor() {
        if (MarketMetricsController.instance) {
            return MarketMetricsController.instance;
        }
        
        // Initialize services
        this.coinGeckoService = new CoinGeckoService();
        this.coinMarketCapService = new CoinMarketCapService();
        this.cache = new NodeCache({ 
            stdTTL: 24 * 60 * 60,
            checkperiod: 60
        });
        
        MarketMetricsController.instance = this;
        console.log('MarketMetricsController initialized');
    }

    getMarketMetrics = async (req: Request, res: Response) => {
        try {
            const { symbol } = req.params;
            const { coingeckoId } = req.query;
            console.log('Fetching metrics for symbol:', symbol, 'with CoinGecko ID:', coingeckoId);
            
            if (!symbol || !coingeckoId) {
                return res.status(400).json({ error: 'Symbol and coingeckoId parameters are required' });
            }

            // Check cache first
            const cacheKey = `market-metrics-${symbol.toLowerCase()}`;
            const cachedData = this.cache.get(cacheKey);
            
            if (cachedData) {
                console.log(`Cache hit for ${symbol} market metrics`);
                return res.json(cachedData);
            }

            console.log(`Cache miss for ${symbol} - fetching from API`);

            const metrics = await this.coinGeckoService.getMarketMetrics(coingeckoId as string);
            console.log('Metrics calculated:', metrics);

            // Cache the results
            const cacheSuccess = this.cache.set(cacheKey, metrics);
            console.log(`Cache ${cacheSuccess ? 'set' : 'failed'} for ${symbol} market metrics`);

            res.json(metrics);
        } catch (error) {
            console.error('Error in getMarketMetrics:', error);
            res.status(500).json({ 
                error: 'Failed to fetch market metrics',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    getCurrentFearGreed = async (_req: Request, res: Response) => {
        try {
            // Check cache first
            const cacheKey = 'fear-greed-current';
            const cachedData = this.cache.get(cacheKey);
            
            if (cachedData) {
                console.log('Cache hit for current fear & greed index');
                return res.json(cachedData);
            }

            console.log('Cache miss for fear & greed index - fetching from API');
            
            const fearGreedData = await this.coinMarketCapService.getFearAndGreedIndex();
            
            // Cache the results
            this.cache.set(cacheKey, fearGreedData);
            
            res.json(fearGreedData);
        } catch (error) {
            console.error('Error in getCurrentFearGreed:', error);
            res.status(500).json({ 
                error: 'Failed to fetch fear and greed index',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    getHistoricalFearGreed = async (req: Request, res: Response) => {
        try {
            const limit = parseInt(req.query.limit as string) || 30;
            
            // Check cache first
            const cacheKey = `fear-greed-historical-${limit}`;
            const cachedData = this.cache.get(cacheKey);
            
            if (cachedData) {
                console.log(`Cache hit for historical fear & greed data (limit: ${limit})`);
                return res.json(cachedData);
            }

            console.log(`Cache miss for historical fear & greed data - fetching from API`);
            
            const historicalData = await this.coinMarketCapService.getHistoricalFearAndGreedIndex(limit);
            
            // Cache the results
            this.cache.set(cacheKey, historicalData);
            
            res.json(historicalData);
        } catch (error) {
            console.error('Error in getHistoricalFearGreed:', error);
            res.status(500).json({ 
                error: 'Failed to fetch historical fear and greed data',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    clearCache = (symbol?: string) => {
        if (symbol) {
            const cacheKey = `market-metrics-${symbol.toLowerCase()}`;
            this.cache.del(cacheKey);
        } else {
            this.cache.flushAll();
        }
    };
}