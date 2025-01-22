import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Schedule, Info } from '@mui/icons-material';
import { formatCurrency, formatPercentage, formatValue, formatChange } from '../../../utils';
import { AssetInfo } from '@defidojo/shared-types';
import { Switch } from '@mui/material';
import { priceService } from '../../../services/api/price.service';
import { useFetchLatestPrice } from '../../../hooks/useFetchLatestPrice';
import { Skeleton } from '@mui/material';

interface DetailedPriceCardProps {
  symbol: string;
  assetInfo: any;
  isLoading?: boolean;
  error?: string;
}

export const DetailedPriceCard: React.FC<DetailedPriceCardProps> = ({ 
  symbol, 
  assetInfo, 
  isLoading,
  error
}) => {
  const [isRealTime, setIsRealTime] = useState(false);
  const [timeSinceUpdate, setTimeSinceUpdate] = useState<Date>(new Date());
  
  const { 
    price, 
    loading: priceLoading,
    lastUpdateTime 
  } = useFetchLatestPrice(symbol, isRealTime);

  const loading = priceLoading;

  const priceChange = assetInfo?.MARKET_DATA?.CHANGE_24H;

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

  if (error) {
    return (
      <div className="h-full rounded-xl bg-slate-800/50 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-400">
            {symbol}/USD
          </h3>
        </div>
        <div className="text-sm text-red-400">
          Rate limit exceeded. Please try again later.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="animate-pulse h-full rounded-xl bg-slate-800/50 p-4">
        <div className="h-6 bg-slate-700 rounded w-1/2 mb-4" />
        <div className="space-y-3">
          <div className="h-8 bg-slate-700 rounded" />
          <div className="h-4 bg-slate-700 rounded w-2/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full rounded-xl bg-slate-800/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400">
          {symbol}/USD
        </h3>
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">
            {formatValue(assetInfo?.CURRENT_PRICE, 'price')}
          </span>
          {typeof priceChange === 'number' && (
            <div className={`flex items-center text-sm gap-0.5 font-medium ${
              priceChange >= 0 ? "text-green-400" : "text-red-400"
            }`}>
              {priceChange >= 0 
                ? <TrendingUp className="w-4 h-4" /> 
                : <TrendingDown className="w-4 h-4" />
              }
              <span>{formatChange(priceChange)}</span>
            </div>
          )}
        </div>
        <span className="text-sm text-gray-400">
          24h Change
        </span>
      </div>
    </div>
  );
};

export default DetailedPriceCard;