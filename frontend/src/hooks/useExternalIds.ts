import { useState, useEffect } from 'react';
import { infoService } from '../services/api/info.service';

interface ExternalIds {
  coingeckoId: string | null;
  pythPriceFeedId: string | null;
}

/**
 * Hook for fetching external IDs (CoinGecko, Pyth) from a trading symbol
 * @returns Object containing external IDs, loading state, and any errors
 */
export const useExternalIds = (symbol: string) => {
  const [externalIds, setExternalIds] = useState<ExternalIds>({ 
    coingeckoId: null, 
    pythPriceFeedId: null 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchExternalIds = async () => {
      try {
        setLoading(true);
        const response = await infoService.getAssetIdBySymbol(symbol);
        setExternalIds({
          coingeckoId: response.coingeckoId,
          pythPriceFeedId: response.pythPriceFeedId
        });
        setError(null);
      } catch (err) {
        setError(err as Error);
        setExternalIds({ coingeckoId: null, pythPriceFeedId: null });
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchExternalIds();
    } else {
      setExternalIds({ coingeckoId: null, pythPriceFeedId: null });
      setError(null);
      setLoading(false);
    }
  }, [symbol]);

  return { externalIds, loading, error };
};