import { useState, useEffect } from 'react';
import { infoService } from '../services/api/info.service';
import { AssetInfo } from '@defidojo/shared-types';

export const useFetchAssetInfo = (symbol: string) => {
  const [assetInfo, setAssetInfo] = useState<AssetInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchAssetInfo = async () => {
      if (!symbol) return;

      try {
        setLoading(true);
        const info = await infoService.getAssetInfoBySymbol(symbol);
        setAssetInfo(info);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch asset info');
      } finally {
        setLoading(false);
      }
    };

    fetchAssetInfo();
  }, [symbol]);

  return { 
    assetInfo, 
    loading, 
    error,
    hasData: !!assetInfo
  };
};