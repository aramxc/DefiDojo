import { useState, useEffect } from 'react';
import { infoService } from '../services/api/info.service';
import { AssetInfo } from '@defidojo/shared-types';

export const useFetchAssetInfo = (symbol: string, getRealTimeData: boolean = false) => {
  const [assetInfo, setAssetInfo] = useState<AssetInfo | null>(null);
  const [marketData, setMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // First get static data from Snowflake
        const staticData = await infoService.getAssetInfoBySymbol(symbol);
        setAssetInfo(staticData);

        // If we want real-time data and have a coingecko ID, fetch it
        if (getRealTimeData && staticData?.COINGECKO_ID) {
          const realTimeData = await infoService.getAssetInfoById(staticData.COINGECKO_ID);
          setMarketData(realTimeData);
        }
      } catch (err) {
        console.error('Error in useFetchAssetInfo:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch asset info');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, getRealTimeData]);

  // Combine static and real-time data
  const combinedData = assetInfo ? {
    ...assetInfo,
    ...(marketData && { MARKET_DATA: marketData })
  } : null;

  return { assetInfo: combinedData, loading, error };
};