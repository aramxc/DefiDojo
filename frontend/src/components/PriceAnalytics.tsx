import React, { useState, useEffect, useCallback } from 'react';
import { Table, TableContainer, Paper } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { priceService, PriceData} from '../services/api/price.service';
import { historicalPriceService, HistoricalPriceData } from '../services/api/historicalPrice.service';

// Cache interface
interface HistoricalDataCache {
  [symbol: string]: {
    [timeframe: number]: {
      data: HistoricalPriceData;
      timestamp: number;
    };
  };
}

// Constants and Types
type Timeframe = {
  label: string;
  days: number;
};

const TIMEFRAMES: Timeframe[] = [
  { label: '24H', days: 1 },
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 }
];

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Utility functions
const formatPrice = (price: number): string => 
  Number(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const PriceAnalytics: React.FC<{ symbol: string | null }> = ({ symbol }) => {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [historicalData, setHistoricalData] = useState<HistoricalPriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>(TIMEFRAMES[0]);
  const [cache, setCache] = useState<HistoricalDataCache>({});

  // Function to check if cached data is still valid
  const isCacheValid = useCallback((symbol: string, days: number) => {
    const cachedData = cache[symbol]?.[days];
    if (!cachedData) return false;
    
    const now = Date.now();
    return (now - cachedData.timestamp) < CACHE_DURATION;
  }, [cache]);

  // Function to fetch all timeframes for a symbol
  const fetchAllTimeframes = useCallback(async (symbol: string) => {
    setLoading(true);
    try {
      const allPromises = TIMEFRAMES.map(async (timeframe) => {
        // Check cache first
        if (isCacheValid(symbol, timeframe.days)) {
          return;
        }

        const data = await historicalPriceService.getHistoricalPrices(symbol, timeframe.days);
        setCache(prevCache => ({
          ...prevCache,
          [symbol]: {
            ...(prevCache[symbol] || {}),
            [timeframe.days]: {
              data,
              timestamp: Date.now()
            }
          }
        }));
      });

      await Promise.all(allPromises);
    } catch (error) {
      console.error('Error fetching historical data:', error);
    } finally {
      setLoading(false);
    }
  }, [isCacheValid]);

  // Effect for initial load and symbol change
  useEffect(() => {
    if (!symbol) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch current prices
        const currentPrices = await priceService.getLatestPrices([symbol]);
        setPrices(currentPrices);

        // Fetch all historical data if not cached
        await fetchAllTimeframes(symbol);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    const interval = setInterval(() => {
      // Only update current prices on interval, not historical data
      priceService.getLatestPrices([symbol]).then(setPrices);
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [symbol, fetchAllTimeframes]);

  // Effect for timeframe changes
  useEffect(() => {
    if (!symbol) return;
    
    // Use cached data if available
    if (cache[symbol]?.[selectedTimeframe.days]) {
      setHistoricalData(cache[symbol][selectedTimeframe.days].data);
    }
  }, [symbol, selectedTimeframe, cache]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 shadow-xl border border-slate-700/30 backdrop-blur-sm">
      <div className="flex gap-2 mb-6">
        {TIMEFRAMES.map(timeframe => (
          <button
            key={timeframe.label}
            onClick={() => setSelectedTimeframe(timeframe)}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              selectedTimeframe.label === timeframe.label
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600 hover:shadow-lg'
            }`}
          >
            {timeframe.label}
          </button>
        ))}
      </div>

      <TableContainer component={Paper} className="bg-slate-800/50 backdrop-blur-sm">
        <Table>
          {/* Add Table Header */}
          <thead>
            <tr className="border-b border-slate-700">
              <th className="p-4 text-left text-gray-300 font-semibold">Asset</th>
              <th className="p-4 text-left text-gray-300 font-semibold">Current Price</th>
              <th className="p-4 text-left text-gray-300 font-semibold">Price Change</th>
              <th className="p-4 text-left text-gray-300 font-semibold">Low / High</th>
            </tr>
          </thead>
          <tbody>
          {prices.map((price) => {
            const symbolData = historicalData?.[price.symbol as string];
            const priceChange = symbolData?.priceChange ?? 0;
            const { lowPrice = 0, highPrice = 0 } = symbolData ?? {};
            
            return (
              <tr key={price.symbol} className="hover:bg-slate-700/50 transition-colors">
                <td className="p-4 text-gray-300 border-b border-slate-700">{price.symbol}</td>
                <td className="p-4 text-gray-300 border-b border-slate-700">${formatPrice(price.price)}</td>
                <td className={`p-4 border-b border-slate-700 flex items-center gap-2 ${priceChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {priceChange > 0 ? <TrendingUp /> : <TrendingDown />}
                  {Math.abs(priceChange)}%
                </td>
                <td className="p-4 text-gray-300 border-b border-slate-700">
                  ${formatPrice(lowPrice)} / ${formatPrice(highPrice)}
                </td>
              </tr>
            );
          })}
          </tbody>
        </Table>
      </TableContainer>
    </div>
  );
};