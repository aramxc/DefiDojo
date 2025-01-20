import { useState, useEffect } from 'react';
import { newsService } from '../services/api/news.service';
import { NewsItem } from '@defidojo/shared-types';

export const useNews = (symbol: string) => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNews = async () => {
            if (!symbol) return;
            
            setLoading(true);
            setError(null);
            
            try {
                const newsData = await newsService.getNewsForSymbol(symbol);
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