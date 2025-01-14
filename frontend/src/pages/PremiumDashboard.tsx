import React, { useState, useEffect } from 'react';
import TickerInputForm from '../components/dashboard/TickerInputForm';
import { PriceAnalytics } from '../components/dashboard/PriceAnalytics';
import { SortablePriceDisplay } from '../components/dashboard/SortablePriceDisplay';
import { StatCard } from '../components/dashboard/StatCard';
import { motion } from 'framer-motion';
import {
  Card, CardContent, LinearProgress, Chip,
  Alert, AlertTitle
} from '@mui/material';
import { 
  TrendingUp, TrendingDown, Schedule, Assessment,
  ShowChart, PieChart, Timeline as TimelineIcon,
  Notifications, Speed, Analytics, 
  MonetizationOn, Insights, DataUsage, Code, GitHub
} from '@mui/icons-material';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useFetchAssetInfo } from '../hooks/useFetchAssetInfo';
import { Gauge } from '@mui/x-charts';

interface AdvancedDashboardProps {
  selectedTickers: string[];
  onAddTickers: (tickers: string[]) => void;
  onRemoveTicker: (symbol: string) => void;
}

const AdvancedDashboard: React.FC<AdvancedDashboardProps> = ({
  selectedTickers,
  onAddTickers,
  onRemoveTicker,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(selectedTickers[0] || '');
  const [items, setItems] = useState(selectedTickers);
  const { assetInfo, loading, error } = useFetchAssetInfo(selectedSymbol);

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

  return (
    <div className="min-h-[100dvh] pt-[var(--navbar-height)] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="h-[calc(100dvh-var(--navbar-height))] flex flex-col px-4 py-2 sm:p-6 lg:p-8">
        
        {/* First Section - Ticker Input and Main Charts */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 w-full max-w-[1920px] mx-auto rounded-2xl overflow-hidden
                     backdrop-blur-xl 
                     bg-gradient-to-b from-slate-900/80 via-slate-950/80 to-black/80
                     border border-white/[0.05]
                     shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]
                     after:absolute after:inset-0 
                     after:bg-[radial-gradient(circle_at_50%_-20%,rgba(129,140,248,0.05),transparent_70%)]
                     after:z-[-1]
                     relative"
        >
          <div className="h-full flex flex-col divide-y divide-white/[0.03]">
            {/* Header Section - Ticker Input */}
            <div className="p-6">
                <TickerInputForm onAddTickers={onAddTickers} />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:flex-row divide-white/5">
              {/* Left Column - Tickers List */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:w-72 p-6 max-h-[calc(100vh-16rem)] overflow-y-auto
                          custom-scrollbar
                          scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent
                          bg-gradient-to-b from-white/[0.03] to-transparent"
              >
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={items}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="pr-2 pb-6 space-y-2">
                      {items.map((ticker) => (
                        <SortablePriceDisplay
                          key={ticker}
                          id={ticker}
                          symbol={ticker}
                          onRemove={() => onRemoveTicker(ticker)}
                          onSelectSymbol={setSelectedSymbol}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
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
                    onClose={() => {}} 
                  />
                </motion.div>
              </motion.div>

              {/* Right Column - Stats & Info */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:w-80 p-6 overflow-y-auto
                          scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent
                          bg-gradient-to-b from-white/[0.02] to-transparent"
              >
                <div className="space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col gap-6"
                  >
                  
                  <StatCard
                  title="Market Overview"
                  icon={<MonetizationOn className="text-blue-400" />}
                  stats={[
                    { 
                      label: "Market Cap Rank", 
                      value: assetInfo?.MARKET_CAP_RANK || 'N/A',
                    
                    },
                    
                    { 
                      label: "Max Supply", 
                      value: assetInfo?.MAX_SUPPLY || 'N/A'
                    },
                    { 
                      label: "Circulating Supply", 
                      value: assetInfo?.CIRCULATING_SUPPLY || 'N/A'
                    },
                    {
                        label: "Genesis Date",
                        value: assetInfo?.GENESIS_DATE 
                          ? new Date(assetInfo.GENESIS_DATE).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'N/A'
                    }
                  ]}
                  isLoading={loading}
                />

                {/* Network Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
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
                  isLoading={loading}
                />
              </motion.div>
                  
                  
                    
                    
                    {/* Fear/Greed Gauge */}
                    <div className="relative rounded-xl overflow-hidden
                                  shadow-[0_0_10px_rgba(59,130,246,0.03)] 
                                  group hover:transform hover:scale-[1.02] transition-all duration-200
                                  before:absolute before:inset-0 
                                  before:bg-gradient-to-br before:from-slate-800/90 before:via-slate-800/80 before:to-slate-900/90 
                                  before:backdrop-blur-xl before:transition-opacity
                                  after:absolute after:inset-0 
                                  after:bg-gradient-to-br after:from-blue-500/5 after:via-cyan-500/5 after:to-teal-500/5 
                                  after:opacity-0 hover:after:opacity-100 
                                  after:transition-opacity">
                      <div className="relative z-10 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-gray-300 opacity-75 group-hover:opacity-100 transition-opacity">
                            <Insights className="text-blue-400" />
                          </span>
                          <h3 className="text-sm font-semibold text-gray-300
                                      bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
                            Fear / Greed Index
                          </h3>
                        </div>
                        <Gauge
                          value={65}
                          aria-label="Fear and Greed Index"
                          sx={{
                            width: '100%',
                            height: 150,
                            '& .MuiChartsGauge-mark': {
                              stroke: '#475569'
                            },
                            '& .MuiChartsGauge-markLabel': {
                              fill: '#94a3b8'
                            },
                            '& .MuiChartsGauge-valueText': {
                              fill: '#e2e8f0',
                              fontSize: '1.5rem',
                              fontWeight: 'bold'
                            },
                            '& .MuiChartsGauge-track': {
                              stroke: '#334155'
                            },
                            '& .MuiChartsGauge-progress': {
                              stroke: 65 >= 50 ? '#22c55e' : '#ef4444',
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

      {/* Second Section - Command Center Grid */}
      <div className="min-h-[calc(100dvh-var(--navbar-height))] px-4 py-2 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="w-full max-w-[1920px] mx-auto rounded-2xl overflow-hidden
                     backdrop-blur-xl 
                     bg-gradient-to-b from-slate-900/80 via-slate-950/80 to-black/80
                     border border-white/[0.05]
                     shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]
                     relative"
        >
          {/* Command Center Header */}
          <div className="p-6 border-b border-white/[0.05]">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Command Center
            </h2>
          </div>

          {/* Command Center Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Market Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <StatCard
                  title="Market Overview"
                  icon={<MonetizationOn className="text-blue-400" />}
                  stats={[
                    { 
                      label: "Market Cap Rank", 
                      value: assetInfo?.MARKET_CAP_RANK || 'N/A',
                    
                    },
                    { 
                      label: "Max Supply", 
                      value: assetInfo?.MAX_SUPPLY || 'N/A'
                    },
                    { 
                      label: "Circulating Supply", 
                      value: assetInfo?.CIRCULATING_SUPPLY || 'N/A'
                    },
                    {
                        label: "Genesis Date",
                        value: assetInfo?.GENESIS_DATE 
                          ? new Date(assetInfo.GENESIS_DATE).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'N/A'
                    }
                  ]}
                  isLoading={loading}
                />
              </motion.div>

              {/* Development Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <StatCard
                  title="Development Activity"
                  icon={<Speed className="text-blue-400" />}
                  stats={[
                    {
                      label: "Github Activity",
                      value: assetInfo?.GITHUB_PULL_REQUEST_CONTRIBUTORS || 'N/A',
                    
                    },
                    {
                      label: "Contributors", 
                      value: assetInfo?.GITHUB_PULL_REQUEST_CONTRIBUTORS || 'N/A'
                    },
                    {
                      label: "Open Issues",
                      value: assetInfo?.GITHUB_TOTAL_ISSUES || 'N/A',
                      
                    },
                    {
                        label: "Closed Issues",
                        value: assetInfo?.GITHUB_CLOSED_ISSUES || 'N/A',
                        
                      }
                  ]}
                  isLoading={loading}
                />
              </motion.div>

              

              {/* Market Sentiment */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};  

export default AdvancedDashboard;