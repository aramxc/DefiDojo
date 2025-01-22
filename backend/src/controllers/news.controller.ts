import { Request, Response } from 'express';
import { GoogleSearchService } from '../services/external/google/cse.service';
import NodeCache from 'node-cache';

const newsCache = new NodeCache({ stdTTL: 3600 }); // 1 hr cache

export class NewsController {
    static async getCryptoNewsBySymbol(req: Request, res: Response) {
        try {
            const { symbol } = req.params;
            console.log(`Fetching news for symbol: ${symbol}`);
            
            // Check cache first using symbol as key
            const cachedNews = newsCache.get<any[]>(symbol);
            if (cachedNews) {
                console.log('Returning cached news for symbol:', symbol);
                return res.json({ data: cachedNews });
            }

            // Fetch fresh data
            const news = await GoogleSearchService.searchCryptoNewsBySymbol(symbol);
            
            // Store in cache with symbol as key
            newsCache.set(symbol, news);
            
            res.json({ data: news });
        } catch (error: any) {
            console.error('Detailed error in getCryptoNews:', error);
            res.status(500).json({ 
                error: 'Failed to fetch news',
                details: error.message 
            });
        }
    }

    static async getCryptoNews(req: Request, res: Response) {
        try {
            const cachedNews = newsCache.get<any[]>('general_crypto_news');
            if (cachedNews) {
                console.log('Returning cached general crypto news');
                return res.json({ data: cachedNews });
            }

            const news = await GoogleSearchService.searchCryptoNews();
            
            // Store with distinct key
            newsCache.set('general_crypto_news', news);
            
            res.json({ data: news });
        } catch (error: any) {
            console.error('Detailed error in getCryptoNews:', error);
            res.status(500).json({ 
                error: 'Failed to fetch news',
                details: error.message,
                request: req.params
            });
        }
    }
}