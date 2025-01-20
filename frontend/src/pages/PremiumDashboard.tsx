import React, { useState, useEffect } from 'react';
import TickerInputForm from '../components/dashboard/TickerInputForm';
import { PriceAnalytics } from '../components/dashboard/PriceAnalytics';
import { DetailedPriceCard } from '../components/dashboard/cards/DetailedPriceCard';
import { NewsFeed } from '../components/news/NewsFeed';
import { motion } from 'framer-motion';
import { 
  MonetizationOn, 
  TrendingUp, 
  ShowChart 
} from '@mui/icons-material';
import { StatCard } from '../components/dashboard/cards/StatCard';
import { useFetchAssetInfo } from '../hooks/useFetchAssetInfo';
import { useFetchMarketMetrics } from '../hooks/useFetchMarketMetrics';

interface AdvancedDashboardProps {
  selectedTickers: string[];
  onAddTickers: (tickers: string[]) => void;
  onRemoveTicker: (symbol: string) => void;
  defaultTicker?: string;
}

const AdvancedDashboard: React.FC<AdvancedDashboardProps> = ({
  selectedTickers,
  onAddTickers,
  onRemoveTicker,
  defaultTicker = 'BTC'
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(defaultTicker);
  const [items, setItems] = useState(selectedTickers);
  
  useEffect(() => {
    if (!selectedSymbol) {
      setSelectedSymbol(defaultTicker);
    }
  }, [defaultTicker]);

  // Get asset info first
  const { assetInfo, loading: assetLoading } = useFetchAssetInfo(selectedSymbol);
  
  // Use assetInfo to get coingeckoId for market metrics
  const { metrics, loading: metricsLoading } = useFetchMarketMetrics(
    selectedSymbol,
    assetInfo?.COINGECKO_ID || undefined
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        
        const newItems = [...items];
        newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, active.id);
        
        return newItems;
      });
    }
  };

  useEffect(() => {
    setItems(selectedTickers);
  }, [selectedTickers]);

  return (
    <div className="min-h-[100dvh] pt-[var(--navbar-height)] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* First Section - Main Analysis */}
      <div className="h-[calc(100dvh-var(--navbar-height))] w-full max-w-[1920px] mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-full w-full rounded-2xl overflow-hidden
                     backdrop-blur-xl 
                     bg-gradient-to-b from-slate-900/80 via-slate-950/80 to-black/80
                     border border-white/[0.05]
                     shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]"
        >
          <div className="h-full flex flex-col">
            {/* Header Section - Ticker Input */}
            <div className="p-3 lg:p-4 flex-none">
              <TickerInputForm 
                onSelectTicker={setSelectedSymbol}
                selectedTicker={selectedSymbol}
                allowMultipleSelections={false}
                defaultTicker={defaultTicker}
                key={defaultTicker}
              />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:flex-row min-h-0 h-[calc(100%-4rem)] w-full gap-2 p-4">
              {/* Left Column - Detailed Price Card */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full lg:w-[23%] h-auto lg:h-full flex-none
                          from-white/[0.03] to-transparent
                          rounded-xl"
              >
                <div className="h-full w-full p-1 sm:p-2">
                  <DetailedPriceCard
                    symbol={selectedSymbol}
                    assetInfo={assetInfo}
                    price={metrics?.trends?.price?.currentPrice?.price}
                    priceChange24h={metrics?.trends?.price?.change24h}
                    volume24h={metrics?.trends?.volume?.currentVolume}
                    isLoading={metricsLoading}
                  />
                </div>
              </motion.div>

              {/* Center Column - Main Charts */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full lg:flex-1 h-[500px] lg:h-full 
                          mx-0 lg:mx-4
                          from-white/[0.03] to-transparent
                          rounded-xl"
              >
                <div className="h-full p-1 sm:p-2 flex flex-col">
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 rounded-xl overflow-hidden"
                  >
                    <PriceAnalytics 
                      symbol={selectedSymbol} 
                      onSymbolChange={setSelectedSymbol} 
                      onClose={() => {}} 
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Right Column - Metrics & Fear/Greed */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full lg:w-[23%] h-auto flex-none
                          from-white/[0.03] to-transparent 
                          rounded-xl"
              >
                <div className="h-full w-full p-1 sm:p-2 flex flex-col">

                  {/* News Feed */}
                  <NewsFeed symbol={selectedSymbol} />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Second Section - Command Center */}
      <div className="min-h-[calc(100dvh-var(--navbar-height))] w-full max-w-[1920px] mx-auto px-4 py-2 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="w-full rounded-2xl overflow-hidden
                     backdrop-blur-xl 
                     bg-gradient-to-b from-slate-900/80 via-slate-950/80 to-black/80
                     border border-white/[0.05]
                     shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]"
        >
          {/* Command Center Header */}
          <div className="p-6 border-b border-white/[0.05]">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Command Center
            </h2>
          </div>

          {/* Command Center Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Price Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <StatCard
                  title="Price Overview"
                  icon={<MonetizationOn className="text-blue-400" />}
                  stats={[
                    {
                      label: "Current Price",
                      value: metrics?.trends?.price?.currentPrice?.price
                        ? `$${metrics.trends.price.currentPrice.price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                        : 'N/A'
                    },
                    {
                      label: "24h Volume",
                      value: metrics?.trends?.volume?.currentVolume
                        ? `$${metrics.trends.volume.currentVolume.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                        : 'N/A'
                    },
                    {
                      label: "24h Change",
                      value: metrics?.trends?.price?.change24h
                        ? `${metrics.trends.price.change24h.toFixed(2)}%`
                        : 'N/A',
                      change: metrics?.trends?.price?.change24h
                    },
                    {
                      label: "Volume Change",
                      value: metrics?.trends?.volume?.change24h
                        ? `${metrics.trends.volume.change24h.toFixed(2)}%`
                        : 'N/A',
                      change: metrics?.trends?.volume?.change24h
                    }
                  ]}
                  isLoading={assetLoading || metricsLoading}
                />
              </motion.div>

              {/* Market Trends */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <StatCard
                  title="Market Trends"
                  icon={<TrendingUp className="text-blue-400" />}
                  stats={[
                    {
                      label: "7d Price Change",
                      value: metrics?.trends?.price?.change7d
                        ? `${metrics.trends.price.change7d.toFixed(2)}%`
                        : 'N/A',
                      change: metrics?.trends?.price?.change7d
                    },
                    {
                      label: "30d Price Change",
                      value: metrics?.trends?.price?.change30d
                        ? `${metrics.trends.price.change30d.toFixed(2)}%`
                        : 'N/A',
                      change: metrics?.trends?.price?.change30d
                    },
                    {
                      label: "7d Volume Change",
                      value: metrics?.trends?.volume?.change7d
                        ? `${metrics.trends.volume.change7d.toFixed(2)}%`
                        : 'N/A',
                      change: metrics?.trends?.volume?.change7d
                    },
                    {
                      label: "30d Volume Change",
                      value: metrics?.trends?.volume?.change30d
                        ? `${metrics.trends.volume.change30d.toFixed(2)}%`
                        : 'N/A',
                      change: metrics?.trends?.volume?.change30d
                    }
                  ]}
                  isLoading={assetLoading || metricsLoading}
                />
              </motion.div>

              {/* Volatility Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <StatCard
                  title="Volatility Metrics"
                  icon={<ShowChart className="text-blue-400" />}
                  infoTooltip="Volatility is calculated using the standard deviation of daily returns over different time periods. Daily volatility uses 24h data, weekly uses 7 days, and monthly uses 30 days of historical price data."
                  stats={[
                    {
                      label: "Daily Volatility",
                      change: metrics?.volatility?.daily
                        ? (metrics.volatility.daily * 100)
                        : undefined
                    },
                    {
                      label: "Weekly Volatility",
                      change: metrics?.volatility?.weekly
                        ? (metrics.volatility.weekly * 100)
                        : undefined
                    },
                    {
                      label: "Monthly Volatility",
                      change: metrics?.volatility?.monthly
                        ? (metrics.volatility.monthly * 100)
                        : undefined
                    },
                    {
                      label: "Std Deviation",
                      change: metrics?.volatility?.standardDeviation
                        ? (metrics.volatility.standardDeviation * 100)
                        : undefined
                    }
                  ]}
                  isLoading={metricsLoading}
                />
              </motion.div>
            </div>
          </div>
          
        </motion.div>
      </div>
    </div>
  );
};  

export default AdvancedDashboard;