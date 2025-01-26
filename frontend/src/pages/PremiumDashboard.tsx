import React, { useState, useEffect } from 'react';
import TickerInputForm from '../components/dashboard/TickerInputForm';
import { PriceAnalytics } from '../components/dashboard/PriceAnalytics';
import { DetailedPriceCard } from '../components/dashboard/cards/DetailedPriceCard';
import { NewsFeed } from '../components/news/NewsFeed';
import { motion } from 'framer-motion';
import { 
  MonetizationOn, 
  TrendingUp,
  ShowChart,
  GitHub,
  Code,
  Psychology,
} from '@mui/icons-material';
import { StatCard } from '../components/dashboard/cards/StatCard';
import { useFetchAssetInfo } from '../hooks/useFetchAssetInfo';
import { useFetchMarketMetrics } from '../hooks/useFetchMarketMetrics';
import { formatValue, formatPercentage, formatChange, formatTimestamp } from '../utils/formatters';

interface AdvancedDashboardProps {
  selectedTickers: string[];
  onAddTickers: (tickers: string[]) => void;
  onRemoveTicker: (symbol: string) => void;
  defaultTicker?: string;
  getRealTimeData?: boolean;
}

const AdvancedDashboard: React.FC<AdvancedDashboardProps> = ({
  selectedTickers,
  onAddTickers,
  onRemoveTicker,
  defaultTicker = 'BTC',
  getRealTimeData = false
  
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(defaultTicker);
  const [items, setItems] = useState(selectedTickers);
  
  const { assetInfo, loading: assetLoading } = useFetchAssetInfo(selectedSymbol);
  const { metrics, loading: metricsLoading } = useFetchMarketMetrics(
    selectedSymbol,
    assetInfo?.COINGECKO_ID
  );

  console.log('Asset Info:', assetInfo);
  console.log('Metrics:', metrics);
  console.log('Loading States:', { assetLoading, metricsLoading });

  useEffect(() => {
    if (!selectedSymbol) {
      setSelectedSymbol(defaultTicker);
    }
  }, [defaultTicker, selectedSymbol]);

  useEffect(() => {
    setItems(selectedTickers);
  }, [selectedTickers]);

  // Define statCards here, before any conditional returns
  const statCards = [
    {
      title: "Market Overview",
      icon: <MonetizationOn />,
      infoTooltip: "Key market metrics and rankings",
      stats: [
        { 
          label: "Market Cap Rank", 
          value: `#${assetInfo?.MARKET_CAP_RANK || 'N/A'}`,
          className: "text-blue-500 font-bold"
        },
        { 
          label: "Market Sentiment", 
          value: formatPercentage(assetInfo?.SENTIMENT_VOTES_UP_PERCENTAGE),
          change: assetInfo?.SENTIMENT_VOTES_DOWN_PERCENTAGE
        },
        { 
          label: "Total Supply", 
          value: formatValue(assetInfo?.TOTAL_SUPPLY, 'compact'),
          suffix: assetInfo?.SYMBOL
        },
        { 
          label: "Circulating Supply", 
          value: formatValue(assetInfo?.CIRCULATING_SUPPLY, 'compact'),
          suffix: assetInfo?.SYMBOL
        }
      ]
    },
    {
      title: "ATH/ATL Statistics",
      icon: <ShowChart />,
      infoTooltip: "All Time High and All Time Low",
      stats: [
        { 
          label: "All Time High", 
          value: formatValue(assetInfo?.ATH, 'price'),
          change: -4.17,
          timestamp: assetInfo?.ATH_DATE
        },
        { 
          label: "All Time Low", 
          value: formatValue(assetInfo?.ATL, 'price'),
          change: formatChange(153636.21),
          timestamp: assetInfo?.ATL_DATE
        },
        
      ]
    },
    {
      title: "Volatility Metrics",
      icon: <TrendingUp />,
      infoTooltip: "Measures how much the price tends to change over time. Higher percentages mean more dramatic price swings. We look at price movements across different time windows (daily, weekly, monthly) to understand both short-term and long-term price stability",
      stats: [
        { 
          label: "Daily", 
          value: formatPercentage(metrics?.volatility?.daily|| 0),
        },
        { 
          label: "Weekly", 
          value: formatPercentage(metrics?.volatility?.weekly|| 0)
        },
        { 
          label: "Monthly", 
          value: formatPercentage(metrics?.volatility?.monthly|| 0)
        },
        { 
          label: "Standard Deviation", 
          value: formatPercentage(metrics?.volatility?.standardDeviation|| 0)
        }
      ]
    },
    {
      title: "Developer Activity",
      icon: <GitHub />,
      infoTooltip: "GitHub repository metrics",
      stats: [
        { 
          label: "GitHub Stars", 
          value: formatValue(assetInfo?.GITHUB_STARS, 'number'),
          className: "text-yellow-500"
        },
        { 
          label: "Total Forks", 
          value: formatValue(assetInfo?.GITHUB_FORKS, 'number')
        },
        { 
          label: "Active Contributors", 
          value: formatValue(assetInfo?.GITHUB_PULL_REQUEST_CONTRIBUTORS, 'number'),
          className: "text-green-500"
        }
      ]
    },
    {
      title: "Development Health",
      icon: <Code />,
      infoTooltip: "Project development metrics",
      stats: [
        { 
          label: "Issue Resolution Rate", 
          value: formatPercentage((assetInfo?.GITHUB_CLOSED_ISSUES || 0) / (assetInfo?.GITHUB_TOTAL_ISSUES || 1) * 100),
          change: assetInfo?.GITHUB_CLOSED_ISSUES
        },
        { 
          label: "Total PRs Merged", 
          value: formatValue(assetInfo?.GITHUB_PULL_REQUESTS_MERGED, 'compact')
        },
        { 
          label: "Active Subscribers", 
          value: formatValue(assetInfo?.GITHUB_SUBSCRIBERS, 'compact')
        }
      ]
    },
    {
      title: "Community Insights",
      icon: <Psychology />,
      infoTooltip: "Community engagement and sentiment",
      stats: [
        { 
          label: "Sentiment Score", 
          value: formatPercentage(assetInfo?.SENTIMENT_VOTES_UP_PERCENTAGE),
          change: assetInfo?.SENTIMENT_VOTES_UP_PERCENTAGE
        },
        { 
          label: "Categories", 
          value: `${assetInfo?.CATEGORIES?.length || 0} Tags`
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b md:w-full from-slate-950 via-slate-900 to-slate-950 pt-[var(--navbar-height)] overflow-x-hidden">
      {/* First Section - Main Analysis */}
      <div className="h-[calc(100vh-var(--navbar-height))]  w-[98%] mx-auto p-2 sm:p-4 md:p-6 lg:p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-full w-full rounded-2xl relative
                     backdrop-blur-xl 
                     bg-gradient-to-b from-slate-900/80 via-slate-950/80 to-black/80
                     border border-slate-800/[0.25]
                     shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]"
        >
          <div className="h-full flex flex-col">
            {/* Header Section - Ticker Input */}
            <div className="p-2 sm:p-3 lg:p-4 flex-none">
              <TickerInputForm 
                onSelectTicker={setSelectedSymbol}
                selectedTicker={selectedSymbol}
                allowMultipleSelections={false}
                defaultTicker={defaultTicker}
                key={defaultTicker}
              />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:flex-row min-h-0 h-[calc(100%-4rem)] w-full 
                           gap-2 sm:gap-3 md:gap-4 lg:gap-6 
                           p-2 sm:p-3 md:p-4 lg:p-6 
                           overflow-x-auto">
              {/* Left Column - Detailed Price Card */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full lg:w-[25%] min-w-[280px] h-[500px] lg:h-full flex-none"
              >
                <div className="h-full w-full">
                  <DetailedPriceCard
                    symbol={selectedSymbol}
                    assetInfo={assetInfo}
                    isLoading={assetLoading}
                    marketMetrics={metrics}
                  />
                </div>
              </motion.div>

              {/* Center Column - Main Charts */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full lg:w-[50%] min-w-[400px] h-[500px] lg:h-full"
              >
                <div className="h-full w-full">
                  <PriceAnalytics 
                    symbol={selectedSymbol} 
                    onSymbolChange={setSelectedSymbol}
                    onClose={() => {}} 
                  />
                </div>
              </motion.div>

              {/* Right Column - News Feed */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full lg:w-[25%] min-w-[280px] h-[500px] lg:h-full flex-none"
              >
                <div className="h-full w-full">
                  <NewsFeed 
                    symbol={selectedSymbol} 
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Command Center Section */}
      <div className="min-h-[calc(100vh-var(--navbar-height))] w-[98%] mx-auto 
                      p-2 sm:p-4 md:p-6 lg:p-8">
        <div className="w-full rounded-2xl overflow-hidden backdrop-blur-xl 
                     bg-gradient-to-b from-slate-900/80 via-slate-950/80 to-black/80
                     border border-slate-800/[0.25]
                     shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]">
          <div className="p-6 border-b border-white/[0.05]">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Command Center
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {statCards.map((card, index) => (
                <StatCard
                  key={index}
                  title={card.title}
                  icon={card.icon}
                  infoTooltip={card.infoTooltip}
                  stats={card.stats as any}
                  isLoading={assetLoading || metricsLoading}
                  className="backdrop-blur-xl bg-gradient-to-b from-slate-900/80 via-slate-950/80 to-black/80 
                            border border-white/[0.05] shadow-xl hover:shadow-2xl transition-all duration-300
                            hover:border-white/[0.08]"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedDashboard;