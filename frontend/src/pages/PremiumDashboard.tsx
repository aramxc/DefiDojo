import React, { useState, useEffect, useMemo } from 'react';
import TickerInputForm from '../components/dashboard/TickerInputForm';
import { PriceAnalytics } from '../components/dashboard/PriceAnalytics';
import { SortablePriceDisplay } from '../components/dashboard/SortablePriceDisplay';
import { StatCard } from '../components/dashboard/StatCard';
import { motion } from 'framer-motion';
import {
  Card, CardContent, LinearProgress, Chip,
  Alert, AlertTitle, Tooltip
} from '@mui/material';
import { 
  TrendingUp, TrendingDown, Schedule, Assessment,
  ShowChart, PieChart, Timeline as TimelineIcon,
  Notifications, Speed, Analytics, 
  MonetizationOn, Insights, DataUsage, Code, GitHub, InfoOutlined
} from '@mui/icons-material';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useFetchAssetInfo } from '../hooks/useFetchAssetInfo';
import { Gauge } from '@mui/x-charts';
import { useFetchMarketMetrics } from '../hooks/useFetchMarketMetrics';
import { DetailedPriceCard } from '../components/dashboard/DetailedPriceCard';
import { formatPercentage, formatCurrency } from '../utils/formatters';
import { CustomTimeframeChart } from '../components/premium/CustomTimeframeChart';
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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

  // Add debug logs
  console.log('Asset Info:', assetInfo);
  console.log('Selected Symbol:', selectedSymbol);
  console.log('CoinGecko ID:', assetInfo?.COINGECKO_ID);
  console.log('Metrics Data:', metrics);

  return (
    <div className="min-h-[100dvh] pt-[var(--navbar-height)] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* First Section - Main Analysis */}
      <div className="h-[calc(100dvh-var(--navbar-height))] w-full max-w-[1920px] mx-auto px-4 py-2 sm:p-6 lg:p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-full w-full rounded-2xl overflow-hidden
                     backdrop-blur-xl 
                     bg-gradient-to-b from-slate-900/80 via-slate-950/80 to-black/80
                     border border-white/[0.05]
                     shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]"
        >
          <div className="h-full flex flex-col divide-y divide-white/[0.03]">
            {/* Header Section - Ticker Input */}
            <div className="p-6">
              <TickerInputForm 
                onSelectTicker={setSelectedSymbol}
                selectedTicker={selectedSymbol}
                allowMultipleSelections={false}
                defaultTicker={defaultTicker}
                key={defaultTicker}
              />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:flex-row divide-white/5">
              {/* Left Column - Detailed Price Card */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:w-96 p-6 h-full
                          bg-gradient-to-b from-white/[0.03] to-transparent"
              > 
                {selectedSymbol && (
                  <DetailedPriceCard
                    symbol={selectedSymbol}
                    assetInfo={assetInfo}
                    price={metrics?.trends?.price?.currentPrice?.price}
                    priceChange24h={metrics?.trends?.price?.change24h}
                    volume24h={metrics?.trends?.volume?.currentVolume}
                    isLoading={metricsLoading}
                  />
                )}
              </motion.div>

              {/* Center Column - Main Charts */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 p-6 h-full
                          bg-gradient-to-b from-white/[0.02] to-transparent"
              >
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-full rounded-xl
                            shadow-[0_4px_24px_-8px_rgba(0,0,0,0.3)]
                            bg-white/5
                            backdrop-blur-xl"
                >
                  <PriceAnalytics 
                    symbol={selectedSymbol} 
                    onSymbolChange={setSelectedSymbol} 
                    onClose={() => {}} 
                  />
                </motion.div>
              </motion.div>

              {/* Right Column - Stats & Info */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="lg:w-80 p-6 overflow-y-auto
                          scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent
                          bg-gradient-to-b from-white/[0.02] to-transparent"
              >
                <div className="space-y-6">
                <motion.div
                    initial={{ opacity:0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="flex flex-col gap-6"
                  >
                  
                  <StatCard
                    title="Market Overview"
                    icon={<MonetizationOn className="text-blue-400" />}
                    stats={[
                      { 
                        label: "24h Change", 
                        value: metrics?.trends?.price?.change24h ? 
                          formatPercentage(metrics.trends.price.change24h) : 'N/A'
                      },
                      { 
                        label: "7d Change",
                        value: metrics?.trends?.price?.change7d ? 
                          formatPercentage(metrics.trends.price.change7d) : 'N/A'
                      },
                      { 
                        label: "30d Change",
                        value: metrics?.trends?.price?.change30d ? 
                          formatPercentage(metrics.trends.price.change30d) : 'N/A'
                      },
                      {
                        label: "Volume Change 24h",
                        value: metrics?.trends?.volume?.change24h ? 
                          formatPercentage(metrics.trends.volume.change24h) : 'N/A'
                      }
                    ]}
                    isLoading={metricsLoading}
                  />

                  {/* Network Metrics */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                >
                  <StatCard
                    title="Network Metrics"
                    icon={<Analytics className="text-blue-400" />}
                    stats={[
                      {
                        label: "Transaction Volume",
                        value: 'Coming soon..',
                      },
                     
                      {
                        label: "Hash Algorithm",
                        value: assetInfo?.HASHING_ALGORITHM || 'N/A'
                      },
                      {
                          label: "Block Time",
                          value: assetInfo?.BLOCK_TIME_IN_MINUTES || 'N/A'
                        }
                    ]}
                    isLoading={assetLoading || metricsLoading}
                  />
                </motion.div>
                  
                  
                    
                    
                    {/* Fear/Greed Gauge */}
                    <div className="relative rounded-xl overflow-hidden
                                  shadow-[0_0_10px_rgba(59,130,246,0.03)] 
                                  group hover:transform hover:scale-[1.02] transition-all duration-200
                                  before:absolute before:inset-0 
                                  before:bg-gradient-to-br before:from-slate-800/90 before:via-slate-800/80 before:to-slate-900/90 
                                  before:backdrop-blur-xl before:transition-opacity">
                      <div className="relative z-10 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Insights className="text-blue-400" />
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-gray-300
                                          bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
                                Fear / Greed Index
                              </h3>
                              <span className="text-[10px] font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 
                                            text-white px-1.5 py-0.5 rounded-full">
                                BETA
                              </span>
                            </div>
                          </div>
                          <Tooltip 
                            title={
                              <div className="p-2 max-w-xs text-sm">
                                The Fear & Greed Index analyzes market sentiment using multiple factors:
                                • Market Volatility (25%)
                                • Market Momentum/Volume (25%)
                                • Social Media Sentiment (15%)
                                • Market Dominance (10%)
                                • Trading Volume (25%)

                                0 = Extreme Fear, 100 = Extreme Greed
                              </div>
                            }
                            arrow
                            placement="top"
                          >
                            <InfoOutlined className="text-gray-400 hover:text-gray-300 cursor-help w-4 h-4" />
                          </Tooltip>
                        </div>
                        <Gauge
                          value={metrics?.fearGreed?.value ?? 50}
                         
                          aria-label="Fear and Greed Index"
                          sx={{
                            width: '100%',
                            height: 150,
                            '& .MuiChartsGauge-mark': { stroke: '#475569' },
                            '& .MuiChartsGauge-markLabel': { fill: '#94a3b8' },
                            '& .MuiChartsGauge-valueText': {
                              fill: '#e2e8f0',
                              fontSize: '1.5rem',
                              fontWeight: 'bold'
                            },
                            '& .MuiChartsGauge-track': { stroke: '#334155' },
                            '& .MuiChartsGauge-progress': {
                              stroke: (metrics?.fearGreed?.value ?? 50) >= 50 ? '#22c55e' : '#ef4444',
                            }
                          }}
                        />
                        <div className="flex justify-between w-full mt-4 text-sm">
                          <span className="text-red-400">Extreme Fear</span>
                          <span className="text-green-400">Extreme Greed</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
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