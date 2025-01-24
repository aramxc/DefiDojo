import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircularProgress } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { TimeframeType } from '../../services/api/historicalPrice.service';
import { checkProAccess } from '../../services/web3/contract.service';
import { useFetchHistoricalPrices } from '../../hooks/useFetchHistoricalPrices';
import { useTimezone, TIMEZONE_OPTIONS } from '../../contexts/TimezoneContext';
import { PurchaseDataModal } from '../premium/PurchaseDataModal';
import TimeframeSelector from './charts/TimeframeSelector';
import MetricsDisplay from './charts/ChartMetricsDisplay';
import PriceChart from './charts/MainPriceChart';
import { ShowChart, TrendingUp } from '@mui/icons-material';

type DataType = 'price' | 'marketCap' | 'volume';
interface PriceAnalyticsProps {
  symbol: string;
  onSymbolChange?: (symbol: string) => void;
  onClose: () => void;
  closeable?: boolean;
}

export const PriceAnalytics = memo(({ 
  symbol, 
  onSymbolChange,
  onClose, 
  closeable = false 
}: PriceAnalyticsProps) => {
    // Core state
    const { selectedTimezone, setTimezone } = useTimezone();
    const [timeframe, setTimeframe] = useState<TimeframeType>('1D');
    const [dataType, setDataType] = useState<DataType>('price');
    const [currentData, setCurrentData] = useState<Array<any>>([]);
    const [isChartLoading, setIsChartLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [metrics, setMetrics] = useState<any>(null);

    // Modal and custom date state
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const prevTimeframeRef = useRef<TimeframeType>('1D');
    const [isCustomMode, setIsCustomMode] = useState(false);
    const [customDates, setCustomDates] = useState<{
        from: Date | null;
        to: Date | null;
    }>({ from: null, to: null });
    const [customRange, setCustomRange] = useState<{from: number; to: number} | undefined>();

    // Validation and data fetching
    const isValidDateRange = useMemo(() => {
        if (!customDates.from || !customDates.to) return false;
        return customDates.to > customDates.from;
    }, [customDates.from, customDates.to]);

    const effectiveTimeframe = useMemo(() => {
        if (timeframe === 'Custom' && (!customRange || !isValidDateRange)) {
            return null;
        }
        return timeframe;
    }, [timeframe, customRange, isValidDateRange]);

    const { data, loading } = useFetchHistoricalPrices({
        symbol,
        timeframe: effectiveTimeframe,
        customRange
    });

    // Event handlers
    const handleTimeframeClick = async (tf: TimeframeType) => {
        if (tf === '5Y' || tf === 'Custom') {
            const hasAccess = await checkProAccess(symbol);
            if (!hasAccess) {
                setShowPurchaseModal(true);
                return;
            }
        }
        
        setTimeframe(tf);
        if (tf !== 'Custom') {
            setIsCustomMode(false);
            setCustomDates({ from: null, to: null });
            setCustomRange(undefined);
        }
    };

    const handleDateChange = (type: 'from' | 'to', date: Date | null) => {
        const newDates = { ...customDates, [type]: date };
        setCustomDates(newDates);

        if (newDates.from && newDates.to && newDates.to > newDates.from) {
            setCustomRange({
                from: newDates.from.getTime(),
                to: newDates.to.getTime()
            });
            setTimeframe('Custom');
        } else {
            setCustomRange(undefined);
        }
    };

    // Effects
    useEffect(() => {
        if (timeframe !== '5Y') {
            prevTimeframeRef.current = timeframe;
        }
    }, [timeframe]);

    useEffect(() => {
        if (data?.[symbol]) {
            console.log('Setting current data:', data[symbol].data); // Debug log
            setCurrentData(data[symbol].data);
            setMetrics(data[symbol].metrics);
            setError(null);
        }
    }, [data, symbol]);

    useEffect(() => {
        setIsChartLoading(loading);
    }, [loading]);

    useEffect(() => {
        onSymbolChange?.(symbol);
    }, [symbol, onSymbolChange]);

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`h-full w-full rounded-xl overflow-hidden relative group 
                         before:absolute before:inset-0 
                         before:bg-gradient-to-br before:from-slate-800/90 before:via-slate-900/90 before:to-slate-950/90 
                         before:backdrop-blur-xl before:transition-opacity
                         after:absolute after:inset-0 
                         after:bg-gradient-to-br after:from-blue-500/5 after:via-cyan-500/5 after:to-teal-500/5 
                         after:opacity-0 hover:after:opacity-100 
                         after:transition-opacity
                         border border-white/[0.05]
                         shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]`}
            >
                <div className="relative z-10 p-6 h-full flex flex-col">
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-2 mb-6"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative transition-all duration-300">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/0 to-cyan-500/0 rounded-full blur-sm group-hover:from-blue-500/20 group-hover:to-cyan-500/20 transition-all duration-300"></div>
                                <div className="relative p-2 rounded-xl bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-slate-900/50 backdrop-blur-sm border border-white/[0.05]">
                                    <TrendingUp className="w-5 h-5 text-blue-400" />
                                </div>
                            </div>
                            <span className="relative text-lg sm:text-lg md:text-xl font-bold font-bold">
                                <span className="absolute inset-0 w-[105%] bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 blur-xl opacity-10" />
                                <span className="relative bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 
                                            bg-clip-text text-transparent tracking-tight font-extrabold">
                                    {symbol} Analytics
                                </span>
                            </span>
                        </div>
                        <div className="h-px w-full bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-transparent"></div>
                    </motion.div>

                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                        {/* Data Type Toggle */}
<div className="flex flex-wrap items-center gap-2">
    {['price', 'marketCap', 'volume'].map((type) => (
        <button 
            key={type}
            onClick={() => setDataType(type as DataType)}
            className={`
                px-3 sm:px-4 py-2 
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
                       shadow-[0_0_10px_rgba(59,130,246,0.1)]
                       ` 
                    : `text-gray-400 
                       hover:text-white 
                       hover:bg-slate-700/50
                       hover:shadow-[0_0_15px_rgba(59,130,246,0.1)]
                       relative overflow-hidden
                       before:absolute before:inset-0 
                       before:bg-gradient-to-r before:from-blue-500/0 before:to-cyan-500/0 
                       before:backdrop-blur-xl
                       before:transition-colors
                       hover:before:from-blue-500/10 hover:before:to-cyan-500/10`
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
                        <MetricsDisplay metrics={metrics} dataType={dataType} />
                    </div>

                    {/* Time Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                        <TimeframeSelector
                            timeframe={timeframe}
                            isCustomMode={isCustomMode}
                            customDates={customDates}
                            onTimeframeClick={handleTimeframeClick}
                            onCustomModeToggle={() => setIsCustomMode(true)}
                            onBackClick={() => {
                                setIsCustomMode(false);
                                setTimeframe('1D');
                                setCustomDates({ from: null, to: null });
                                setCustomRange(undefined);
                            }}
                            onDateChange={handleDateChange}
                            isValidDateRange={isValidDateRange}
                        />

                        <div className="sm:ml-auto flex items-center gap-2">
                            <span className="text-xs text-gray-400">Timezone:</span>
                            <select
                                value={selectedTimezone.value}
                                onChange={(e) => {
                                    const newTimezone = TIMEZONE_OPTIONS.find(tz => tz.value === e.target.value);
                                    if (newTimezone) setTimezone(newTimezone);
                                }}
                                className="bg-slate-800/50 text-white text-xs px-3 py-2 pr-8 rounded-lg 
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

                    {/* Chart */}
                    {currentData?.length > 0 ? (
                        <div className="flex-1 min-h-0">
                            <PriceChart 
                                data={currentData}
                                dataType={dataType}
                                timeframe={timeframe}
                                selectedTimezone={selectedTimezone.value}
                            />
                        </div>
                    ) : !error ? (
                        <div className="flex-1 min-h-[300px] sm:min-h-[350px] flex items-center justify-center">
                            <CircularProgress size={40} className="text-blue-500" />
                        </div>
                    ) : (
                        <div className="text-red-500">{error}</div>
                    )}
                </div>
            </motion.div>

            <PurchaseDataModal
                isOpen={showPurchaseModal}
                onClose={() => {
                    setShowPurchaseModal(false);
                    setTimeframe(prevTimeframeRef.current);
                }}
                onSuccess={() => {
                    setShowPurchaseModal(false);
                    setTimeframe('5Y');
                }}
                symbol={symbol}
            />
        </LocalizationProvider>
    );
});

PriceAnalytics.displayName = 'PriceAnalytics';