import { useState, useEffect } from 'react';
import { priceService } from '../services/api/price.service';

/**
 * Hook for fetching the latest price of a crypto asset with optional real-time updates
 * @param symbol Trading symbol (e.g., 'BTC')
 * @param realTime Whether to enable real-time price updates (defaults to false)
 * @returns Object containing latest price, loading state, error state, last update time, and refetch function
 */
export const useFetchLatestPrice = (
  symbol: string,
  realTime: boolean = false
) => {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  const fetchPrice = async () => {
    try {
      setLoading(true);
      const prices = await priceService.getLatestPrices([symbol]);
      const priceData = prices.find(p => p.symbol.toUpperCase() === symbol.toUpperCase());
      setPrice(priceData?.price || null);
      setLastUpdateTime(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch price'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrice(); // Initial fetch
    
    if (realTime) {
      // Set up real-time updates if enabled
      const interval = setInterval(fetchPrice, 1000); // 1 second interval
      return () => clearInterval(interval);
    }
  }, [symbol, realTime]);

  return { 
    price, 
    loading, 
    error, 
    lastUpdateTime, 
    refetch: fetchPrice 
  };
};