import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Schedule, Info } from '@mui/icons-material';
import { formatCurrency, formatPercentage, formatValue } from '../../../utils';
import { AssetInfo } from '@defidojo/shared-types';
import { Switch } from '@mui/material';
import { priceService } from '../../../services/api/price.service';
import { useFetchLatestPrice } from '../../../hooks/useFetchLatestPrice';
import { Skeleton } from '@mui/material';

interface DetailedPriceCardProps {
  symbol: string;
  assetInfo: any;
  price: number | undefined;
  priceChange24h: number | undefined;
  volume24h: number | undefined;
  marketCap: any;
  marketCapRank: any;
  high24h: any;
  low24h: any;
  isLoading: boolean;
  getRealTimeData: boolean;
  // Add any other props that are being passed
}

export const DetailedPriceCard: React.FC<DetailedPriceCardProps> = ({
  symbol,
  assetInfo,
  price,
  priceChange24h,
  volume24h,
  marketCap,
  marketCapRank,
  high24h,
  low24h,
  isLoading,
  getRealTimeData
}) => {
  const [isRealTime, setIsRealTime] = useState(false);
  const [timeSinceUpdate, setTimeSinceUpdate] = useState<Date>(new Date());
  
  const { 
    price: fetchedPrice, 
    loading: priceLoading,
    lastUpdateTime 
  } = useFetchLatestPrice(symbol, isRealTime);

  const loading = isLoading || priceLoading;

  // Format the last update time
  const getLastUpdateText = () => {
    const diff = timeSinceUpdate.getTime() - lastUpdateTime.getTime();
    
    if (diff < 1000) return 'Just now';
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
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
                 before:bg-gradient-to-br before:from-slate-800/90 before:via-slate-800/80 before:to-slate-900/90 
                 before:backdrop-blur-xl before:transition-opacity
                 after:absolute after:inset-0 
                 after:bg-gradient-to-br after:from-blue-500/5 after:via-cyan-500/5 after:to-teal-500/5 
                 after:opacity-0 hover:after:opacity-100 
                 after:transition-opacity
                 border border-white/[0.05]
                 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]"
    >
      {/* Content Container */}
      <div className=" relative z-10 p-6 h-full flex flex-col ">
        {/* Header with Asset Info */}
        <div className="flex items-center gap-3 mb-6">
          {assetInfo?.IMAGE?.THUMB && (
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-sm opacity-30"></div>
              <img 
                src={assetInfo.IMAGE.THUMB} 
                alt={assetInfo?.SYMBOL} 
                className="relative w-10 h-10 rounded-full"
              />
            </div>
            
          )}
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-gray-100">{assetInfo?.SYMBOL.toUpperCase()}</h3>
            <span className="text-sm text-gray-400">{assetInfo?.NAME}</span>
          </div>
        </div>

        {/* Price Section with Real-time Toggle */}
        <div className="space-y-4 mb-6">
          {isLoading ? (
            <div className="animate-pulse bg-gray-700/50 h-10 w-32 rounded" />
          ) : (
            <div className="font-bold flex items-baseline gap-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-fit"
              >
                <span className="absolute inset-0 w-[105%] bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 blur-xl opacity-10" />
                <span className="relative bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 
                              bg-clip-text text-transparent tracking-tight text-4xl">
                  {formatCurrency(fetchedPrice)}
                </span>
              </motion.div>
              
              {/* Price Change Indicator */}
              {priceChange24h && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                             transition-colors duration-300
                             ${priceChange24h > 0 ? 'text-green-400 ' : 'text-red-400 '}`}
                >
                  {priceChange24h > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="font-medium">{formatPercentage(priceChange24h)}</span>
                </motion.div>
              )}
            </div>
          )}
          
          {/* Real-time Toggle - Only show if getRealTimeData is true */}
          {(
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  isRealTime 
                    ? 'bg-green-400 shadow-[0_0_4px_rgba(74,222,128,0.3)] animate-pulse' 
                    : 'bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.3)]'
                }`} />
                <span className="text-xs text-gray-400">
                  {isRealTime ? 'Real-time' : 'Live Price'}
                </span>
                <Switch
                  checked={isRealTime}
                  onChange={() => setIsRealTime(!isRealTime)}
                  size="small"
                  className="!ml-2"
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
          )}

          
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-transparent mb-6"></div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {[
            { 
              label: "24h Volume", 
              value: formatValue(volume24h, 'volume') 
            },
            { 
              label: "Market Cap", 
              value: formatValue(marketCap, 'marketCap') 
            },
            { 
              label: "24h High", 
              value: formatValue(high24h, 'price') 
            },
            { 
              label: "24h Low", 
              value: formatValue(low24h, 'price') 
            }
          ].map((stat, index) => (
            <div key={index} className="group/stat">
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className="font-medium bg-gradient-to-r from-gray-200 to-gray-100 bg-clip-text text-transparent
                           group-hover/stat:from-blue-200 group-hover/stat:to-cyan-200 transition-all duration-300">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Asset Details */}
        {assetInfo && (
          <div className="grid grid-cols-2 gap-6 mb-6">
            {assetInfo.GENESIS_DATE && (
              <div className="group/detail">
                <p className="text-gray-400 text-sm mb-1">Genesis Date</p>
                <p className="bg-gradient-to-r from-gray-200 to-gray-100 bg-clip-text text-transparent
                             group-hover/detail:from-blue-200 group-hover/detail:to-cyan-200 transition-all duration-300">
                  {new Date(assetInfo.GENESIS_DATE).toLocaleDateString()}
                </p>
              </div>
            )}
            {assetInfo.HASHING_ALGORITHM && (
              <div className="group/detail">
                <p className="text-gray-400 text-sm mb-1">Hash Algorithm</p>
                <p className="bg-gradient-to-r from-gray-200 to-gray-100 bg-clip-text text-transparent
                             group-hover/detail:from-blue-200 group-hover/detail:to-cyan-200 transition-all duration-300">
                  {assetInfo.HASHING_ALGORITHM}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Updated Last Updated Section */}
        <div className="mt-auto flex items-center justify-between text-gray-400/80 text-sm">
          <div className="flex items-center gap-2">
            <Schedule className="w-4 h-4" />
            <span className="bg-gradient-to-r from-gray-400 to-gray-300 bg-clip-text text-transparent">
              {getLastUpdateText()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DetailedPriceCard;