import { useState, useEffect } from 'react';
import { marketMetricsService } from '../services/api/marketMetrics.service';
import { MarketMetrics } from '@defidojo/shared-types';

/**
 * Hook for fetching market metrics data with automatic refresh
 * @param symbol Trading symbol (e.g., 'BTC')
 * @param coingeckoId CoinGecko ID for the asset
 * @returns Object containing market metrics, loading state, error state, and refetch function
 */
export const useFetchMarketMetrics = (symbol: string, coingeckoId?: string) => {
    const [metrics, setMetrics] = useState<MarketMetrics | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMetrics = async () => {
        if (!symbol || !coingeckoId) return;
        
        setLoading(true);
        try {
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

    useEffect(() => {
        // Initial fetch
        fetchMetrics();

        // Refresh every 5 minutes to match backend cache
        const intervalId = setInterval(fetchMetrics, 5 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, [symbol, coingeckoId]);

    return { 
        metrics, 
        loading, 
        error,
        hasData: !!metrics,
        refetch: fetchMetrics
    };
};