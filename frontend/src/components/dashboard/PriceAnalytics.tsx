import React, { useState, useEffect, memo, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area } from 'recharts';
import { historicalPriceService, TimeframeType } from '../../services/api/historicalPrice.service';
import { useTimezone, TIMEZONE_OPTIONS } from '../../contexts/TimezoneContext';
import { CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';

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

// Helper function for Y-axis formatting
const formatYAxisValue = (value: number, type: DataType): string => {
    if (value === 0) return '0';
    
    if (type === 'marketCap') {
        if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
        if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
        if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    } else if (type === 'volume') {
        if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
        if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
        if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    } else {
        // Price formatting
        if (value >= 1e3) return `$${value.toLocaleString()}`;
        return `$${value.toFixed(2)}`;
    }
    
    return `$${value.toLocaleString()}`;
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
  <ResponsiveContainer width="100%" height="100%">
    <LineChart 
      data={data}
      margin={{ top: 5, right: 5, left: 5, bottom: 15 }}
    >
      <defs>
        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.01" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <XAxis 
        dataKey="timestamp"
        tickFormatter={(ts) => formatTimestamp(ts, timeframe, selectedTimezone)}
        type="number"
        domain={['dataMin', 'dataMax']}
        tick={{ fill: '#94A3B8' }}
        stroke="#334155"
        dy={10}
      />
      <YAxis 
        dataKey={dataType}
        domain={['auto', 'auto']}
        tickFormatter={(value) => formatYAxisValue(value, dataType)}
        tick={{ fill: '#94A3B8' }}
        stroke="#334155"
        width={80}
      />
      <Tooltip 
        contentStyle={{
          backgroundColor: 'rgba(30, 41, 59, 0.9)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '0.75rem',
          color: '#F3F4F6',
        }}
        labelFormatter={(ts) => formatTimestamp(ts, timeframe, selectedTimezone)}
        formatter={(value: any) => [formatValue(value, dataType), dataType]}
      />
      <Area
        type="monotone"
        dataKey={dataType}
        stroke="none"
        fill="url(#areaGradient)"
        fillOpacity={1}
      />
      <Line 
        type="monotone"
        dataKey={dataType}
        stroke="url(#lineGradient)"
        strokeWidth={2}
        dot={false}
        filter="url(#glow)"
        style={{
          filter: 'drop-shadow(0 0 6px rgba(34, 211, 238, 0.3))'
        }}
      />
    </LineChart>
  </ResponsiveContainer>
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

interface PriceAnalyticsProps {
  symbol: string;
  onClose: () => void;
}

export const PriceAnalytics = memo(({ symbol, onClose }: PriceAnalyticsProps) => {
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
            <div className="relative overflow-hidden rounded-xl shadow-[0_0_10px_rgba(59,130,246,0.03)] group">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800/90 via-slate-800/95 to-slate-900/90" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-blue-500/5" />
                
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20
                             w-8 h-8 flex items-center justify-center
                             rounded-full bg-red-500/5 text-red-300
                             hover:bg-red-500/10 hover:text-red-200 transition-all duration-200"
                >
                    ×
                </motion.button>
                
                <div className="relative p-6 space-y-6">
                    {/* Title Section */}
                    <motion.h2 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 text-2xl font-semibold"
                    >

                        {/* Title Text */}
                        <span className="bg-gradient-to-r from-gray-200 to-gray-100 bg-clip-text text-transparent">
                           {symbol} Analytics
                        </span>

                        {/* Decorative Line */}
                        <div className="flex-1 h-px bg-gradient-to-r from-blue-400/20 via-cyan-300/20 to-transparent 
                                        max-w-[180px] self-center ml-2" />
                    </motion.h2>

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
                                            ? `relative overflow-hidden
                                               text-white
                                               before:absolute before:inset-0 
                                               before:bg-gradient-to-r before:from-blue-500/20 before:to-cyan-500/20 
                                               before:backdrop-blur-xl
                                               after:absolute after:inset-0 
                                               after:bg-gradient-to-r after:from-blue-500/10 after:to-cyan-500/10
                                               shadow-[0_0_10px_rgba(59,130,246,0.1)]` 
                                            : `text-gray-400 
                                               hover:text-white 
                                               hover:bg-slate-700/50`
                                        }
                                    `}
                                >
                                    <span className="relative z-10">
                                        {type === 'marketCap' ? 'Market Cap' : 
                                         type === 'volume' ? 'Volume' : 'Price'}
                                    </span>
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
                                            ? `relative overflow-hidden
                                               text-white
                                               before:absolute before:inset-0 
                                               before:bg-gradient-to-r before:from-blue-500/20 before:to-cyan-500/20 
                                               before:backdrop-blur-xl
                                               after:absolute after:inset-0 
                                               after:bg-gradient-to-r after:from-blue-500/10 after:to-cyan-500/10
                                               shadow-[0_0_10px_rgba(59,130,246,0.1)]` 
                                            : `text-gray-400 
                                               hover:text-white 
                                               hover:bg-slate-700/50`
                                        }
                                    `}
                                >
                                    <span className="relative z-10">{tf}</span>
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
                                    className="bg-slate-800/50 text-white text-xs px-3 py-2 pr-8 rounded-lg 
                                             border border-white/5 backdrop-blur-sm 
                                             hover:bg-slate-700/50 transition-colors duration-200
                                             focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    {TIMEZONE_OPTIONS.map((tz) => (
                                        <option key={tz.value} value={tz.value}>
                                            {tz.label} ({tz.abbrev})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Chart with enhanced glow and consistent padding */}
                    {currentData.length > 0 && (
                        <div className="relative h-[400px] mt-6">
                            {/* Enhanced glow effects */}
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-teal-500/5" />
                            <div className="absolute inset-[1px] rounded-xl bg-slate-800/95 backdrop-blur-xl" />
                            
                            {/* Chart container with consistent padding */}
                            <div className="relative h-full rounded-xl border border-white/5 
                                          before:absolute before:inset-0 
                                          before:bg-gradient-to-br before:from-blue-500/3 before:via-transparent before:to-cyan-500/3
                                          before:rounded-xl">
                                <div className="absolute inset-0 flex flex-col">
                                    <div className="flex-1 px-6 pt-6 pb-8"> {/* Adjusted padding */}
                                        <PriceChart 
                                            data={currentData}
                                            dataType={dataType}
                                            timeframe={timeframe}
                                            selectedTimezone={selectedTimezone.value}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }, [currentData, metrics, loading, error, dataType, timeframe, setTimezone, selectedTimezone, symbol, onClose]);

    return content;
});

PriceAnalytics.displayName = 'PriceAnalytics';
