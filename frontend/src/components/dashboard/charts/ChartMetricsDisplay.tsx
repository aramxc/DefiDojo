import { memo } from 'react';
import { formatCurrency, formatPercentage } from '../../../utils/formatters';

// MetricsDisplay Component
const MetricsDisplay = memo(({ metrics, dataType }: { 
    metrics: any; 
    dataType: 'price' | 'marketCap' | 'volume';
}) => {
    if (!metrics) return null;

    const getMetricValue = () => {
        switch (dataType) {
            case 'price':
                return metrics.currentPrice ? formatCurrency(metrics.currentPrice) : 'N/A';
            case 'marketCap':
                return metrics.marketCap ? formatCurrency(metrics.marketCap) : 'N/A';
            case 'volume':
                return metrics.volume ? formatCurrency(metrics.volume) : 'N/A';
            default:
                return 'N/A';
        }
    };

    const getMetricChange = () => {
        switch (dataType) {
            case 'price':
                return metrics.priceChange;
            case 'marketCap':
                return metrics.marketCapChange;
            case 'volume':
                return metrics.volumeChange;
            default:
                return null;
        }
    };

    const change = getMetricChange();

    return (
        <div className="flex items-center gap-3">
            <span className="text-gray-200 font-medium">{getMetricValue()}</span>
            {change !== null && (
                <span className={`text-sm ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatPercentage(change)}
                </span>
            )}
        </div>
    );
});

export default MetricsDisplay;