import React from 'react';
import { 
  MonetizationOn, 
  TrendingUp,
  ShowChart,
  GitHub,
  Code,
  Psychology,
} from '@mui/icons-material';
import { StatCard } from './cards/StatCard';
import { AssetInfo } from '@defidojo/shared-types';
import { MarketMetrics } from '@defidojo/shared-types';
import { formatValue, formatPercentage, formatTimestamp } from '../../utils/formatters';

interface DetailedMetricsPanelProps {
  assetInfo: AssetInfo | null;
  metrics: MarketMetrics | null;
  isLoading: boolean;
}

export const DetailedMetricsPanel: React.FC<DetailedMetricsPanelProps> = ({
  assetInfo,
  metrics,
  isLoading
}) => {
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
    <div className="min-h-[calc(100vh-var(--navbar-height))] w-[98%] mx-auto 
                    p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="w-full rounded-2xl overflow-hidden backdrop-blur-xl 
                   bg-gradient-to-b from-slate-900/80 via-slate-950/80 to-black/80
                   border border-slate-800/[0.25]
                   shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]">
        <div className="p-6 border-b border-white/[0.05]">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Asset Metrics
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
                isLoading={isLoading}
                className="backdrop-blur-xl bg-gradient-to-b from-slate-900/80 via-slate-950/80 to-black/80 
                          border border-white/[0.05] shadow-xl hover:shadow-2xl transition-all duration-300
                          hover:border-white/[0.08]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};