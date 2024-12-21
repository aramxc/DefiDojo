import React, { useEffect, useState } from 'react';
import { BarChart } from '@mui/icons-material';
import { priceService, PriceData } from '../services/api/price.service';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const prices = await priceService.getLatestPrices([symbol]);
        const symbolData = prices.find(p => p.symbol.toUpperCase() === symbol.toUpperCase());
        console.log('Price data for', symbol, ':', symbolData);
        setPriceData(symbolData || null);
      } catch (error) {
        console.error('Failed to fetch price:', error);
        setPriceData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 120000); // 2 minutes
    return () => clearInterval(interval);
  }, [symbol]);

  const formatPrice = (price: number): string => 
    price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div 
      className="relative group overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 
                 p-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 
                 transition-all duration-300 border border-slate-700/50"
    >
      <div className="absolute top-3 right-3 flex gap-2">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onSelectSymbol(symbol);
          }}
          className="w-8 h-8 flex items-center justify-center
                     rounded-full bg-blue-500/10 text-blue-500 opacity-0 group-hover:opacity-100
                     hover:bg-blue-500/20 transition-all duration-200"
          title="View Analytics"
        >
          <BarChart fontSize="small" />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="w-8 h-8 flex items-center justify-center
                     rounded-full bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100
                     hover:bg-red-500/20 transition-all duration-200"
          title="Remove"
        >
          ×
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-100">{symbol}</h3>
            <span className="text-xs px-2 py-1 bg-blue-500/20 rounded-full text-blue-300">CRYPTO</span>
          </div>
          <div className={`font-bold bg-gradient-to-r from-blue-400 to-cyan-300 
                          bg-clip-text text-transparent tracking-tight 
                          ${priceData?.price ? (priceData.price.toString().length > 8 ? 'text-2xl' : 'text-3xl') : 'text-3xl'}`}>
            ${priceData?.price ? formatPrice(priceData.price) : '--'}
          </div>
        </div>
      )}
    </div>
  );
};