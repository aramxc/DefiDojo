import { useState, useEffect } from 'react';
import { infoService } from '../services/api/info.service';

/**
 * Hook for fetching CoinGecko ID from a trading symbol
 * @param symbol Trading symbol (e.g., 'BTC')
 * @returns Object containing coingeckoId, loading state, and any errors
 */
export const useFetchCoingeckoId = (symbol: string) => {
  const [coingeckoId, setCoingeckoId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCoingeckoId = async () => {
      try {
        setLoading(true);
        const response = await infoService.getAssetIdBySymbol(symbol);
        const id = response?.coingeckoId || response?.id;
        
        if (!id) {
          setError(new Error(`No coingeckoId found for symbol: ${symbol}`));
          return;
        }
        
        setCoingeckoId(id);
        setError(null);
      } catch (err) {
        setError(err as Error);
        setCoingeckoId('');
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchCoingeckoId();
    } else {
      setCoingeckoId('');
      setError(null);
      setLoading(false);
    }
  }, [symbol]);

  return { coingeckoId, loading, error };
};