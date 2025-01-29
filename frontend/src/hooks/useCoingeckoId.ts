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
        console.log('🔍 Fetching coingeckoId for symbol:', symbol);
        setLoading(true);
        const response = await infoService.getAssetIdBySymbol(symbol);
        console.log('📥 Received response:', response);
        
        // Check for both coingeckoId and id in the response
        const id = response?.coingeckoId || response?.id;
        
        if (!id) {
          console.warn('⚠️ No valid ID found in response:', response);
          setError(new Error(`No coingeckoId found for symbol: ${symbol}`));
          return;
        }
        
        console.log('✅ Setting coingeckoId:', id);
        setCoingeckoId(id);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error('❌ Error fetching coingeckoId:', err);
        setError(err as Error);
        setCoingeckoId(''); // Clear coingeckoId on error
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchCoingeckoId();
    } else {
      // Reset states if no symbol provided
      setCoingeckoId('');
      setError(null);
      setLoading(false);
    }
  }, [symbol]);

  return { coingeckoId, loading, error };
};