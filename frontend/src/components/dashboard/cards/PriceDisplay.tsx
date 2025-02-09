import React, { useEffect, useState, memo, useMemo } from 'react';
import { BarChart, Info, TrendingUp, Schedule, People } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

import { Switch, CircularProgress } from '@mui/material';
import { AssetPriceData, AssetInfo } from '@defidojo/shared-types';
import { useFetchMarketMetrics } from '../../../hooks/useMarketMetrics';
import { useFetchAssetInfo } from '../../../hooks/useAssetInfo';
import { useLivePrice } from '../../../hooks/useLivePrice';

interface PriceDisplayProps {
  symbol: string;
  pythPriceFeedId: string;
  onRemove: () => void;
  onSelectSymbol: (symbol: string) => void;
  getRealTimeData?: boolean;
}

const formatPrice = (price: number): string => 
  price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const LoadingAnimation = () => (
  <motion.div 
    animate={{ 
      background: [
        "linear-gradient(90deg, #1e293b 0%, #334155 50%, #1e293b 100%)",
      ],
      backgroundPosition: ["200% 0", "-200% 0"],
    }}
    transition={{ duration: 1.5, repeat: Infinity }}
    className="h-8 w-32 rounded-md"
  />
);

const PriceValue = memo(({ price }: { price: number | undefined }) => (
  <div className="font-bold relative w-fit">
    {price ? (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-fit">
        <span className="absolute inset-0 w-[105%] bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 blur-xl opacity-10" />
        <span className="relative bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 
                      bg-clip-text text-transparent tracking-tight text-4xl">
          ${formatPrice(price)}
        </span>
      </motion.div>
    ) : (
      <LoadingAnimation />
    )}
  </div>
));

// Move BackContent outside and memoize it
const BackContent = memo(({ assetInfo, isLoading, error, CardControls }: { 
    assetInfo: AssetInfo | null;
    isLoading: boolean;
    error: string | null;
    CardControls: React.FC<{ isBackside?: boolean }>;
}) => {
    if (isLoading || !assetInfo) return <div className="p-4">Loading...</div>;

    return (
        <div className="flex flex-col h-full" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4">
                <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-200 to-gray-100 bg-clip-text text-transparent">
                    About {assetInfo.name}
                </h3>
                <CardControls isBackside />
            </div>

            {/* Description */}
            <div className="flex-1 px-6 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500/10 scrollbar-track-transparent">
                <div 
                    className="text-gray-300/90 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: (assetInfo.description as unknown as string) || '' }}
                />
            </div>

            {/* Links Footer */}
            <div className="p-4 border-t border-gray-700/20">
                <div className="flex flex-wrap gap-2 justify-center">
                    {[
                        { url: assetInfo.links.whitepaper?.[0], label: 'Whitepaper' },
                        { url: assetInfo.links.subredditUrl, label: 'Reddit' },
                        { url: assetInfo.links.reposUrl?.github?.[0], label: 'GitHub' }
                    ].filter(link => link.url).map(link => (
                        <a
                            key={link.label}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="relative overflow-hidden rounded-lg text-xs px-4 py-1.5
                                   text-gray-300/90 transition-all duration-300 ease-in-out
                                   before:absolute before:inset-0 
                                   before:bg-gradient-to-r before:from-blue-400/10 before:via-cyan-400/10 before:to-teal-400/10
                                   before:transition-all before:duration-300 before:ease-in-out
                                   hover:text-white hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]
                                   hover:before:from-blue-400/20 hover:before:via-cyan-400/20 hover:before:to-teal-400/20
                                   active:scale-[0.98] transform"
                        >
                            <span className="relative z-10">{link.label}</span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
});

export const PriceDisplay: React.FC<PriceDisplayProps> = ({ 
  symbol, 
  pythPriceFeedId,
  onRemove, 
  onSelectSymbol,
  getRealTimeData = false
}) => {
  const [isRealTime, setIsRealTime] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const { 
    price, 
    loading: priceLoading, 
    lastUpdateTime 
  } = useLivePrice(symbol, isRealTime, pythPriceFeedId);

  const { 
    assetInfo, 
    loading: assetInfoLoading, 
    error: assetInfoError 
  } = useFetchAssetInfo(symbol, getRealTimeData);

  const { 
    metrics: marketMetrics, 
    loading: metricsLoading, 
    error: metricsError 
  } = useFetchMarketMetrics(
    symbol,
    assetInfo?.coingeckoId || undefined
  );

  if (assetInfoError) {
    return (
      <div className="text-red-500">
        Error loading asset info: {assetInfoError.message}
      </div>
    );
  }

  const CardControls = ({ isBackside = false }) => {
    const handleAnalyticsButtonClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      // Just pass the symbol, remove the metrics parameter
      onSelectSymbol(symbol);
    };

    return (
      <div className="absolute top-3 right-3 flex gap-2 z-50">
        {!isBackside && (
          <>
            <button 
              onClick={handleAnalyticsButtonClick}
              className="w-8 h-8 flex items-center justify-center
                       rounded-full bg-white/5 text-gray-300 opacity-0 group-hover:opacity-100
                       hover:bg-white/10 hover:text-white transition-all duration-200"
              title="View Analytics"
            >
              <BarChart fontSize="small" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(true);
              }}
              className="w-8 h-8 flex items-center justify-center
                       rounded-full bg-white/5 text-gray-300 opacity-0 group-hover:opacity-100
                       hover:bg-white/10 hover:text-white transition-all duration-200"
              title="View Info"
            >
              <Info fontSize="small" />
            </button>
          </>
        )}
        {isBackside && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsFlipped(false);
            }}
            className="w-8 h-8 flex items-center justify-center
                     rounded-full bg-white/5 text-gray-300 opacity-0 group-hover:opacity-100
                     hover:bg-white/10 hover:text-white transition-all duration-200"
            title="Back"
          >
            ←
          </button>
        )}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="w-8 h-8 flex items-center justify-center
                   rounded-full bg-red-500/5 text-red-300 opacity-0 group-hover:opacity-100
                   hover:bg-red-500/10 hover:text-red-200 transition-all duration-200"
          title="Remove"
        >
          ×
        </button>
      </div>
    );
  };

  const renderThumbnail = () => {
    if (!assetInfo?.image?.thumb) return null;
    
    return (
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-sm opacity-30"></div>
        <img 
          src={assetInfo.image.thumb} 
          alt={symbol} 
          className="relative w-8 h-8 rounded-full"
        />
      </div>
    );
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="relative perspective-1000 group"
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full h-[220px]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front of card */}
        <div className="backface-hidden relative h-full rounded-xl overflow-hidden
                      shadow-[0_0_10px_rgba(59,130,246,0.03)] 
                      before:absolute before:inset-0 
                      before:bg-gradient-to-br before:from-slate-800/90 before:via-slate-800/80 before:to-slate-900/90 
                      before:backdrop-blur-xl hover:before:opacity-90 
                      after:absolute after:inset-0 
                      after:bg-gradient-to-br after:from-blue-500/5 after:via-cyan-500/5 after:to-teal-500/5 
                      after:opacity-0 hover:after:opacity-100 
                      after:transition-opacity">
          <AnimatePresence>
            {!isFlipped && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative p-6 z-10"
              >
                <CardControls />
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    {renderThumbnail()}
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-gray-100">{symbol.toUpperCase()}</h3>
                      <span className="text-sm text-gray-400">{assetInfo?.name || 'Loading...'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <PriceValue price={price ?? undefined} />
                    <div className="h-px bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-transparent"></div>
                  </div>

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
                    </div>
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Back of card */}
        <AnimatePresence>
          {isFlipped && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="backface-hidden absolute top-0 left-0 w-full h-full
                       rounded-xl overflow-hidden
                       shadow-[0_0_10px_rgba(59,130,246,0.03)]"
              style={{ transform: 'rotateY(180deg)' }}
            >
              {/* Match the front card's gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800/90 via-slate-800/80 to-slate-900/90 backdrop-blur-xl" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-blue-500/5" />
              
              {/* Content container */}
              <div className="relative h-full z-10">
                <BackContent 
                  assetInfo={assetInfo}
                  isLoading={assetInfoLoading}
                  error={assetInfoError}
                  CardControls={CardControls}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};