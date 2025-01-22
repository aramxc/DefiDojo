import { useState, useEffect } from 'react';
import { priceService } from '../services/api/price.service';
import { AssetPriceData } from '@defidojo/shared-types';

interface UseFetchLatestPriceResult {
  price: number | null;
  loading: boolean;
  error: Error | null;
  lastUpdateTime: Date;
  refetch: () => Promise<void>;
}

export const useFetchLatestPrice = (
  symbol: string,
  realTime: boolean = false
): UseFetchLatestPriceResult => {
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
      const interval = setInterval(fetchPrice, 1000); // 1 second
      return () => clearInterval(interval);
    }
  }, [symbol, realTime]);

  return { price, loading, error, lastUpdateTime, refetch: fetchPrice };
};