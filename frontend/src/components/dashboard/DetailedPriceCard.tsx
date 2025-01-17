import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Schedule, Info } from '@mui/icons-material';
import { formatCurrency, formatPercentage } from '../../utils';
import { AssetInfo } from '@defidojo/shared-types';

interface DetailedPriceCardProps {
  symbol: string;
  assetInfo?: AssetInfo | null;
  price?: number;
  priceChange24h?: number;
  volume24h?: number;
  marketCap?: number;
  high24h?: number;
  low24h?: number;
  lastUpdated?: string;
  isLoading?: boolean;
}

export const DetailedPriceCard: React.FC<DetailedPriceCardProps> = ({
  assetInfo,
  symbol,
  price,
  priceChange24h,
  volume24h,
  marketCap,
  high24h,
  low24h,
  lastUpdated,
  isLoading
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full w-full rounded-xl overflow-hidden relative group
                 bg-gradient-to-b from-slate-800/50 via-slate-900/50 to-slate-900/50
                 border border-white/[0.05]
                 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]
                 backdrop-blur-xl
                 hover:shadow-[0_0_24px_-4px_rgba(59,130,246,0.2)]
                 transition-all duration-300"
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content Container */}
      <div className="relative z-10 p-6 h-full flex flex-col">
        <div className="flex items-center space-x-2">
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 
                           bg-clip-text text-transparent">
              {assetInfo?.NAME}
            </span>
        </div>
        {/* Header with Price */}
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 
                           bg-clip-text text-transparent">
              {formatCurrency(price)}
            </span>
            <span className={`flex items-center ${priceChange24h && priceChange24h > 0 
              ? 'text-green-400' 
              : 'text-red-400'}`}>
              {priceChange24h && priceChange24h > 0 ? <TrendingUp /> : <TrendingDown />}
              {formatPercentage(priceChange24h)}
            </span>
          </div>
        </div>

        {/* Horizontal Rule */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-500/20 to-transparent mb-6" />

        {/* Asset Info Section */}
        {assetInfo && (
          <div className="space-y-6">
            {assetInfo.GENESIS_DATE && (
              <div>
                <p className="text-gray-400 text-sm mb-1">Genesis Date</p>
                <p className="text-white">{new Date(assetInfo.GENESIS_DATE).toLocaleDateString()}</p>
              </div>
            )}
            
            

            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {assetInfo.HASHING_ALGORITHM && (
                <div>
                  <p className="text-gray-400 text-sm mb-1">Hash Algorithm</p>
                  <p className="text-blue-300">{assetInfo.HASHING_ALGORITHM}</p>
                </div>
              )}
              {assetInfo.BLOCK_TIME_IN_MINUTES && (
                <div>
                  <p className="text-gray-400 text-sm mb-1">Block Time</p>
                  <p className="text-blue-300">{assetInfo.BLOCK_TIME_IN_MINUTES} minutes</p>
                </div>
              )}
            </div>

            {/* {assetInfo.CATEGORIES && assetInfo.CATEGORIES.length > 0 && (
              <div>
                <p className="text-gray-400 text-sm mb-2">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {assetInfo.CATEGORIES.map((category, index) => (
                    <span 
                      key={index}
                      className="px-2.5 py-1 text-xs rounded-full
                               bg-blue-500/10 text-blue-300
                               border border-blue-500/20
                               hover:bg-blue-500/20 transition-colors duration-200"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )} */}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-gray-400 text-sm mb-1">24h Volume</p>
            <p className="text-white font-medium">{formatCurrency(volume24h)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Market Cap</p>
            <p className="text-white font-medium">{formatCurrency(marketCap)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">24h High</p>
            <p className="text-white font-medium">{formatCurrency(high24h)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">24h Low</p>
            <p className="text-white font-medium">{formatCurrency(low24h)}</p>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-auto flex items-center text-gray-400 text-sm">
          <Schedule className="w-4 h-4 mr-1" />
          Last updated: {lastUpdated}
        </div>
      </div>
    </motion.div>
  );
};