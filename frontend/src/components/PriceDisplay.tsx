import React, { useEffect, useState } from 'react';
import { BarChart, Info } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { priceService, PriceData } from '../services/api/price.service';
import { coinInfoService, CoinInfo } from '../services/api/coinInfo.service';

interface PriceDisplayProps {
  onSelectSymbol: (symbol: string) => void;
  symbol: string;
  onRemove: () => void;
}

const LoadingSpinner = () => (
  <div className="flex justify-center p-8">
    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

export const PriceDisplay: React.FC<PriceDisplayProps> = ({ symbol, onRemove, onSelectSymbol }) => {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [coinInfo, setCoinInfo] = useState<CoinInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [timeAgo, setTimeAgo] = useState<string>('just now');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prices, info] = await Promise.all([
          priceService.getLatestPrices([symbol]),
          coinInfoService.getCoinInfo(symbol)
        ]);
        
        const symbolData = prices.find(p => p.symbol.toUpperCase() === symbol.toUpperCase());
        setPriceData(symbolData || null);
        setCoinInfo(info);
        setLastUpdateTime(new Date());
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setPriceData(null);
        setCoinInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(() => {
      priceService.getLatestPrices([symbol])
        .then(prices => {
          const symbolData = prices.find(p => p.symbol.toUpperCase() === symbol.toUpperCase());
          setPriceData(symbolData || null);
          setLastUpdateTime(new Date());
        })
        .catch(console.error);
    }, 120000);

    return () => clearInterval(interval);
  }, [symbol]);

  useEffect(() => {
    const updateTimeAgo = () => {
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - lastUpdateTime.getTime()) / 1000);
      
      if (diffInSeconds < 10) {
        setTimeAgo('just now');
      } else if (diffInSeconds < 60) {
        setTimeAgo(`${diffInSeconds} seconds ago`);
      } else {
        const minutes = Math.floor(diffInSeconds / 60);
        setTimeAgo(`${minutes} minute${minutes > 1 ? 's' : ''} ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 10000);

    return () => clearInterval(interval);
  }, [lastUpdateTime]);

  const formatPrice = (price: number): string => 
    price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
      {isBackside ? (
        <button 
          onClick={() => setIsFlipped(false)}
          className="w-8 h-8 flex items-center justify-center
                   rounded-full bg-white/5 text-gray-300 opacity-0 group-hover:opacity-100
                   hover:bg-white/10 hover:text-white transition-all duration-200"
          title="Back"
        >
          ←
        </button>
      ) : null}
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

  const FrontContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {coinInfo?.image?.thumb && (
            <img 
              src={coinInfo.image.thumb} 
              alt={symbol} 
              className="w-8 h-8 rounded-full ring-1 ring-white/10"
            />
          )}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-100">{symbol.toUpperCase()}</h3>
              <span className="text-xs px-2 py-0.5 bg-blue-500/10 rounded-full text-blue-300 
                             backdrop-blur-sm border border-blue-500/10">
                CRYPTO
              </span>
            </div>
            <span className="text-sm text-gray-400">{coinInfo?.name || ''}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className={`font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 
                        bg-clip-text text-transparent tracking-tight 
                        ${priceData?.price ? (priceData.price.toString().length > 8 ? 'text-3xl' : 'text-4xl') : 'text-4xl'}`}>
          ${priceData?.price ? formatPrice(priceData.price) : '--'}
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-slate-700/50 to-slate-800/50 rounded-full 
                        overflow-hidden backdrop-blur-sm">
          <div className="h-full w-1/2 bg-gradient-to-r from-blue-500/50 to-cyan-500/50 rounded-full" />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Live Price
        </div>
        <span>Updated {timeAgo}</span>
      </div>
    </div>
  );

  return (
    <div className="relative perspective-1000">
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full h-[220px]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front of card */}
        <div className="backface-hidden relative group overflow-hidden h-full
                       rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 
                       transition-all duration-300 border border-slate-700/50">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-blue-500/5" />
          
          <div className="relative p-6">
            <CardControls />
            {loading ? <LoadingSpinner /> : <FrontContent />}
          </div>
        </div>

        {/* Back of card */}
        <div 
          className="backface-hidden absolute top-0 left-0 w-full h-full group 
                     bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg 
                     border border-slate-700/50"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div className="p-4 h-full flex flex-col">
            <CardControls isBackside />
            
            {loading ? <LoadingSpinner /> : (
              <div className="space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 
                            scrollbar-track-transparent pr-2">
                <div className="flex items-center gap-3">
                  {coinInfo?.image?.thumb && (
                    <img 
                      src={coinInfo.image.thumb} 
                      alt={symbol} 
                      className="w-7 h-7 rounded-full ring-1 ring-white/10"
                    />
                  )}
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-base font-bold text-gray-100">{coinInfo?.name || symbol}</h3>
                    <span className="text-xs text-gray-400">({symbol.toUpperCase()})</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {coinInfo?.links?.homepage?.[0] && (
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      href={coinInfo.links.homepage[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg
                               bg-gradient-to-r from-slate-700/50 to-slate-800/50
                               border border-slate-700/50 backdrop-blur-sm
                               text-gray-300 hover:text-white group
                               hover:shadow-lg hover:shadow-slate-900/20
                               transition-all duration-200"
                    >
                      <i className="fas fa-globe text-sm opacity-50 group-hover:opacity-100" />
                      <span className="text-sm font-medium">Official Website</span>
                    </motion.a>
                  )}
                  {coinInfo?.links?.whitepaper && (
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      href={coinInfo.links.whitepaper}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg
                               bg-gradient-to-r from-slate-700/50 to-slate-800/50
                               border border-slate-700/50 backdrop-blur-sm
                               text-gray-300 hover:text-white group
                               hover:shadow-lg hover:shadow-slate-900/20
                               transition-all duration-200"
                    >
                      <i className="fas fa-file-alt text-sm opacity-50 group-hover:opacity-100" />
                      <span className="text-sm font-medium">Whitepaper</span>
                    </motion.a>
                  )}
                  {coinInfo?.links?.subreddit_url && (
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      href={coinInfo.links.subreddit_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg
                               bg-gradient-to-r from-slate-700/50 to-slate-800/50
                               border border-slate-700/50 backdrop-blur-sm
                               text-gray-300 hover:text-white group
                               hover:shadow-lg hover:shadow-slate-900/20
                               transition-all duration-200"
                    >
                      <i className="fab fa-reddit-alien text-sm opacity-50 group-hover:opacity-100" />
                      <span className="text-sm font-medium">Reddit</span>
                    </motion.a>
                  )}
                  {coinInfo?.links?.github_url?.[0] && (
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      href={coinInfo.links.github_url[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg
                               bg-gradient-to-r from-slate-700/50 to-slate-800/50
                               border border-slate-700/50 backdrop-blur-sm
                               text-gray-300 hover:text-white group
                               hover:shadow-lg hover:shadow-slate-900/20
                               transition-all duration-200"
                    >
                      <i className="fab fa-github text-sm opacity-50 group-hover:opacity-100" />
                      <span className="text-sm font-medium">GitHub</span>
                    </motion.a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};