import { Request, Response } from 'express';
import { CoinGeckoService } from '../services/external/coingecko/coingecko.service';
import { SYMBOL_TO_COINGECKO_ID } from '../config/constants';
import NodeCache from 'node-cache';

export class CoinInfoController {
    private coinGeckoService: CoinGeckoService;
    private cache: NodeCache;

    constructor() {
        this.coinGeckoService = new CoinGeckoService();
        this.cache = new NodeCache();
    }

    getCoinDetails = async (req: Request, res: Response) => {
        try {
            const { coinId } = req.params;
            const symbol = coinId.toUpperCase();
            const geckoId = SYMBOL_TO_COINGECKO_ID[symbol];
            
            if (!geckoId) {
                return res.status(400).json({ error: `Unsupported symbol: ${symbol}` });
            }

            const cacheKey = `coin-info-${geckoId}`;
            const cachedData = this.cache.get(cacheKey);
            
            if (cachedData) {
                return res.json(cachedData);
            }

            const coinInfo = await this.coinGeckoService.getCoinInfo(geckoId);
            
            // Cache for 1 hour (3600 seconds) since this data doesn't change frequently
            this.cache.set(cacheKey, coinInfo, 3600);
            res.json(coinInfo);
        } catch (error) {
            console.error('Coin info error:', error);
            res.status(500).json({ error: 'Failed to fetch coin information' });
        }
    };
}