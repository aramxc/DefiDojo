import React, { useState, useEffect, memo, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { historicalPriceService, TimeframeType } from '../../services/api/historicalPrice.service';
import { useTimezone, TIMEZONE_OPTIONS } from '../../contexts/TimezoneContext';
import { CircularProgress } from '@mui/material';;

const TIMEFRAMES: TimeframeType[] = ['1D', '7D', '1M', '6M', '1Y'];
type DataType = 'price' | 'marketCap' | 'volume';

// Helper functions
const formatTimestamp = (timestamp: number, timeframe: string, timezone: string): string => {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        month: 'short',
        day: 'numeric',
        weekday: 'short'
    };

    switch (timeframe) {
        case '1D': return date.toLocaleTimeString([], { ...options, month: undefined, day: undefined, weekday: undefined });
        case '7D': return date.toLocaleDateString([], { ...options, hour: undefined, minute: undefined });
        default: return date.toLocaleDateString([], { ...options, hour: undefined, minute: undefined, weekday: undefined });
    }
};

const formatValue = (value: number | null | undefined, type: DataType): string => {
    if (value == null) return 'N/A';
    if (type === 'marketCap') return `$${(value / 1e9).toFixed(2)}B`;
    if (type === 'volume') return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
};

const formatChange = (change: number | undefined): string => {
    return `${(change ?? 0).toFixed(2)}%`;
};

const PriceChart = memo(({ 
  data, 
  dataType, 
  timeframe, 
  selectedTimezone 
}: { 
  data: Array<any>,
  dataType: DataType,
  timeframe: TimeframeType,
  selectedTimezone: string
}) => (
  <div className="h-[400px] mt-6">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart 
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>
        <XAxis 
          dataKey="timestamp"
          tickFormatter={(ts) => formatTimestamp(ts, timeframe, selectedTimezone)}
          type="number"
          domain={['dataMin', 'dataMax']}
          tick={{ fill: '#94A3B8' }}
          stroke="#334155"
        />
        <YAxis 
          dataKey={dataType}
          domain={['auto', 'auto']}
          tickFormatter={(value) => {
            if (value === 0) return '$0';
            
            const scales = [
                { threshold: 1e12, suffix: 'T' },
                { threshold: 1e9, suffix: 'B' },
                { threshold: 1e6, suffix: 'M' },
                { threshold: 1e3, suffix: 'K' },
            ];
            
            const scale = scales.find(s => Math.abs(value) >= s.threshold);
            
            if (scale) {
                const scaledValue = value / scale.threshold;
                return `$${scaledValue.toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2
                })}${scale.suffix}`;
            }
            
            return `$${value.toLocaleString('en-US')}`;
          }}
          tick={{ fill: '#94A3B8' }}
          stroke="#334155"
          width={80}
        />
        <Tooltip 
          labelFormatter={(ts) => formatTimestamp(ts, timeframe, selectedTimezone)}
          formatter={(value: any) => {
            const scales = [
                { threshold: 1e12, suffix: 'T' },
                { threshold: 1e9, suffix: 'B' },
                { threshold: 1e6, suffix: 'M' },
                { threshold: 1e3, suffix: 'K' },
            ];
            
            const scale = scales.find(s => Math.abs(value) >= s.threshold);
            
            let formattedValue;
            if (scale) {
                const scaledValue = value / scale.threshold;
                formattedValue = `$${scaledValue.toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2
                })}${scale.suffix}`;
            } else {
                formattedValue = `$${value.toLocaleString('en-US')}`;
            }

            return [
                formattedValue, 
                dataType === 'price' ? 'Price' : 
                dataType === 'marketCap' ? 'Market Cap' : 
                'Volume'
            ];
          }}
          contentStyle={{
            backgroundColor: 'rgba(30, 41, 59, 0.9)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: '0.75rem',
            color: '#F3F4F6',
          }}
        />
        <Line 
          type="monotone"
          dataKey={dataType}
          stroke="url(#lineGradient)"
          strokeWidth={2.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
));

const MetricsDisplay = memo(({ metrics, dataType }: { metrics: any, dataType: DataType }) => (
  <div className="flex items-center gap-4">
    {['high', 'low', 'change'].map((metric) => (
      <div key={metric} className="text-xs text-gray-400">
        {metric.charAt(0).toUpperCase() + metric.slice(1)}:
        <span className={`ml-1 font-medium ${
          metric === 'change' 
            ? (metrics[dataType]?.change ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'
            : 'text-white'
        }`}>
          {metric === 'change' 
            ? formatChange(metrics[dataType]?.[metric])
            : formatValue(metrics[dataType]?.[metric], dataType)}
        </span>
      </div>
    ))}
  </div>
));

// Main component
export const PriceAnalytics = memo(({ symbol }: { symbol: string | null }) => {
    const { selectedTimezone, setTimezone } = useTimezone();
    const [timeframe, setTimeframe] = useState<TimeframeType>('1D');
    const [dataType, setDataType] = useState<DataType>('price');
    const [currentData, setCurrentData] = useState<Array<any>>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [metrics, setMetrics] = useState<any>(null);

    const fetchData = useMemo(() => async () => {
        if (!symbol) return;
        setLoading(true);
        try {
            const response = await historicalPriceService.getHistoricalPrices(symbol, timeframe);
            const data = response[symbol];
            setCurrentData(data.data);
            setMetrics(data.metrics);
        } catch (err) {
            setError('Failed to fetch price data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [symbol, timeframe]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const content = useMemo(() => {
        if (!symbol) return null;
        if (loading) return (
            <div className="bg-gray-800 rounded-lg p-4 min-h-[500px] flex items-center justify-center">
                <div className="flex flex-col items-center space-y-2">
                    <CircularProgress size={40} className="text-blue-500" />
                    <span className="text-gray-400 text-sm">Loading price data...</span>
                </div>
            </div>
        );
        if (error) return <div className="text-red-500">{error}</div>;
        if (!metrics) return <div>No metrics available</div>;

        return (
            <div className="relative overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-blue-500/5" />
                
                <div className="relative p-6 space-y-6">
                    {/* Data Type Toggle and Metrics */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        {/* Data Type Toggle */}
                        <div className="flex items-center gap-2">
                            {['price', 'marketCap', 'volume'].map((type) => (
                                <button 
                                    key={type}
                                    onClick={() => setDataType(type as DataType)}
                                    className={`
                                        px-4 py-2.5 
                                        rounded-lg 
                                        font-medium
                                        text-sm
                                        transition-all duration-200
                                        ${dataType === type 
                                            ? `bg-gradient-to-r from-blue-400 to-cyan-300 
                                               text-slate-900
                                               shadow-lg 
                                               border border-blue-400/20 
                                               hover:shadow-blue-400/25
                                               hover:from-blue-400 hover:to-cyan-400
                                               transform hover:-translate-y-0.5` 
                                            : `bg-slate-800/50 
                                               text-gray-400 
                                               border border-slate-700/50
                                               hover:text-white 
                                               hover:bg-slate-700/50
                                               hover:border-slate-600/50`
                                        }
                                    `}
                                >
                                    {type === 'marketCap' ? (
                                        <span className="whitespace-nowrap">Market Cap</span>
                                    ) : type === 'volume' ? (
                                        <span className="whitespace-nowrap">Volume</span>
                                    ) : (
                                        'Price'
                                    )}
                                </button>
                            ))}
                        </div>
                        
                        {/* Memoized Metrics Display */}
                        <MetricsDisplay metrics={metrics} dataType={dataType} />
                    </div>

                    {/* Time Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Timeframe Selector */}
                        <div className="flex gap-2">
                            {TIMEFRAMES.map((tf) => (
                                <button
                                    key={tf}
                                    onClick={() => setTimeframe(tf)}
                                    className={`
                                        px-4 py-2.5 
                                        rounded-lg 
                                        font-medium
                                        text-sm
                                        transition-all duration-200
                                        ${timeframe === tf 
                                            ? `bg-gradient-to-r from-blue-500 to-blue-400 
                                               text-white
                                               shadow-lg 
                                               border border-blue-500/20 
                                               hover:shadow-blue-500/25
                                               hover:from-blue-500 hover:to-blue-400
                                               transform hover:-translate-y-0.5` 
                                            : `bg-slate-800/50 
                                               text-gray-400 
                                               border border-slate-700/50
                                               hover:text-white 
                                               hover:bg-slate-700/50
                                               hover:border-slate-600/50`
                                        }
                                    `}
                                >
                                    {tf}
                                </button>
                            ))}
                        </div>

                        {/* Timezone Selector */}
                        <div className="sm:ml-auto flex items-center gap-2">
                            <span className="text-xs text-gray-400">Timezone:</span>
                            <div className="relative inline-block">
                                <select
                                    value={selectedTimezone.value}
                                    onChange={(e) => {
                                        const newTimezone = TIMEZONE_OPTIONS.find(tz => tz.value === e.target.value);
                                        if (newTimezone) setTimezone(newTimezone);
                                    }}
                                    className="bg-slate-700/50 text-white text-xs px-3 py-2 pr-8 rounded-lg 
                                       border border-white/10 backdrop-blur-sm 
                                       hover:bg-slate-700/70 transition-colors duration-200
                                       appearance-none cursor-pointer"
                                    style={{
                                        WebkitAppearance: 'none',
                                        MozAppearance: 'none'
                                    }}
                                >
                                    {TIMEZONE_OPTIONS.map((tz) => (
                                        <option 
                                            key={tz.value} 
                                            value={tz.value}
                                            className="text-xs bg-slate-800 py-1"
                                        >
                                            {tz.label} ({tz.abbrev})
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                                    <svg 
                                        className="w-4 h-4 text-gray-400" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d="M19 9l-7 7-7-7" 
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chart */}
                    {currentData.length > 0 && (
                        <PriceChart 
                            data={currentData}
                            dataType={dataType}
                            timeframe={timeframe}
                            selectedTimezone={selectedTimezone.value}
                        />
                    )}
                </div>
            </div>
        );
    }, [currentData, metrics, loading, error, dataType, timeframe, setTimezone, selectedTimezone, symbol]);

    return content;
});

PriceAnalytics.displayName = 'PriceAnalytics';
