import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { historicalPriceService, TimeframeType } from '../services/api/historicalPrice.service';
import { useTimezone, TIMEZONE_OPTIONS } from '../contexts/TimezoneContext';
import { CircularProgress } from '@mui/material';

const TIMEFRAMES: TimeframeType[] = ['1D', '7D', '1M', '6M', '1Y'];
type DataType = 'price' | 'marketCap';

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

const formatValue = (value: number | null | undefined, isMarketCap: boolean): string => {
    if (value == null) return 'N/A';
    return isMarketCap ? `$${(value / 1e9).toFixed(2)}B` : `$${value.toLocaleString()}`;
};

const formatChange = (change: number | undefined): string => {
    return `${(change ?? 0).toFixed(2)}%`;
};

// Main component
export const PriceAnalytics: React.FC<{ symbol: string | null }> = ({ symbol }) => {
    const { selectedTimezone, setTimezone } = useTimezone();
    const [timeframe, setTimeframe] = useState<TimeframeType>('1D');
    const [dataType, setDataType] = useState<DataType>('price');
    const [currentData, setCurrentData] = useState<Array<any>>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [metrics, setMetrics] = useState<any>(null);

    // Fetch data when symbol or timeframe changes
    useEffect(() => {
        if (!symbol) return;
        
        const fetchData = async () => {
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
        };

        fetchData();
    }, [symbol, timeframe]);

    // Early return states
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

    // Render component
    return (
        <div className="bg-gray-800 rounded-lg p-4 space-y-4">
            {/* Data Type Toggle and Metrics Display */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                {/* Data Type Toggle */}
                <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                    {['price', 'marketCap'].map((type) => (
                        <div 
                            key={type}
                            className={`cursor-pointer px-3 py-1 rounded transition-colors ${
                                dataType === type ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                            }`}
                            onClick={() => setDataType(type as DataType)}
                        >
                            {type === 'marketCap' ? 'Market Cap' : 'Price'}
                        </div>
                    ))}
                </div>
                
                {/* Metrics Display */}
                <div className="flex items-center space-x-4 text-sm">
                    {['high', 'low', 'change'].map((metric) => (
                        <div key={metric} className="text-gray-400">
                            {metric.charAt(0).toUpperCase() + metric.slice(1)}:
                            <span className={`ml-1 ${
                                metric === 'change' 
                                    ? (metrics[dataType]?.change ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'
                                    : 'text-white'
                            }`}>
                                {metric === 'change' 
                                    ? formatChange(metrics[dataType]?.[metric])
                                    : formatValue(metrics[dataType]?.[metric], dataType === 'marketCap')}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Time Controls: Timeframe + Timezone */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
                {/* Timeframe Selector */}
                <div className="flex space-x-2">
                    {TIMEFRAMES.map((tf) => (
                        <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`px-3 py-1 rounded ${
                                timeframe === tf ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            {tf}
                        </button>
                    ))}
                </div>

                {/* Timezone Selector */}
                <div className="sm:ml-auto flex items-center space-x-2">
                    <span className="text-gray-400 text-sm">Timezone:</span>
                    <select
                        value={selectedTimezone.value}
                        onChange={(e) => {
                            const newTimezone = TIMEZONE_OPTIONS.find(tz => tz.value === e.target.value);
                            if (newTimezone) setTimezone(newTimezone);
                        }}
                        className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 text-sm"
                    >
                        {TIMEZONE_OPTIONS.map((tz) => (
                            <option key={tz.value} value={tz.value}>
                                {tz.label} ({tz.abbrev})
                            </option>
                        ))}
                    </select>
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
                                tickFormatter={(ts) => formatTimestamp(ts, timeframe, selectedTimezone.value)}
                                type="number"
                                domain={['dataMin', 'dataMax']}
                                tick={{ fill: '#9CA3AF' }}
                            />
                            <YAxis 
                                dataKey={dataType}
                                domain={['auto', 'auto']}
                                tickFormatter={(value) => formatValue(value, dataType === 'marketCap')}
                                tick={{ fill: '#9CA3AF' }}
                                width={80}
                            />
                            <Tooltip 
                                labelFormatter={(ts) => formatTimestamp(ts, timeframe, selectedTimezone.value)}
                                formatter={(value: any) => [
                                    formatValue(value, dataType === 'marketCap'), 
                                    dataType === 'price' ? 'Price' : 'Market Cap'
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
                                dataKey={dataType}
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
