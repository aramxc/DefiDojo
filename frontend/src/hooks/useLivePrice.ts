import { useState, useEffect } from 'react';
import { priceService } from '../services/api/price.service';

interface UseLivePriceResult {
  price: number | null;
  loading: boolean;
  error: Error | null;
  lastUpdateTime: Date;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching real-time cryptocurrency prices using both REST API and SSE
 * @param symbol - Trading symbol (e.g., 'BTC')
 * @param realTime - Whether to use Server-Sent Events for real-time updates
 * @param pythPriceFeedId - Pyth Network price feed ID for real-time data
 * @returns Price data, loading state, error state, last update time, and refetch function
 */
export const useLivePrice = (
  symbol: string,
  realTime: boolean = false,
  pythPriceFeedId?: string
): UseLivePriceResult => {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  /**
   * Fetches latest price using REST API
   */
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
    let eventSource: EventSource | null = null;

    /**
     * Initializes SSE connection for real-time price updates
     */
    const initializeSSE = () => {
      if (!pythPriceFeedId || !realTime) {
        return;
      }

      // Pyth Network SSE endpoint, can take multiple ids
      const sseUrl = `https://hermes.pyth.network/v2/updates/price/stream?ids[]=${pythPriceFeedId}`;
      
      // Create new SSE connection
      eventSource = new EventSource(sseUrl);

      // Handle incoming price updates
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Extract price data from Pyth Network response
          const priceUpdate = data.parsed?.[0];
          if (!priceUpdate?.price) {
            throw new Error('No price update in response');
          }

          // Calculate actual price value using exponent
          const priceValue = parseFloat(priceUpdate.price.price) * Math.pow(10, priceUpdate.price.expo);

          // Update state with new price data
          setPrice(priceValue);
          setLastUpdateTime(new Date(priceUpdate.price.publish_time * 1000));
          setError(null);
        } catch (err) {
          console.error('❌ Error parsing SSE data:', err);
        }
      };

      // Handle connection errors
      eventSource.onerror = (error) => {
        console.error('❌ SSE Connection error:', error);
        eventSource?.close();
        setError(new Error('Price stream connection error'));
      };
    };

    // Choose between real-time SSE or REST API
    if (realTime && pythPriceFeedId) {
      initializeSSE();
    } else {
      fetchPrice();
    }

    // Cleanup: Close SSE connection when component unmounts or dependencies change
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [symbol, realTime, pythPriceFeedId]); // Re-run effect when these dependencies change

  return {
    price,
    loading,
    error,
    lastUpdateTime,
    refetch: fetchPrice
  };
};