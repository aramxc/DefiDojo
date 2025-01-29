import { useState, useEffect } from 'react';
import { newsService } from '../services/api/news.service';
import { NewsItem } from '@defidojo/shared-types';

/**
 * Hook for fetching recent news articles related to a specific crypto asset or general crypto news
 * @param symbol Optional trading symbol (e.g., 'BTC') to fetch asset-specific news
 * @returns Object containing news items, loading state, and any errors
 */
export const useFetchRecentNews = (symbol?: string) => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const newsData = symbol 
                    ? await newsService.getCryptoNewsBySymbol(symbol)
                    : await newsService.getCryptoNews();
                setNews(newsData);
            } catch (err) {
                setError('Unable to fetch latest news');
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [symbol]);

    return { news, loading, error };
};