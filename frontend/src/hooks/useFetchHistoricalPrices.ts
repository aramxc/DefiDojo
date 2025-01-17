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
        setData(response);
        setError(null);
      } catch (err) {
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