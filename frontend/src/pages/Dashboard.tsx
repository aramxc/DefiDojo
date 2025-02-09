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
import { useFetchAssetInfo } from '../hooks/useAssetInfo';
import { useFetchMarketMetrics } from '../hooks/useMarketMetrics';
import { formatValue, formatPercentage, formatChange, formatTimestamp } from '../utils/formatters';
import { useExternalIds } from '../hooks/useExternalIds';
import { AssetInfo } from '@defidojo/shared-types';
import { Ticker } from '../hooks/useTickers';
import { DetailedMetricsPanel } from '../components/dashboard/DetailedMetricsPanel';

interface DashboardProps {
  selectedTickers: Ticker[];
  onAddTickers: (tickers: Ticker[]) => void;
  onRemoveTicker: (symbol: string) => void;
  defaultTicker?: string;
  getRealTimeData?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({
  selectedTickers,
  onAddTickers,
  onRemoveTicker,
  defaultTicker = 'BTC',
  getRealTimeData = true
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(defaultTicker);
  const [items, setItems] = useState(selectedTickers);
  
  // Fetch both coingeckoId and pythPriceFeedId when selectedSymbol changes
  const { 
    externalIds,
    loading: idLoading,
    error: idError 
  } = useExternalIds(selectedSymbol);
  
  // Only fetch asset info once we have a coingeckoId
  const { 
    assetInfo, 
    loading: assetLoading, 
    error: assetError 
  } = useFetchAssetInfo(
    externalIds.coingeckoId || '', 
    getRealTimeData
  );

  const { 
    metrics, 
    loading: metricsLoading,
    error: metricsError 
  } = useFetchMarketMetrics(
    selectedSymbol,
    externalIds.coingeckoId || undefined
  );

  useEffect(() => {
    if (!selectedSymbol) {
      setSelectedSymbol(defaultTicker);
    }
  }, [defaultTicker, selectedSymbol]);

  useEffect(() => {
    setItems(selectedTickers);
  }, [selectedTickers]);

  // Handle loading and error states
  if (idError) {
    console.error('External IDs Error:', idError);
  }

  if (assetError) {
    console.error('Asset Info Error:', assetError);
  }

  if (metricsError) {
    console.error('Metrics Error:', metricsError);
  }

  const statCards = [
    {
      title: "Market Overview",
      icon: <MonetizationOn />,
      infoTooltip: "Key market metrics and rankings",
      stats: [
        { 
          label: "Market Cap Rank", 
          value: `#${assetInfo?.marketData?.marketCapRank || 'N/A'}`,
          className: "text-blue-500 font-bold"
        },
        { 
          label: "Market Sentiment", 
          value: "",
          change: assetInfo?.sentimentVotesUpPercentage
        },
        { 
          label: "Total Supply", 
          value: formatValue(assetInfo?.marketData?.totalSupply, 'compact'),
          suffix: assetInfo?.symbol
        },
        { 
          label: "Circulating Supply", 
          value: formatValue(assetInfo?.marketData?.circulatingSupply, 'compact'),
          suffix: assetInfo?.symbol
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
          value: formatValue(assetInfo?.marketData?.ath?.usd, 'price'),
          change: assetInfo?.marketData?.athChangePercentage,
          
        },
        { 
          label: "All Time High Date", 
          value: formatTimestamp(Number(assetInfo?.marketData?.athDate?.usd || 0), 'MM/DD/YYYY', 'America/Denver'),
        },
        { 
          label: "All Time Low", 
          value: formatValue(assetInfo?.marketData?.atl?.usd, 'price'),
          change: assetInfo?.marketData?.atlChangePercentage,
         
        },
        { 
          label: "All Time Low Date", 
          value: formatTimestamp(Number(assetInfo?.marketData?.atlDate?.usd || 0), 'MM/DD/YYYY', 'America/Denver'),
        }
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
          value: formatValue(assetInfo?.developerData?.stars, 'number'),
          className: "text-yellow-500"
        },
        { 
          label: "Total Forks", 
          value: formatValue(assetInfo?.developerData?.forks, 'number')
        },
        { 
          label: "Active Contributors", 
          value: formatValue(assetInfo?.developerData?.pullRequestContributors, 'number'),
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
          value: formatPercentage((assetInfo?.developerData?.closedIssues || 0) / (assetInfo?.developerData?.totalIssues || 1) * 100),
          
        },
        { 
          label: "Total PRs Merged", 
          value: formatValue(assetInfo?.developerData?.pullRequestsMerged, 'compact')
        },
        { 
          label: "Active Subscribers", 
          value: formatValue(assetInfo?.developerData?.subscribers, 'compact')
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
          value: formatPercentage(assetInfo?.sentimentVotesUpPercentage),
          change: assetInfo?.sentimentVotesUpPercentage
        },
        { 
          label: "Categories", 
          value: `${assetInfo?.categories?.length || 0} Tags`
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
                    pythPriceFeedId={externalIds.pythPriceFeedId || ''}
                    coingeckoId={externalIds.coingeckoId || ''}
                    assetInfo={assetInfo as AssetInfo}
                    isLoading={idLoading || assetLoading}
                    marketMetrics={metrics}
                    error={assetError?.message || idError?.message}
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

      {/* Second Section - Detailed Metrics */}
      <DetailedMetricsPanel
        assetInfo={assetInfo}
        metrics={metrics}
        isLoading={idLoading || assetLoading || metricsLoading}
      />
    </div>
  );
};

export default Dashboard;