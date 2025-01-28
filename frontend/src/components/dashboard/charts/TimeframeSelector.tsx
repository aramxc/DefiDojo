import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ArrowLeft from '@mui/icons-material/ArrowLeft';
import { TimeframeType } from '../../../services/api/historicalPrice.service';

// Constants
const TIMEFRAMES: TimeframeType[] = ['1D', '7D', '1M', '6M', '1Y', '5Y', 'Custom'];

// TimeframeSelector Component with Custom Date Range Selection (custom mode)
const TimeframeSelector = memo(({ 
    timeframe,
    isCustomMode,
    customDates,
    onTimeframeClick,
    onBackClick,
    onDateChange,
    isValidDateRange,
    onCustomModeToggle
}: {
    timeframe: TimeframeType;
    isCustomMode: boolean;
    customDates: { from: Date | null; to: Date | null };
    onTimeframeClick: (tf: TimeframeType) => void;
    onBackClick: () => void;
    onDateChange: (type: 'from' | 'to', date: Date | null) => void;
    isValidDateRange: boolean;
    onCustomModeToggle?: () => void;
}) => (
    <AnimatePresence mode="wait">
        {!isCustomMode ? (
            <motion.div 
                className="flex gap-2 h-10"
                initial={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                key="timeframes"
            >
                {TIMEFRAMES.map((tf) => (
                    <motion.button
                        key={tf}
                        onClick={() => onTimeframeClick(tf)}
                        className={`
                            h-10 px-4
                            rounded-lg 
                            font-medium
                            text-sm
                            transition-all duration-200
                            ${(tf === '5Y' || tf === 'Custom') 
                                ? timeframe === tf || (tf === 'Custom' && isCustomMode)
                                    ? `relative overflow-hidden
                                       text-white
                                       before:absolute before:inset-0 
                                       before:rounded-lg
                                       before:bg-gradient-to-r before:from-fuchsia-500/90 before:via-pink-500/90 before:to-fuchsia-400/90
                                       before:backdrop-blur-xl
                                       before:animate-[burn_3s_ease-in-out_infinite]
                                       after:absolute after:inset-0 
                                       after:rounded-lg
                                       after:bg-gradient-to-r after:from-fuchsia-500/60 after:via-pink-500/60 after:to-fuchsia-400/60
                                       shadow-[0_0_25px_rgba(236,72,153,0.5)]
                                       [&>span]:animate-[pulse_2s_ease-in-out_infinite]`
                                    : `relative overflow-hidden
                                       text-white
                                       before:absolute before:inset-0 
                                       before:rounded-lg
                                       before:bg-gradient-to-r before:from-fuchsia-500/60 before:via-pink-500/60 before:to-fuchsia-400/60
                                       before:backdrop-blur-xl
                                       before:animate-[burn_3s_ease-in-out_infinite]
                                       hover:shadow-[0_0_25px_rgba(236,72,153,0.5)]
                                       hover:before:from-fuchsia-500/80 hover:before:via-pink-500/80 hover:before:to-fuchsia-400/80`
                                : timeframe === tf
                                    ? `relative overflow-hidden
                                       text-white
                                       before:absolute before:inset-0 
                                       before:rounded-lg
                                       before:bg-gradient-to-r before:from-blue-500/20 before:to-cyan-500/20 
                                       before:backdrop-blur-xl
                                       after:absolute after:inset-0 
                                       after:rounded-lg
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
                    className="h-10 px-4 rounded-lg font-medium text-sm
                             relative overflow-hidden text-white
                             before:absolute before:inset-0 
                             before:rounded-lg
                             before:bg-gradient-to-r before:from-fuchsia-500/90 before:via-pink-500/90 before:to-fuchsia-400/90
                             before:backdrop-blur-xl
                             before:animate-[burn_3s_ease-in-out_infinite]
                             shadow-[0_0_25px_rgba(236,72,153,0.5)]
                             hover:shadow-[0_0_30px_rgba(236,72,153,0.6)]
                             transition-all duration-300"
                >
                    <span className="relative z-10 flex items-center">
                        <ArrowLeft className="w-4 h-4" />
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

TimeframeSelector.displayName = 'TimeframeSelector';

export default TimeframeSelector;