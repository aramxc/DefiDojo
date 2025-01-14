import React from 'react';
import { StatCard } from './StatCard';
import { useMarketMetrics } from '../../hooks/useMarketMetrics';
import { TrendingUp, ShowChart, Psychology } from '@mui/icons-material';

interface MarketMetricsCardProps {
    symbol: string;
}

export const MarketMetricsCard: React.FC<MarketMetricsCardProps> = ({ symbol }) => {
    const { metrics, loading, error } = useMarketMetrics(symbol);

    if (error) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
                title="Market Sentiment"
                icon={<Psychology />}
                isLoading={loading}
                stats={[
                    {
                        label: "Fear & Greed",
                        value: metrics ? `${metrics.fearGreed.value}` : 'N/A',
                    },
                    {
                        label: "Momentum",
                        value: metrics ? `${metrics.fearGreed.components.momentum}` : 'N/A',
                    },
                    {
                        label: "Volatility",
                        value: metrics ? `${metrics.fearGreed.components.volatility}` : 'N/A',
                    }
                ]}
            />

            <StatCard
                title="Price Trends"
                icon={<TrendingUp />}
                isLoading={loading}
                stats={[
                    {
                        label: "24h Change",
                        value: metrics ? `$${metrics.trends.price.currentPrice.price}` : 'N/A',
                        change: metrics?.trends.price.change24h
                    },
                    {
                        label: "7d Change",
                        value: "Price",
                        change: metrics?.trends.price.change7d
                    },
                    {
                        label: "30d Change",
                        value: "Price",
                        change: metrics?.trends.price.change30d
                    }
                ]}
            />

            <StatCard
                title="Volatility"
                icon={<ShowChart />}
                isLoading={loading}
                stats={[
                    {
                        label: "Daily",
                        value: metrics ? `${metrics.volatility.daily.toFixed(2)}%` : 'N/A',
                    },
                    {
                        label: "Weekly",
                        value: metrics ? `${metrics.volatility.weekly.toFixed(2)}%` : 'N/A',
                    },
                    {
                        label: "Monthly",
                        value: metrics ? `${metrics.volatility.monthly.toFixed(2)}%` : 'N/A',
                    }
                ]}
            />
        </div>
    );
};