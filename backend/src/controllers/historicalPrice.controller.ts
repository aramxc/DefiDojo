import { Request, Response } from 'express';
import { CoinGeckoService } from '../services/coingecko.service';
import { SYMBOL_TO_COINGECKO_ID } from '../config/constants';

export class HistoricalPriceController {
    private coinGeckoService: CoinGeckoService;

    constructor() {
        this.coinGeckoService = new CoinGeckoService();
    }

    getHistoricalPrices = async (req: Request, res: Response) => {
        try {
            const { coinId, days } = req.params;
            // Convert symbol to CoinGecko ID
            const symbol = coinId.toUpperCase();
            const geckoId = SYMBOL_TO_COINGECKO_ID[symbol];

            if (!geckoId) {
                return res.status(400).json({ 
                    error: `Unsupported symbol: ${symbol}` 
                });
            }

            console.log(`Fetching historical data for ${symbol} (${geckoId})`);
            const data = await this.coinGeckoService.getHistoricalData(geckoId, parseInt(days));
            
            // Transform the response to match the expected format
            const formattedData = {
                id: geckoId,
                symbol: symbol,
                prices: data.prices.map(([timestamp, price]: [number, number]) => ({
                    timestamp,
                    price
                }))
            };

            res.json(formattedData);
        } catch (error) {
            console.error('Historical price error:', error);
            res.status(500).json({ 
                error: 'Failed to fetch historical data',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
} 