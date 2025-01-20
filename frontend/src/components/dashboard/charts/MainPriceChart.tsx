import { memo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area } from 'recharts';
import { TimeframeType } from '../../../services/api/historicalPrice.service';
import { formatTimestamp, formatValue, formatYAxisValue } from '../../../utils/formatters';

const PriceChart = memo(({ 
    data, 
    dataType,
    timeframe, 
    selectedTimezone 
}: { 
    data: Array<any>;
    dataType: 'price' | 'marketCap' | 'volume';
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

PriceChart.displayName = 'PriceChart';

export default PriceChart;