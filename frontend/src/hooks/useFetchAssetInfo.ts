import { useState, useEffect } from 'react';
import { infoService } from '../services/api/info.service';
import { AssetInfo } from '@defidojo/shared-types';

/**
 * Hook for fetching detailed asset information
 * @param coingeckoId The CoinGecko ID of the asset
 * @param getRealTimeData Whether to fetch real-time data
 * @returns Object containing asset info, loading state, and any errors
 */
export const useFetchAssetInfo = (coingeckoId: string, getRealTimeData?: boolean) => {
  const [assetInfo, setAssetInfo] = useState<AssetInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Reset states when coingeckoId changes
    setLoading(true);
    setError(null);
    setAssetInfo(null);

    const fetchData = async () => {
      try {
        // Only fetch if we have a valid coingeckoId
        if (!coingeckoId) {
          setLoading(false);
          return;
        }

        const data = await infoService.getAssetInfoById(coingeckoId, getRealTimeData || false);
        setAssetInfo(data);
      } catch (err) {
        console.error('Error fetching asset info:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [coingeckoId, getRealTimeData]);

  return { assetInfo, loading, error };
};