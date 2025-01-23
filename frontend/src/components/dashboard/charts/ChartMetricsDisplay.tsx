import { memo } from 'react';
import { ArrowDropUp, ArrowDropDown } from '@mui/icons-material';
import { formatValue, formatPercentage } from '../../../utils/formatters';

const MetricsDisplay = memo(({ metrics, dataType }: { 
    metrics: Record<string, { high: number; change: number }>;
    dataType: 'price' | 'marketCap' | 'volume';
}) => {
    if (!metrics?.[dataType]) return null;

    const { high, change } = metrics[dataType];

    return (
        <div className="flex items-center gap-3">
            <span className="text-gray-200 font-medium">
                {formatValue(high, dataType)}
            </span>
            <div className={`flex items-center -space-x-1 text-sm ${
                change >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
                {change >= 0 
                    ? <ArrowDropUp className="w-5 h-5" /> 
                    : <ArrowDropDown className="w-5 h-5" />
                }
                {formatPercentage(Math.abs(change))}
            </div>
        </div>
    );
});

MetricsDisplay.displayName = 'MetricsDisplay';

export default MetricsDisplay;