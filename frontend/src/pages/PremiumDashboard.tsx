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
  MonetizationOn, Insights, DataUsage
} from '@mui/icons-material';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useFetchAssetInfo } from '../hooks/useFetchAssetInfo';

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
  const { stats, loading, error } = useFetchAssetInfo(selectedSymbol);

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
                <div className="space-y-6 hover:space-y-7 transition-all duration-300">
                  <StatCard
                    title="Market Overview"
                    stats={[
                      {
                        label: "Market Cap Rank",
                        value: stats?.marketOverview.marketCap || 'N/A',
                        change: stats?.marketOverview.change
                      },
                      {
                        label: "Circulating Supply",
                        value: stats?.marketOverview.volume || 'N/A'
                      },
                      {
                        label: "Max Supply",
                        value: stats?.marketOverview.supply || 'N/A'
                      }
                    ]}
                    isLoading={loading}
                  />
                  
                  <StatCard
                    title="Network Activity"
                    stats={[
                      {
                        label: "Github Activity",
                        value: stats?.networkActivity.githubActivity || 'N/A',
                        change: stats?.networkActivity.change
                      },
                      {
                        label: "Contributors",
                        value: stats?.networkActivity.contributors || 'N/A'
                      }
                    ]}
                    isLoading={loading}
                  />
                  
                  <StatCard
                    title="Development Metrics"
                    stats={[
                      {
                        label: "Github Forks",
                        value: stats?.developmentMetrics.forks || 'N/A',
                        change: stats?.developmentMetrics.change
                      },
                      {
                        label: "Github Stars",
                        value: stats?.developmentMetrics.stars || 'N/A'
                      }
                    ]}
                    isLoading={loading}
                  />
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
                     after:absolute after:inset-0 
                     after:bg-[radial-gradient(circle_at_50%_-20%,rgba(129,140,248,0.05),transparent_70%)]
                     after:z-[-1]
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
              {/* Market Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <StatCard
                  title="Market Overview"
                  stats={[
                    { 
                      label: "Market Cap Rank", 
                      value: stats?.marketOverview.marketCap || 'N/A',
                      change: stats?.marketOverview.change 
                    },
                    { 
                      label: "Circulating Supply", 
                      value: stats?.marketOverview.volume || 'N/A'
                    },
                    { 
                      label: "Max Supply", 
                      value: stats?.marketOverview.supply || 'N/A'
                    }
                  ]}
                  isLoading={loading}
                />
              </motion.div>

              {/* Trading Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card className="bg-slate-900/50 border border-white/5 backdrop-blur-xl">
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-gray-200 font-semibold">Development Activity</h3>
                      <Speed className="text-blue-400" />
                    </div>
                    <div className="space-y-4">
                      {/* Github Activity Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Github Activity</span>
                          <span className="text-gray-200">
                            {stats?.networkActivity.githubActivity || 'N/A'}
                          </span>
                        </div>
                        <LinearProgress 
                          variant="determinate" 
                          value={stats?.networkActivity.change || 0} 
                          className="h-1.5 rounded-full bg-slate-700"
                          sx={{
                            '& .MuiLinearProgress-bar': {
                              background: 'linear-gradient(to right, #3b82f6, #06b6d4)'
                            }
                          }}
                        />
                      </div>
                      
                      {/* Contributors Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Contributors</span>
                          <span className="text-gray-200">
                            {stats?.developmentMetrics.change || 0}
                          </span>
                        </div>
                        <LinearProgress 
                          variant="determinate" 
                          value={stats?.developmentMetrics.change || 0} 
                          className="h-1.5 rounded-full bg-slate-700"
                          sx={{
                            '& .MuiLinearProgress-bar': {
                              background: 'linear-gradient(to right, #3b82f6, #06b6d4)'
                            }
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Alert Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card className="bg-slate-900/50 border border-white/5 backdrop-blur-xl">
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-gray-200 font-semibold">Asset Info</h3>
                      <Notifications className="text-blue-400" />
                    </div>
                    <div className="space-y-3">
                      {error ? (
                        <Alert 
                          severity="error"
                          className="bg-red-400/10 border border-red-400/20"
                        >
                          <AlertTitle>Error Loading Data</AlertTitle>
                          {error}
                        </Alert>
                      ) : loading ? (
                        <Alert 
                          severity="info"
                          className="bg-blue-400/10 border border-blue-400/20"
                        >
                          <AlertTitle>Loading</AlertTitle>
                          Fetching asset information...
                        </Alert>
                      ) : (
                        <>
                          <Alert 
                            severity="info"
                            className="bg-blue-400/10 border border-blue-400/20"
                          >
                            <AlertTitle>Market Cap Rank</AlertTitle>
                            {stats?.marketOverview.marketCap || 'N/A'}
                          </Alert>
                          <Alert 
                            severity="warning"
                            className="bg-amber-400/10 border border-amber-400/20"
                          >
                            <AlertTitle>Development Activity</AlertTitle>
                            {`${stats?.networkActivity.githubActivity || 'N/A'} recent commits`}
                          </Alert>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Events Timeline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="col-span-2"
              >
                <Card className="bg-slate-900/50 border border-white/5 backdrop-blur-xl h-full">
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-gray-200 font-semibold">Asset Details</h3>
                      <TimelineIcon className="text-blue-400" />
                    </div>
                    <div className="space-y-4">
                      {loading ? (
                        <LinearProgress />
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm text-gray-400">Github Stars</p>
                            <p className="text-lg text-gray-200">
                              {stats?.developmentMetrics.stars || 'N/A'}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-400">Pull Requests</p>
                            <p className="text-lg text-gray-200">
                              {stats?.developmentMetrics.pullRequests || 'N/A'}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-400">Forks</p>
                            <p className="text-lg text-gray-200">
                              {stats?.developmentMetrics.forks || 'N/A'}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-400">Contributors</p>
                            <p className="text-lg text-gray-200">
                              {stats?.networkActivity.contributors || 'N/A'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};  

export default AdvancedDashboard;