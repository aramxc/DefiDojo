import { useState, useEffect } from 'react';
import { newsService } from '../services/api/news.service';
import { NewsItem } from '@defidojo/shared-types';

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
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [symbol]);

    return { news, loading, error };
};