import React, { useEffect, useState, memo, useMemo } from 'react';
import { BarChart, Info } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { priceService, PriceData } from '../../services/api/price.service';
import { coinInfoService, CoinInfo } from '../../services/api/coinInfo.service';
import { Switch, CircularProgress } from '@mui/material';

interface PriceDisplayProps {
  symbol: string;
  onRemove: () => void;
  onSelectSymbol: (symbol: string) => void;
  // controlsOffset?: string;
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

export const PriceDisplay: React.FC<PriceDisplayProps> = ({ symbol, onRemove, onSelectSymbol }) => {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [coinInfo, setCoinInfo] = useState<CoinInfo | null>(null);
  const [isRealTime, setIsRealTime] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  // Fetch coin info once
  useEffect(() => {
    coinInfoService.getCoinInfo(symbol).then(setCoinInfo).catch(console.error);
  }, [symbol]);

  // Handle price updates
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const prices = await priceService.getLatestPrices([symbol]);
        setPriceData(prices.find(p => p.symbol.toUpperCase() === symbol.toUpperCase()) || null);
        setLastUpdateTime(new Date());
      } catch (error) {
        console.error(error);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, isRealTime ? 1000 : 120000);
    return () => clearInterval(interval);
  }, [symbol, isRealTime]);

  const timeAgo = useMemo(() => {
    const seconds = Math.floor((new Date().getTime() - lastUpdateTime.getTime()) / 1000);
    
    if (isRealTime) {
      return seconds < 5 ? 'just now' : `${seconds}s ago`;
    }
    
    if (seconds < 10) {
      return 'just now';
    }
    
    if (seconds >= 10 && seconds < 30) {
      return '10 seconds ago';
    }
    
    if (seconds >= 30 && seconds < 60) {
      return '30 seconds ago';
    }
    
    if (seconds >= 60 && seconds < 120) {
      return '1 minute ago';
    }
    
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minutes ago`;
  }, [lastUpdateTime, isRealTime]);
  
  useEffect(() => {
    if (!isRealTime) {
      const timer = setInterval(() => {
        setLastUpdateTime(prev => new Date(prev.getTime())); // Force update
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isRealTime]);

  const BackContent = () => (
    <div className="p-6 space-y-4 text-gray-300">
      <h3 className="text-lg font-semibold text-gray-100">About {coinInfo?.name}</h3>
      
      {coinInfo?.description?.en && (
        <p className="text-sm leading-relaxed line-clamp-4">
          {coinInfo.description.en}
        </p>
      )}
      
      <div className="space-y-3">
        <div className="h-px bg-gradient-to-r from-slate-700/50 via-slate-700/25 to-transparent" />
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          {coinInfo?.genesis_date && (
            <div>
              <span className="text-gray-400">Launch Date:</span>
              <div>{new Date(coinInfo.genesis_date).toLocaleDateString()}</div>
            </div>
          )}
          
          {coinInfo?.sentiment_votes_up_percentage && (
            <div>
              <span className="text-gray-400">Community Sentiment:</span>
              <div className="flex items-center gap-1">
                <span className="text-green-400">
                  {coinInfo.sentiment_votes_up_percentage}%
                </span>
                <span>positive</span>
              </div>
            </div>
          )}
        </div>

        <div className="h-px bg-gradient-to-r from-slate-700/50 via-slate-700/25 to-transparent" />
        
        <div className="flex flex-wrap gap-2">
          {coinInfo?.links?.whitepaper && (
            <a
              href={coinInfo.links.whitepaper}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 text-xs rounded-full bg-white/5 hover:bg-white/10 
                       transition-colors duration-200"
            >
              Whitepaper
            </a>
          )}
          {coinInfo?.links?.homepage?.[0] && (
            <a
              href={coinInfo.links.homepage[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 text-xs rounded-full bg-white/5 hover:bg-white/10 
                       transition-colors duration-200"
            >
              Website
            </a>
          )}
          {coinInfo?.links?.subreddit_url && (
            <a
              href={coinInfo.links.subreddit_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 text-xs rounded-full bg-white/5 hover:bg-white/10 
                       transition-colors duration-200"
            >
              Reddit
            </a>
          )}
        </div>
      </div>
    </div>
  );

  const CardControls = ({ isBackside = false }) => (
    <div className="absolute top-3 right-3 flex gap-2">
      {!isBackside && (
        <>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onSelectSymbol(symbol);
            }}
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
          onClick={() => setIsFlipped(false)}
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
                    {coinInfo?.image?.thumb && (
                      <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-sm opacity-30"></div>
                        <img 
                          src={coinInfo.image.thumb} 
                          alt={symbol} 
                          className="relative w-8 h-8 rounded-full"
                        />
                      </div>
                    )}
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-gray-100">{symbol.toUpperCase()}</h3>
                      <span className="text-sm text-gray-400">{coinInfo?.name || ''}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <PriceValue price={priceData?.price} />
                    <div className="h-px bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-transparent"></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
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
                    <span className="text-xs text-gray-400">Updated {timeAgo}</span>
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
                       shadow-[0_0_10px_rgba(59,130,246,0.03)]
                       before:absolute before:inset-0 
                       before:bg-gradient-to-br before:from-slate-800/90 before:via-slate-800/80 before:to-slate-900/90 
                       before:backdrop-blur-xl"
              style={{ transform: 'rotateY(180deg)' }}
            >
              <CardControls isBackside />
              <BackContent />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};