import React, { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area } from 'recharts';
import { CircularProgress } from '@mui/material';
import { useFetchHistoricalPrices } from '../../hooks/usePriceHistory';
import { formatTimestamp, formatValue, formatYAxisValue } from '../../utils/formatters';

interface CustomTimeframeChartProps {
  symbol: string;
  customTimeframe: {
    from: number;
    to: number;
  };
}

export const CustomTimeframeChart: React.FC<CustomTimeframeChartProps> = ({ 
  symbol, 
  customTimeframe 
}) => {
  const [dateRange, setDateRange] = useState({
    from: new Date(customTimeframe.from),
    to: new Date(customTimeframe.to)
  });

  const { data, loading } = useFetchHistoricalPrices({
    symbol,
    timeframe: 'Custom',
    customRange: {
      from: dateRange.from.getTime(),
      to: dateRange.to.getTime()
    }
  });

  const getTimeframeType = (diffDays: number): string => {
    return diffDays <= 7 ? '7D' : '1M';
  };

  const diffDays = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
  const timeframeType = getTimeframeType(diffDays);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="relative overflow-hidden h-full rounded-xl shadow-[0_0_10px_rgba(59,130,246,0.03)]">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/90 via-slate-800/95 to-slate-900/90" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-blue-500/5" />
        
        <div className="relative p-6 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-gray-200 to-gray-100 bg-clip-text text-transparent">
              Custom Timeframe Analysis
            </h2>
            <div className="flex gap-4">
              <DatePicker
                label="From Date"
                value={dateRange.from}
                onChange={(newValue) => newValue && setDateRange(prev => ({ ...prev, from: newValue }))}
                className="bg-slate-800/50"
                slotProps={{
                  textField: {
                    size: "small",
                    className: "w-40 bg-slate-800/50 text-white border-white/5"
                  }
                }}
              />
              <DatePicker
                label="To Date"
                value={dateRange.to}
                onChange={(newValue) => newValue && setDateRange(prev => ({ ...prev, to: newValue }))}
                className="bg-slate-800/50"
                slotProps={{
                  textField: {
                    size: "small",
                    className: "w-40 bg-slate-800/50 text-white border-white/5"
                  }
                }}
              />
            </div>
          </div>

          <div className="relative h-[400px]">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-teal-500/5" />
            <div className="absolute inset-[1px] rounded-xl bg-slate-800/95 backdrop-blur-xl" />
            
            <div className="relative h-full rounded-xl border border-white/5">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
                  <CircularProgress size={30} className="text-blue-500" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data?.[symbol]?.data || []} margin={{ top: 5, right: 5, left: 5, bottom: 15 }}>
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
                      tickFormatter={(ts) => formatTimestamp(ts, timeframeType, 'UTC')}
                      type="number"
                      domain={['dataMin', 'dataMax']}
                      tick={{ fill: '#94A3B8' }}
                      stroke="#334155"
                      dy={10}
                    />
                    <YAxis 
                      dataKey="price"
                      domain={['auto', 'auto']}
                      tickFormatter={(value) => formatYAxisValue(value, 'price')}
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
                      labelFormatter={(ts) => formatTimestamp(ts, timeframeType, 'UTC')}
                      formatter={(value: any) => [formatValue(value, 'price'), 'Price']}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="none"
                      fill="url(#areaGradient)"
                      fillOpacity={1}
                    />
                    <Line 
                      type="monotone"
                      dataKey="price"
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
              )}
            </div>
          </div>
        </div>
      </div>
    </LocalizationProvider>
  );
};