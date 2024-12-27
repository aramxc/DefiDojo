import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { historicalPriceService, TimeframeType } from '../services/api/historicalPrice.service';

const TIMEFRAMES: TimeframeType[] = ['1D', '7D', '1M', '6M', '1Y'];


const formatTimestamp = (timestamp: number, timeframe: TimeframeType): string => {
  const date = new Date(timestamp * (timestamp < 1e12 ? 1000 : 1));
  
  switch (timeframe) {
    case '1D':
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    case '7D':
      return date.toLocaleDateString([], { 
        weekday: 'short',
        day: 'numeric'
      });
    case '1M':
      return date.toLocaleDateString([], { 
        month: 'short',
        day: 'numeric'
      });
    case '6M':
    case '1Y':
      return date.toLocaleDateString([], { 
        month: 'short',
        year: '2-digit'
      });
    default:
      return date.toLocaleString();
  }
};

export const PriceAnalytics: React.FC<{ symbol: string | null }> = ({ symbol }) => {
  const [timeframe, setTimeframe] = useState<TimeframeType>('1D');
  const [currentData, setCurrentData] = useState<Array<{ timestamp: number; price: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceMetrics, setPriceMetrics] = useState({
    latestPrice: 0,
    priceChange: 0,
    lowPrice: 0,
    highPrice: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!symbol) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await historicalPriceService.getHistoricalPrices(symbol, timeframe);
        if (data[symbol]) {
          setCurrentData(data[symbol].prices);
          setPriceMetrics({
            latestPrice: data[symbol].prices[data[symbol].prices.length - 1].price,
            priceChange: data[symbol].priceChange,
            lowPrice: data[symbol].lowPrice,
            highPrice: data[symbol].highPrice
          });
        }
      } catch (error) {
        console.error('Failed to fetch price data:', error);
        setError('Failed to load price data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, timeframe]);

  if (!symbol) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-gray-400 text-center">
        Select a token to view price analytics
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-gray-400 text-center">
        Loading price data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-red-400 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6">
      {/* Timeframe Buttons */}
      <div className="flex gap-2 mb-6">
        {TIMEFRAMES.map(tf => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-4 py-2 rounded-lg transition-all duration-200 
              ${timeframe === tf 
                ? 'bg-blue-500 text-white' 
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Price Display */}
      <div className="mb-4 flex justify-between items-start">
        <div>
          <div className="text-2xl font-bold text-white">
            ${priceMetrics.latestPrice.toLocaleString(undefined, { 
              maximumFractionDigits: 2 
            })}
          </div>
          <div className={`text-sm ${priceMetrics.priceChange >= 0 
            ? 'text-green-400' 
            : 'text-red-400'}`}
          >
            {priceMetrics.priceChange >= 0 ? '+' : ''}
            {priceMetrics.priceChange.toFixed(2)}%
          </div>
        </div>
        <div className="text-right text-sm text-gray-400">
          <div>High: ${priceMetrics.highPrice.toLocaleString()}</div>
          <div>Low: ${priceMetrics.lowPrice.toLocaleString()}</div>
        </div>
      </div>

      {/* Chart */}
      {currentData.length > 0 && (
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={currentData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis 
                dataKey="timestamp"
                tickFormatter={(ts) => formatTimestamp(ts, timeframe)}
                type="number"
                domain={['dataMin', 'dataMax']}
                tick={{ fill: '#9CA3AF' }}
                minTickGap={50}
                ticks={currentData.map(d => d.timestamp).filter((_, i, arr) => {
                  const interval = timeframe === '1D' ? 6 
                    : timeframe === '7D' ? 7
                    : timeframe === '1M' ? 8
                    : timeframe === '6M' ? 6
                    : 12;
                  return i % Math.ceil(arr.length / interval) === 0;
                })}
              />
              <YAxis 
                domain={['auto', 'auto']}
                tickFormatter={(value) => {
                  if (value >= 1000) {
                    return `$${(value/1000).toFixed(1)}k`;
                  }
                  return `$${value}`;
                }}
                tick={{ fill: '#9CA3AF' }}
                width={80}
              />
              <Tooltip 
                labelFormatter={(ts) => formatTimestamp(ts, timeframe)}
                formatter={(value: any) => [
                  `$${Number(value).toLocaleString(undefined, {
                    maximumFractionDigits: 2
                  })}`,
                  'Price'
                ]}
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: '#F3F4F6'
                }}
              />
              <Line 
                type="monotone"
                dataKey="price"
                stroke="#3b82f6"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
