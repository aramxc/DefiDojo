import React, { useEffect, useState } from 'react';
import { priceService, PriceData } from '../services/api/price.service';
import { Card, CardContent, Typography, CircularProgress } from '@mui/material';

interface PriceDisplayProps {
  onSelectSymbol: (symbol: string) => void;
  selectedTickers: string[];
  symbol: string;
  onRemove: () => void;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({ symbol, onRemove, onSelectSymbol }) => {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(false);

  const formatPrice = (price: number): string => 
    price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  useEffect(() => {
    const fetchPrice = async () => {
      setLoading(true);
      try {
        const data = await priceService.getLatestPrices([symbol]);
        setPriceData(data[0]);
      } catch (error) {
        console.error('Failed to fetch price:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
  }, [symbol]);

  return (
    <Card 
      className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border border-slate-700/50 cursor-pointer"
      onClick={() => onSelectSymbol(symbol)}
    >
      <button onClick={onRemove} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
        &times;
      </button>
      <CardContent>
        {loading ? (
          <CircularProgress color="primary" />
        ) : (
          <>
            <Typography variant="h6" className="text-lg font-bold text-gray-100 mb-2 flex items-center gap-2">
              {symbol}
              <span className="text-xs px-2 py-1 bg-blue-500/20 rounded-full text-blue-300">
                CRYPTO
              </span>
            </Typography>
            <Typography variant="h4" className={`font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent tracking-tight ${priceData && priceData.price.toString().length > 8 ? 'text-2xl' : 'text-3xl'}`}>
              ${priceData && priceData.price ? formatPrice(priceData.price) : 'N/A'}
            </Typography>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
              <Typography variant="body2" className="text-sm text-gray-400">
                Confidence: 
                <span className="ml-1 text-gray-200">
                  {priceData?.conf !== undefined ? Number(priceData.conf).toFixed(2) : 'N/A'}%
                </span>
              </Typography>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};