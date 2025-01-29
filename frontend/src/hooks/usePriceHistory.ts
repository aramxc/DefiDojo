import { useState, useEffect } from 'react';
import { historicalPriceService, TimeframeType, HistoricalPriceData } from '../services/api/historicalPrice.service';

interface UseHistoricalPricesParams {
  symbol: string;
  timeframe: TimeframeType | null;
  customRange?: {
    from: number;
    to: number;
  };
}

/**
 * Hook for fetching historical price data with optional custom date range
 * @param params Object containing symbol, timeframe, and optional custom date range
 * @returns Object containing historical price data, loading state, error state, and data availability flag
 */
export const useFetchHistoricalPrices = ({ symbol, timeframe, customRange }: UseHistoricalPricesParams) => {
  const [data, setData] = useState<HistoricalPriceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!symbol || !timeframe) return;
      
      setLoading(true);
      try {
        const response = await historicalPriceService.getHistoricalPrices(
          symbol,
          timeframe,
          customRange
        );

        // Format the response data for the chart
        if (response?.[symbol]?.data) {
          const formattedData = response[symbol].data.map((item: any) => ({
            timestamp: item.timestamp,
            price: item.price,
            marketCap: item.marketCap,
            volume: item.volume
          }));

          setData({
            ...response,
            [symbol]: {
              ...response[symbol],
              data: formattedData
            }
          });
        } else {
          setData(response);
        }
        
        setError(null);
       
      } catch (err) {
        console.error('Error fetching historical data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch historical data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, timeframe, customRange?.from, customRange?.to]);

  return {
    data,
    loading,
    error,
    hasData: !!data?.[symbol]?.data?.length
  };
};