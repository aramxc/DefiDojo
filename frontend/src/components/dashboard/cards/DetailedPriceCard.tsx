import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Schedule, ArrowDropUp, ArrowDropDown, Description, Language, Twitter, Reddit, GitHub } from '@mui/icons-material';
import { formatPercentage, formatValue } from '../../../utils';
import { AssetInfo } from '@defidojo/shared-types';
import { Switch, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { useLivePrice } from '../../../hooks/useLivePrice';

interface DetailedPriceCardProps {
  symbol: string;
  pythPriceFeedId: string;
  coingeckoId: string;  
  assetInfo: AssetInfo;
  isLoading?: boolean;
  error?: string;
  priceChange?: number;
  marketMetrics?: any;
}

export const DetailedPriceCard: React.FC<DetailedPriceCardProps> = memo(({ 
  symbol, 
  assetInfo, 
  marketMetrics,
  pythPriceFeedId,
}) => {
  const [isRealTime, setIsRealTime] = useState(false);
  const [timeSinceUpdate, setTimeSinceUpdate] = useState<Date>(new Date());
  const [initialLoad, setInitialLoad] = useState(true);
  
  const { 
    price: fetchedPrice, 
    loading: priceLoading,
    lastUpdateTime 
  } = useLivePrice(symbol, isRealTime, pythPriceFeedId);

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

  const getLow24h = (currentPrice: number | null, marketMetricsLow: number | null, assetInfoLow: number | null): number => {
    const validPrices = [
      currentPrice,
      marketMetricsLow,
      assetInfoLow
    ].filter((price): price is number => price !== null && !isNaN(price));
  
    return validPrices.length > 0 ? Math.min(...validPrices) : 0;
  };
  
  const getHigh24h = (currentPrice: number | null, marketMetricsHigh: number | null, assetInfoHigh: number | null): number => {
    const validPrices = [
      currentPrice,
      marketMetricsHigh,
      assetInfoHigh
    ].filter((price): price is number => price !== null && !isNaN(price));
  
    return validPrices.length > 0 ? Math.max(...validPrices) : 0;
  };

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
      <div className="relative z-10 p-4 md:p-6 h-full flex flex-col space-y-3 md:space-y-4
                      overflow-x-hidden custom-scrollbar 
                      md:overflow-y-auto lg:overflow-y-none">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 min-h-[60px]">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex-shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-sm opacity-30" />
              {assetInfo?.image && (
                <img 
                  src={assetInfo.image.large} 
                  alt={symbol} 
                  className="relative w-10 h-10 rounded-full"
                />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-gray-100">{symbol?.toUpperCase() || ''}</h3>
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
                  #{assetInfo?.marketData?.marketCapRank || '-'}
                </span>
              </div>
              <span className="text-sm text-gray-400">{assetInfo?.name || ''}</span>
            </div>
          </div>
        </div>

        {/* Price Section */}
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-baseline justify-between">
            {/* Price Container */}
            <div className="w-[180px]"> {/* Fixed width container */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 blur-xl opacity-10" />
                <AnimatePresence mode="wait">
                  {showLoading ? (
                    <motion.div
                      key="loader"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center h-[48px] justify-start" // Fixed height
                    >
                      <CircularProgress size={30} className="text-blue-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key={fetchedPrice}
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 1 }}
                      className="h-[48px] flex items-center" // Fixed height container
                    >
                      <span className="relative bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 
                                     bg-clip-text text-transparent tracking-tight font-bold text-4xl
                                     whitespace-nowrap"> {/* Added whitespace-nowrap */}
                        {formatValue(fetchedPrice || assetInfo?.marketData?.currentPrice?.usd || 0, "price")}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
            
            {/* Price Change - Fixed width */}
            <div className="w-24 flex justify-end"> {/* Fixed width and right alignment */}
              {assetInfo?.marketData?.priceChangePercentage24h && (
                <div className={`flex items-center text-sm ${
                  assetInfo.marketData.priceChangePercentage24h > 0 
                    ? 'text-green-400' 
                    : 'text-red-400'
                }`}>
                  {assetInfo.marketData.priceChangePercentage24h > 0 
                    ? <ArrowDropUp className="w-5 h-5" /> 
                    : <ArrowDropDown className="w-5 h-5" />
                  }
                  {formatPercentage(Math.abs(assetInfo?.marketData?.priceChangePercentage24h))}
                </div>
              )}
            </div>
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
                onChange={(e) => {
                  console.log('Switch toggled:', e.target.checked);
                  setIsRealTime(e.target.checked);
                }}
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

        {/* Market Data Grid - Reduced gap */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 min-h-[160px]">
          {/* Market Cap */}
          <div className="flex flex-col p-2 min-h-[64px]">
            <span className="text-sm text-gray-400">Market Cap</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-sm text-gray-100">
                {formatValue(assetInfo?.marketData?.marketCap?.usd, "marketCap") || '-'}
              </span>
              {assetInfo?.marketData?.marketCapChangePercentage24h && (
                <div className={`flex items-center text-sm ${
                  assetInfo.marketData.marketCapChangePercentage24h > 0 
                    ? 'text-green-400' 
                    : 'text-red-400'
                }`}>
                  {assetInfo.marketData.marketCapChangePercentage24h > 0 
                    ? <ArrowDropUp className="w-5 h-5" /> 
                    : <ArrowDropDown className="w-5 h-5" />
                  }
                  {formatPercentage(Math.abs(assetInfo?.marketData?.marketCapChangePercentage24h))}
                </div>
              )}
            </div>
          </div>

          {/* Volume */}
          <div className="flex flex-col p-2 min-h-[64px]">
            <span className="text-sm text-gray-400">24H Volume</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-sm text-gray-100">
                {formatValue(marketMetrics?.trends?.volume?.currentVolume, "volume") || '-'}
              </span>
              {marketMetrics?.trends?.volume?.change24h && (
                <div className={`flex items-center text-sm ${
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

          {/* Supply Information */}
          <div className="flex flex-col p-2 min-h-[64px]">
            <span className="text-sm text-gray-400">Circulating Supply</span>
            <div className="flex justify-between items-center mt-0.5"> {/* Added small top margin */}
              <span className="text-sm font-sm text-gray-100">
                {formatValue(assetInfo?.marketData?.circulatingSupply, "compact") || '-'}
              </span>
            </div>
          </div>

          <div className="flex flex-col p-2 min-h-[64px]">
            <span className="text-sm text-gray-400">Max Supply</span>
            <div className="flex justify-between items-center mt-0.5"> {/* Added small top margin */}
              <span className="text-sm font-sm text-gray-100">
                {assetInfo?.marketData?.maxSupply ? formatValue(assetInfo.marketData.maxSupply, "compact") : '∞'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Divider - Adjusted margins */}
        <div className="h-px w-full z-20 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-transparent 
                        my-2 md:my-3 mx-auto max-w-[95%] md:max-w-full border-b border-white/[0.05]"></div>

        {/* Single Supply Progress Bar spanning both columns */}
        <div className="px-3 -mt-2">
          <div className="flex justify-between items-center mb-1 text-xs text-gray-400">
            <div className="flex flex-col items-start">
              <span className="text-gray-500 text-[10px]">Circulating</span>
              <span>{formatValue(assetInfo?.marketData?.circulatingSupply, "compact") || '-'}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-gray-500 text-[10px]">Max Supply</span>
              <span>{assetInfo?.marketData?.maxSupply ? formatValue(assetInfo.marketData.maxSupply, "compact") : '∞'}</span>
            </div>
          </div>
          <div className="w-full bg-gray-800/50 rounded-full h-1.5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#38bdf8] via-[#22d3ee] to-[#38bdf8] opacity-10" />
            <div 
              className="h-full bg-gradient-to-r from-[#38bdf8] to-[#22d3ee] rounded-full transition-all duration-300"
              style={{ 
                width: `${assetInfo?.marketData?.maxSupply 
                  ? (assetInfo.marketData.circulatingSupply / assetInfo.marketData.maxSupply) * 100
                  : 100}%` 
              }}
            />
          </div>
        </div>

        {/* Trading Range */}
        <div className="space-y-2 px-2 md:px-3 min-h-[80px]">
          <span className="text-sm text-gray-400">24h Trading Range</span>
          <div className="relative">
            <div className="flex justify-between text-xs text-gray-400">
              <span>{formatValue(getLow24h(
                fetchedPrice || assetInfo?.marketData?.currentPrice?.usd,
                marketMetrics?.trends?.price?.low24h,
                assetInfo?.marketData?.low24h?.usd
              ), "price") || '-'}</span>
              <span>{formatValue(getHigh24h(
                fetchedPrice || assetInfo?.marketData?.currentPrice?.usd,
                marketMetrics?.trends?.price?.high24h,
                assetInfo?.marketData?.high24h?.usd
              ), "price") || '-'}</span>
            </div>
            {(() => {
              const currentPrice = fetchedPrice || assetInfo?.marketData?.currentPrice?.usd;
              const lowPrice = getLow24h(
                currentPrice,
                marketMetrics?.trends?.price?.low24h,
                assetInfo?.marketData?.low24h?.usd
              );
              const highPrice = getHigh24h(
                currentPrice,
                marketMetrics?.trends?.price?.high24h,
                assetInfo?.marketData?.high24h?.usd
              );
              
              // Calculate position percentage
              const position = Math.min(Math.max(
                ((currentPrice - lowPrice) / (highPrice - lowPrice)) * 100,
                0
              ), 100);

              return (
                <div className="w-full bg-gray-800/50 h-1.5 mt-1 rounded-full relative">
                  <div className="absolute rounded-full inset-0 bg-gradient-to-r from-[#38bdf8] via-[#22d3ee] to-[#38bdf8] opacity-10" />
                  {!isNaN(position) && isFinite(position) && (
                    <div        
                      className="absolute w-2 h-3 bg-gradient-to-r from-[#38bdf8] to-[#22d3ee] -mt-0.5 group/indicator cursor-pointer"
                      style={{ 
                        left: `${position}%`,
                        transform: 'translateX(-50%)',
                        filter: 'drop-shadow(0 0 4px rgba(34, 211, 238, 0.3))'
                      }}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 rounded-md 
                                    text-xs text-gray-100 whitespace-nowrap opacity-0 group-hover/indicator:opacity-100 
                                    transition-opacity duration-200 border border-gray-700">
                        {formatValue(currentPrice, "price") || '-'}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Main Divider - Adjusted margins */}
        <div className="h-px w-full z-20 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-transparent 
                        my-2 md:my-3 mx-auto max-w-[95%] md:max-w-full border-b border-white/[0.05]"></div>

        {/* Social Links Section */}
        <div className="flex flex-col space-y-4 w-full px-2 md:px-3 lg:px-4">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {assetInfo?.links?.homepage?.[0] && (
              <Tooltip title="Website" arrow>
                <IconButton
                  href={assetInfo.links.homepage[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  className="bg-slate-800/50 text-gray-400 
                           hover:text-blue-400 hover:bg-slate-700/50
                           lg:!p-3"
                >
                  <Language className="w-4 h-4 lg:w-5 lg:h-5" />
                </IconButton>
              </Tooltip>
            )}
            {assetInfo?.links?.whitepaper && (
              <Tooltip title="Whitepaper" arrow>
                <IconButton
                  href={assetInfo.links.whitepaper}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  className="bg-slate-800/50 text-gray-400 
                           hover:text-blue-400 hover:bg-slate-700/50
                           lg:!p-3"
                >
                  <Description className="w-4 h-4 lg:w-5 lg:h-5" />
                </IconButton>
              </Tooltip>
            )}
            {assetInfo?.links?.reposUrl?.github?.[0] && (
              <Tooltip title="GitHub" arrow>
                <IconButton
                  href={assetInfo.links.reposUrl.github[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  className="bg-slate-800/50 text-gray-400 
                           hover:text-blue-400 hover:bg-slate-700/50
                           lg:!p-3"
                >
                  <GitHub className="w-4 h-4 lg:w-5 lg:h-5" />
                </IconButton>
              </Tooltip>
            )}
            {assetInfo?.links?.twitterScreenName && (
              <Tooltip title="Twitter" arrow>
                <IconButton
                  href={`https://twitter.com/${assetInfo.links.twitterScreenName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  className="bg-slate-800/50 text-gray-400 
                           hover:text-blue-400 hover:bg-slate-700/50
                           lg:!p-3"
                >
                  <Twitter className="w-4 h-4 lg:w-5 lg:h-5" />
                </IconButton>
              </Tooltip>
            )}
            {assetInfo?.links?.subredditUrl && (
              <Tooltip title="Reddit" arrow>
                <IconButton
                  href={assetInfo.links.subredditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  className="bg-slate-800/50 text-gray-400 
                           hover:text-blue-400 hover:bg-slate-700/50
                           lg:!p-3"
                >
                  <Reddit className="w-4 h-4 lg:w-5 lg:h-5" />
                </IconButton>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default DetailedPriceCard;