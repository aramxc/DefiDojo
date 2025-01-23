import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Schedule, Info, ShowChart, ArrowDropUp, ArrowDropDown, Description } from '@mui/icons-material';
import { formatCurrency, formatPercentage, formatValue, formatChange } from '../../../utils';
import { AssetInfo } from '@defidojo/shared-types';
import { Switch, CircularProgress, Chip } from '@mui/material';
import { Language, Twitter, Reddit, GitHub } from '@mui/icons-material';

import { useFetchLatestPrice } from '../../../hooks/useFetchLatestPrice';
import { Skeleton } from '@mui/material';

interface DetailedPriceCardProps {
  symbol: string;
  assetInfo: any;
  isLoading?: boolean;
  error?: string;
  priceChange?: number;
  marketMetrics?: any;
}

export const DetailedPriceCard: React.FC<DetailedPriceCardProps> = memo(({ 
  symbol, 
  assetInfo, 
  isLoading,
  error,
  priceChange,
  marketMetrics
}) => {
  const [isRealTime, setIsRealTime] = useState(false);
  const [timeSinceUpdate, setTimeSinceUpdate] = useState<Date>(new Date());
  const [initialLoad, setInitialLoad] = useState(true);
  
  const { 
    price: fetchedPrice, 
    loading: priceLoading,
    lastUpdateTime 
  } = useFetchLatestPrice(symbol, isRealTime);

  // Set initial load to false after first price fetch
  useEffect(() => {
    if (fetchedPrice !== null && initialLoad) {
      setInitialLoad(false);
    }
  }, [fetchedPrice]);

  // Only show loading on initial load
  const showLoading = initialLoad && priceLoading;

  // Format the last update time
  const getLastUpdateText = () => {
    const diff = timeSinceUpdate.getTime() - lastUpdateTime.getTime();
    
    if (diff < 1000) return 'Just now';
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`; // 60 seconds
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`; // 60 minutes
    return lastUpdateTime.toLocaleTimeString();
  };

  // Update the last update text
  useEffect(() => {
    if (!isRealTime) return;
    
    const interval = setInterval(() => {
      setTimeSinceUpdate(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [isRealTime]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full w-full rounded-xl overflow-hidden relative group 
                 before:absolute before:inset-0 
                 before:bg-gradient-to-br before:from-slate-800/90 before:via-slate-900/90 before:to-slate-950/90 
                 before:backdrop-blur-xl before:transition-opacity
                 after:absolute after:inset-0 
                 after:bg-gradient-to-br after:from-blue-500/5 after:via-cyan-500/5 after:to-teal-500/5 
                 after:opacity-0 hover:after:opacity-100 
                 after:transition-opacity
                 border border-white/[0.05]
                 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]"
    >
      <div className="relative z-10 p-6 h-full flex flex-col space-y-6">
        {/* Header with Asset Info and Real-time Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {assetInfo?.IMAGE && (
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-sm opacity-30"></div>
                <img 
                  src={assetInfo.IMAGE.LARGE} 
                  alt={symbol} 
                  className="relative w-10 h-10 rounded-full"
                />
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-gray-100">{symbol?.toUpperCase()}</h3>
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
                  #{assetInfo?.MARKET_CAP_RANK}
                </span>
              </div>
              <span className="text-sm text-gray-400">{assetInfo?.NAME}</span>
            </div>
          </div>
        
          
        </div>

        {/* Price Section with Real-time Updates */}
        <div className="space-y-4">
          <div className="font-bold flex items-baseline gap-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative w-fit"
            >
              <span className="absolute inset-0 w-[105%] bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 blur-xl opacity-10" />
              <AnimatePresence mode="wait">
                {showLoading ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center"
                  >
                    <CircularProgress size={30} className="text-blue-500" />
                  </motion.div>
                ) : (
                  <motion.span
                    key={fetchedPrice}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    transition={{ 
                      duration: 0.2,
                      ease: "easeOut"
                    }}
                    className="relative bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 
                              bg-clip-text text-transparent tracking-tight text-4xl"
                  >
                    {formatValue(fetchedPrice || assetInfo?.MARKET_DATA?.CURRENT_PRICE?.USD || 0, 'price')}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
            
            {/* 24h Price Change */}
            {assetInfo?.MARKET_DATA?.PRICE_CHANGE_PERCENTAGE_24H && (
              <div className={`flex items-center -space-x-1 text-sm ${
                assetInfo.MARKET_DATA.PRICE_CHANGE_PERCENTAGE_24H > 0 
                  ? 'text-green-400' 
                  : 'text-red-400'
              }`}>
                {assetInfo.MARKET_DATA.PRICE_CHANGE_PERCENTAGE_24H > 0 
                  ? <ArrowDropUp className="w-5 h-5" /> 
                  : <ArrowDropDown className="w-5 h-5" />
                }
                {formatPercentage(Math.abs(assetInfo?.MARKET_DATA?.PRICE_CHANGE_PERCENTAGE_24H))}
              </div>
            )}
          </div>

          {/* Real-time Toggle and Last Updated */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <Schedule className="w-4 h-4" />
              <span className="bg-gradient-to-r from-gray-400 to-gray-300 bg-clip-text text-transparent">
                {getLastUpdateText()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${
                isRealTime 
                  ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)] animate-pulse' 
                  : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
              }`} />
              <span>{isRealTime ? 'Real-time' : 'Live'}</span>
              <Switch
                checked={isRealTime}
                onChange={() => setIsRealTime(!isRealTime)}
                size="small"
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#10B981',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#10B981',
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-transparent my-6"></div>

        {/* Market Data Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Row 1 */}
          <div className="flex flex-col p-3">
            <span className="text-sm text-gray-400">Market Cap</span>
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-100">
                {formatValue(assetInfo?.MARKET_DATA?.MARKET_CAP?.USD, "marketCap")}
              </span>
              <div className={`flex items-center -space-x-1 text-sm ${
                assetInfo?.MARKET_DATA?.MARKET_CAP_CHANGE_PERCENTAGE_24H > 0 
                  ? 'text-green-400' 
                  : 'text-red-400'
              }`}>
                {assetInfo?.MARKET_DATA?.MARKET_CAP_CHANGE_PERCENTAGE_24H > 0 
                  ? <ArrowDropUp className="w-5 h-5" /> 
                  : <ArrowDropDown className="w-5 h-5" />
                }
                {formatPercentage(Math.abs(assetInfo?.MARKET_DATA?.MARKET_CAP_CHANGE_PERCENTAGE_24H))}
              </div>
            </div>
          </div>

          <div className="flex flex-col p-3">
            <span className="text-sm text-gray-400">24H Volume</span>
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-100">
                {formatValue(marketMetrics?.trends?.volume?.currentVolume, "volume")}
              </span>
              {marketMetrics?.trends?.volume?.change24h && (
                <div className={`flex items-center -space-x-1 text-sm ${
                  marketMetrics.trends.volume.change24h > 0 
                    ? 'text-green-400' 
                    : 'text-red-400'
                }`}>
                  {marketMetrics.trends.volume.change24h > 0 
                    ? <ArrowDropUp className="w-5 h-5" /> 
                    : <ArrowDropDown className="w-5 h-5" />
                  }
                  {formatPercentage(Math.abs(marketMetrics.trends.volume.change24h))}
                </div>
              )}
            </div>
          </div>

          {/* Row 2 with Supply Information */}
          <div className="flex flex-col p-3">
            <span className="text-sm text-gray-400">Circulating Supply</span>
            <span className="text-lg font-medium text-gray-100">
              {formatValue(assetInfo?.CIRCULATING_SUPPLY, "compact")}
            </span>
          </div>

          <div className="flex flex-col p-3">
            <span className="text-sm text-gray-400">Max Supply</span>
            <span className="text-lg font-medium text-gray-100">
              {assetInfo?.MAX_SUPPLY ? formatValue(assetInfo.MAX_SUPPLY, "compact") : '∞'}
            </span>
          </div>
        </div>

        {/* Single Supply Progress Bar spanning both columns */}
        <div className="px-3 -mt-2">
          <div className="flex justify-between items-center mb-1 text-xs text-gray-400">
            <div className="flex flex-col items-start">
              <span className="text-gray-500 text-[10px]">Circulating</span>
              <span>{formatValue(assetInfo?.CIRCULATING_SUPPLY, "compact")}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-gray-500 text-[10px]">Max Supply</span>
              <span>{assetInfo?.MAX_SUPPLY ? formatValue(assetInfo.MAX_SUPPLY, "compact") : '∞'}</span>
            </div>
          </div>
          <div className="w-full bg-gray-800/50 rounded-full h-1.5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#38bdf8] via-[#22d3ee] to-[#38bdf8] opacity-10" />
            <div 
              className="h-full bg-gradient-to-r from-[#38bdf8] to-[#22d3ee] rounded-full transition-all duration-300"
              style={{ 
                width: `${assetInfo?.MAX_SUPPLY 
                  ? (assetInfo.CIRCULATING_SUPPLY / assetInfo.MAX_SUPPLY) * 100
                  : 100}%` 
              }}
            />
          </div>
        </div>

        {/* Trading Range */}
        <div className="space-y-2 px-3">
          <span className="text-sm text-gray-400">24h Trading Range</span>
          <div className="relative">
            <div className="flex justify-between text-xs text-gray-400">
              <span>{formatValue(assetInfo?.MARKET_DATA?.LOW_24H?.USD, "price")}</span>
              <span>{formatValue(assetInfo?.MARKET_DATA?.HIGH_24H?.USD, "price")}</span>
            </div>
            <div className="w-full bg-gray-800/50 h-1.5 mt-1 rounded-full relative">
              <div className="absolute rounded-full inset-0 bg-gradient-to-r from-[#38bdf8] via-[#22d3ee] to-[#38bdf8] opacity-10" />
              <div 
                className="absolute w-2 h-3 bg-gradient-to-r from-[#38bdf8] to-[#22d3ee] -mt-0.5 group/indicator cursor-pointer"
                style={{ 
                  left: `${((assetInfo?.MARKET_DATA?.CURRENT_PRICE?.USD - assetInfo?.MARKET_DATA?.LOW_24H?.USD) / 
                    (assetInfo?.MARKET_DATA?.HIGH_24H?.USD - assetInfo?.MARKET_DATA?.LOW_24H?.USD)) * 100}%`,
                  transform: 'translateX(-50%)',
                  filter: 'drop-shadow(0 0 4px rgba(34, 211, 238, 0.3))'
                }}
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 rounded-md 
                              text-xs text-gray-100 whitespace-nowrap opacity-0 group-hover/indicator:opacity-100 
                              transition-opacity duration-200 border border-gray-700">
                  {formatValue(assetInfo?.MARKET_DATA?.CURRENT_PRICE?.USD, "price")}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r  from-blue-500/10 via-cyan-500/10 to-transparent my-6"></div>

        {/* Metrics and Social Section */}
        <div className="space-y-4  mt-4">
          {/* Social Links Section */}
          <div className="flex justify-center">
            <div className="flex flex-wrap gap-2 justify-center">
              {assetInfo?.LINKS?.HOMEPAGE[0] && (
                <Chip
                  component="a"
                  href={assetInfo.LINKS.HOMEPAGE[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  label="Website"
                  icon={<Language className="w-4 h-4" />}
                  className="bg-gray-700/50 hover:bg-gray-700 transition-colors text-gray-300 text-sm"
                  clickable
                  size="small"
                />
              )}
              {assetInfo?.LINKS?.TWITTER_SCREEN_NAME && (
                <Chip
                  component="a"
                  href={`https://twitter.com/${assetInfo.LINKS.TWITTER_SCREEN_NAME}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  label="Twitter"
                  icon={<Twitter className="w-4 h-4" />}
                  className="bg-gray-700/50 hover:bg-gray-700 transition-colors text-gray-300 text-sm"
                  clickable
                  size="small"
                />
              )}
              {assetInfo?.LINKS?.SUBREDDIT_URL && (
                <Chip
                  component="a"
                  href={assetInfo.LINKS.SUBREDDIT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  label="Reddit"
                  icon={<Reddit className="w-4 h-4" />}
                  className="bg-gray-700/50 hover:bg-gray-700 transition-colors text-gray-300 text-sm"
                  clickable
                  size="small"
                />
              )}
              {assetInfo?.LINKS?.WHITEPAPER && (
                <Chip
                  component="a"
                  href={assetInfo.LINKS.WHITEPAPER}
                  target="_blank"
                  rel="noopener noreferrer"
                  label="Whitepaper"
                  icon={<Description className="w-4 h-4" />}
                  className="bg-gray-700/50 hover:bg-gray-700 transition-colors text-gray-300 text-sm"
                  clickable
                  size="small"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default DetailedPriceCard;