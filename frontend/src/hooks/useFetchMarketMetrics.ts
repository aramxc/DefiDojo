import { useState, useEffect } from 'react';
import { marketMetricsService } from '../services/api/marketMetrics.service';
import { MarketMetrics } from '@defidojo/shared-types';

export const useFetchMarketMetrics = (symbol: string, coingeckoId?: string) => {
    const [metrics, setMetrics] = useState<MarketMetrics | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            if (!symbol || !coingeckoId) return;
            
            try {
                setLoading(true);
                const data = await marketMetricsService.getMarketMetrics(symbol, coingeckoId);
                setMetrics(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch market metrics');
                setMetrics(null);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, [symbol, coingeckoId]);

    return { 
        metrics, 
        loading, 
        error,
        hasData: !!metrics
    };
};