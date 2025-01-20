import { Request, Response } from 'express';
import { GoogleSearchService } from '../services/external/google/cse.service';
import NodeCache from 'node-cache';

const newsCache = new NodeCache({ stdTTL: 86400 }); // 1 day cache

export class NewsController {
    static async getCryptoNews(req: Request, res: Response) {
        try {
            const { symbol } = req.params;
            console.log(`Fetching news for symbol: ${symbol}`);
            
            // Check cache first
            const cachedNews = newsCache.get<any[]>(symbol);
            if (cachedNews) {
                console.log('Returning cached news');
                return res.json({ data: cachedNews });
            }

            console.log('Fetching fresh news from Google CSE');
            // Fetch fresh data
            const news = await GoogleSearchService.searchCryptoNews(symbol);
            
            // Store in cache
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
}