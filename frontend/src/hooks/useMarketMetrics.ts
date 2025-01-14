import { useState, useEffect } from 'react';
import { MarketMetrics } from '@defidojo/shared-types';
import { marketMetricsService } from '../services/api/marketMetrics.service';

export const useMarketMetrics = (symbol: string) => {
    const [metrics, setMetrics] = useState<MarketMetrics | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            if (!symbol) return;

            try {
                setLoading(true);
                const data = await marketMetricsService.getMarketMetrics(symbol);
                setMetrics(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, [symbol]);

    return { metrics, loading, error };
};