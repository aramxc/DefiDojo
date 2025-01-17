import React, { useState, useEffect, memo, useMemo, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area } from 'recharts';
import { TimeframeType } from '../../services/api/historicalPrice.service';
import { useTimezone, TIMEZONE_OPTIONS } from '../../contexts/TimezoneContext';
import { CircularProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { checkProAccess } from '../../services/web3/contract.service';
import { PurchaseDataModal } from '../premium/PurchaseDataModal';
import { useFetchHistoricalPrices } from '../../hooks/useFetchHistoricalPrices';
import { formatTimestamp, formatValue, formatYAxisValue, formatChange } from '../../utils/formatters';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Constants
const TIMEFRAMES: TimeframeType[] = ['1D', '7D', '1M', '6M', '1Y', '5Y', 'Custom'];
type DataType = 'price' | 'marketCap' | 'volume';

const PriceChart = memo(({ 
  data, 
  dataType,
  timeframe, 
  selectedTimezone 
}: { 
  data: Array<any>;
  dataType: DataType;
  timeframe: TimeframeType;
  selectedTimezone: string;
}) => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 15 }}>
      {/* Chart Gradients */}
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

const MetricsDisplay = memo(({ metrics, dataType }: { 
  metrics: any, 
  dataType: DataType,
  marketMetrics?: any 
}) => (
  <div className="flex items-center gap-4">
    {/* Price metrics */}
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
  onSymbolChange?: (symbol: string) => void;
  onClose?: () => void;
  closeable?: boolean;
}

// Separate the TimeframeSelector into its own component
const TimeframeSelector = memo(({ 
  timeframe, 
  isCustomMode,
  customDates,
  onTimeframeClick,
  onCustomModeToggle,
  onBackClick,
  onDateChange,
  isValidDateRange
}: {
  timeframe: TimeframeType;
  isCustomMode: boolean;
  customDates: { from: Date | null; to: Date | null };
  onTimeframeClick: (tf: TimeframeType) => void;
  onCustomModeToggle: () => void;
  onBackClick: () => void;
  onDateChange: (type: 'from' | 'to', date: Date | null) => void;
  isValidDateRange: boolean;
}) => (
  <AnimatePresence mode="wait">
    {!isCustomMode ? (
      <motion.div 
        className="flex gap-2"
        initial={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        key="timeframes"
      >
        {TIMEFRAMES.map((tf) => (
          <motion.button
            key={tf}
            onClick={() => tf === 'Custom' ? onCustomModeToggle() : onTimeframeClick(tf)}
            className={`
              px-4 py-2.5 
              rounded-lg 
              font-medium
              text-sm
              transition-all duration-200
              ${(tf === '5Y' || tf === 'Custom') 
                ? timeframe === tf || (tf === 'Custom' && isCustomMode)
                    ? `relative overflow-hidden
                       text-white
                       before:absolute before:inset-0 
                       before:bg-gradient-to-r before:from-fuchsia-500/90 before:via-pink-500/90 before:to-fuchsia-400/90
                       before:backdrop-blur-xl
                       before:animate-[burn_3s_ease-in-out_infinite]
                       after:absolute after:inset-0 
                       after:bg-gradient-to-r after:from-fuchsia-500/60 after:via-pink-500/60 after:to-fuchsia-400/60
                       shadow-[0_0_25px_rgba(236,72,153,0.5)]
                       [&>span]:animate-[pulse_2s_ease-in-out_infinite]`
                    : `relative overflow-hidden
                       text-white
                       before:absolute before:inset-0 
                       before:bg-gradient-to-r before:from-fuchsia-500/60 before:via-pink-500/60 before:to-fuchsia-400/60
                       before:backdrop-blur-xl
                       before:animate-[burn_3s_ease-in-out_infinite]
                       after:absolute after:inset-[-1px] after:rounded-lg
                       after:bg-gradient-to-t after:from-pink-500/30 after:to-transparent
                       after:animate-[pulse_2s_ease-in-out_infinite]
                       hover:text-white
                       hover:shadow-[0_0_25px_rgba(236,72,153,0.5)]
                       hover:before:from-fuchsia-500/80 hover:before:via-pink-500/80 hover:before:to-fuchsia-400/80
                       shadow-[0_0_20px_rgba(236,72,153,0.4)]
                       group`
                : timeframe === tf
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
          </motion.button>
        ))}
      </motion.div>
    ) : (
      <motion.div 
        className="flex items-center gap-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        key="custom-mode"
      >
        <motion.button
          onClick={onBackClick}
          className="px-4 py-2.5 rounded-lg font-medium text-sm
                   relative overflow-hidden text-white
                   before:absolute before:inset-0 
                   before:bg-gradient-to-r before:from-fuchsia-500/90 before:via-pink-500/90 before:to-fuchsia-400/90
                   before:backdrop-blur-xl
                   before:animate-[burn_3s_ease-in-out_infinite]
                   shadow-[0_0_25px_rgba(236,72,153,0.5)]
                   hover:shadow-[0_0_30px_rgba(236,72,153,0.6)]
                   transition-all duration-300
                   cursor-pointer"
        >
          <span className="relative z-10 flex items-center gap-2">
            <ArrowBackIcon className="w-4 h-4" />
          </span>
        </motion.button>
        <div className="flex gap-4">
          <DatePicker
            label="From Date"
            value={customDates.from}
            onChange={(date) => onDateChange('from', date)}
            maxDate={customDates.to || undefined}
            className="bg-slate-800/50"
            slotProps={{
              textField: {
                size: "small",
                className: "w-40 bg-slate-800/50 text-white border-white/5",
                required: true,
                error: !isValidDateRange && !!customDates.from && !!customDates.to,
                helperText: !isValidDateRange && !!customDates.from && !!customDates.to ? 
                  "Invalid date range" : undefined
              }
            }}
          />
          <DatePicker
            label="To Date"
            value={customDates.to}
            onChange={(date) => onDateChange('to', date)}
            minDate={customDates.from || undefined}
            className="bg-slate-800/50"
            slotProps={{
              textField: {
                size: "small",
                className: "w-40 bg-slate-800/50 text-white border-white/5",
                required: true,
                error: !isValidDateRange && !!customDates.from && !!customDates.to,
                helperText: !isValidDateRange && !!customDates.from && !!customDates.to ? 
                  "Invalid date range" : undefined
              }
            }}
          />
        </div>
      </motion.div>
    )}
  </AnimatePresence>
));

export const PriceAnalytics = memo(({ 
  symbol, 
  onSymbolChange,
  onClose, 
  closeable = false 
}: PriceAnalyticsProps) => {
    const { selectedTimezone, setTimezone } = useTimezone();
    const [timeframe, setTimeframe] = useState<TimeframeType>('1D');
    const [dataType, setDataType] = useState<DataType>('price');
    const [currentData, setCurrentData] = useState<Array<any>>([]);
    const [isChartLoading, setIsChartLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [metrics, setMetrics] = useState<any>(null);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const prevTimeframeRef = useRef<TimeframeType>('1D');
    const [isCustomMode, setIsCustomMode] = useState(false);
    // const [dateRange, setDateRange] = useState({
    //     from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    //     to: new Date()
    // });
    const [customDates, setCustomDates] = useState<{
        from: Date | null;
        to: Date | null;
    }>({
        from: null,
        to: null
    });
    const [customRange, setCustomRange] = useState<{from: number; to: number} | undefined>();

     // Add validation for custom dates
     const isValidDateRange = useMemo(() => {
        if (!customDates.from || !customDates.to) return false;
        return customDates.to > customDates.from;
    }, [customDates.from, customDates.to]);

    // Add a flag to control when to make the API request
    const effectiveTimeframe = useMemo(() => {
        // Only use 'Custom' timeframe when we have a valid date range
        if (timeframe === 'Custom' && (!customRange || !isValidDateRange)) {
            return null; // Return null to prevent API call
        }
        return timeframe;
    }, [timeframe, customRange, isValidDateRange]);

    const { data, loading } = useFetchHistoricalPrices({
        symbol,
        timeframe: effectiveTimeframe, // Pass null to prevent API call
        customRange
    });

    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { opacity: 0.4; }
                50% { opacity: 1; }
                100% { opacity: 0.4; }
            }

            @keyframes burn {
                0% { transform: translateY(0) scale(1); opacity: 0.3; }
                50% { transform: translateY(-2px) scale(1.02); opacity: 0.6; }
                100% { transform: translateY(0) scale(1); opacity: 0.3; }
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    useEffect(() => {
        if (timeframe !== '5Y') {
            prevTimeframeRef.current = timeframe;
        }
    }, [timeframe]);

    useEffect(() => {
        if (data?.[symbol]) {
            setCurrentData(data[symbol].data);
            setMetrics(data[symbol].metrics);
            setError(null);
        }
    }, [data, symbol]);

    useEffect(() => {
        setIsChartLoading(loading);
    }, [loading]);

    const handleTimeframeClick = (tf: TimeframeType) => {
        setTimeframe(tf);
        if (tf !== 'Custom') {
            setIsCustomMode(false);
            setCustomDates({ from: null, to: null });
            setCustomRange(undefined);
        }
    };

    const handleModalClose = () => {
        setShowPurchaseModal(false);
        setTimeframe(prevTimeframeRef.current);
    };

    const handleModalSuccess = () => {
        setShowPurchaseModal(false);
        setTimeframe('5Y');
    };

    const handleDateChange = (type: 'from' | 'to', date: Date | null) => {
        const newDates = {
            ...customDates,
            [type]: date
        };
        setCustomDates(newDates);

        // Only update custom range and trigger data fetch if both dates are valid
        if (newDates.from && newDates.to && newDates.to > newDates.from) {
            setCustomRange({
                from: newDates.from.getTime(),
                to: newDates.to.getTime()
            });
            setTimeframe('Custom'); // Ensure timeframe is set to Custom
        } else {
            // Clear custom range if dates are invalid
            setCustomRange(undefined);
        }
    };

   

    const handleBackClick = () => {
        setIsCustomMode(false);
        setTimeframe('1D'); // Reset to default timeframe
        setCustomDates({ from: null, to: null });
        setCustomRange(undefined);
    };

    const handleCustomModeToggle = () => {
        setIsCustomMode(true);
        setTimeframe('Custom');
        setCustomDates({ from: null, to: null });
        setCustomRange(undefined);
    };

    const content = useMemo(() => {
        if (!symbol) return null;
        if (error) return <div className="text-red-500">{error}</div>;
        if (!metrics) return <div>No metrics available</div>;

        return (
            <div className="relative overflow-hidden h-full rounded-xl shadow-[0_0_10px_rgba(59,130,246,0.03)] group">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800/90 via-slate-800/95 to-slate-900/90" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-blue-500/5" />
                
                {closeable && onClose && (
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
                )}
                
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
                        <MetricsDisplay 
                          metrics={metrics} 
                          dataType={dataType} 
                          
                        />
                    </div>

                    {/* Time Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Timeframe Selector */}
                        <TimeframeSelector
                            timeframe={timeframe}
                            isCustomMode={isCustomMode}
                            customDates={customDates}
                            onTimeframeClick={handleTimeframeClick}
                            onCustomModeToggle={handleCustomModeToggle}
                            onBackClick={handleBackClick}
                            onDateChange={handleDateChange}
                            isValidDateRange={isValidDateRange}
                        />

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

                    {/* Chart with loading overlay */}
                    {currentData.length > 0 && (
                        <div className="relative h-[400px] mt-6">
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-teal-500/5" />
                            <div className="absolute inset-[1px] rounded-xl bg-slate-800/95 backdrop-blur-xl" />
                            
                            <div className="relative h-full rounded-xl border border-white/5">
                                <div className={`absolute inset-0 flex flex-col transition-opacity duration-300 ${isChartLoading ? 'opacity-50' : ''}`}>
                                    <div className="flex-1 px-6 pt-6 pb-8">
                                        <PriceChart 
                                            data={currentData}
                                            dataType={dataType}
                                            timeframe={timeframe}
                                            selectedTimezone={selectedTimezone.value}
                                        />
                                    </div>
                                </div>
                                
                                {/* Loading overlay */}
                                {isChartLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
                                        <CircularProgress size={30} className="text-blue-500" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Initial loading state */}
                    {!currentData.length && !error && (
                        <div className="bg-gray-800 rounded-lg p-4 min-h-[500px] flex items-center justify-center">
                            <div className="flex flex-col items-center space-y-2">
                                <CircularProgress size={40} className="text-blue-500" />
                                <span className="text-gray-400 text-sm">Loading price data...</span>
                            </div>
                        </div>
                    )}

                    
                </div>
            </div>
        );
    }, [currentData, metrics, isChartLoading, error, dataType, timeframe, selectedTimezone.value, symbol, onClose]);

    // Call onSymbolChange when symbol changes
    useEffect(() => {
        onSymbolChange?.(symbol);
    }, [symbol, onSymbolChange]);

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            {content}
            <PurchaseDataModal
                isOpen={showPurchaseModal}
                onClose={handleModalClose}
                symbol={symbol}
                onSuccess={handleModalSuccess}
            />
        </LocalizationProvider>
    );
});

PriceAnalytics.displayName = 'PriceAnalytics';