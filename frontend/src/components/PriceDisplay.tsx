import React, { useEffect, useState } from 'react';
import { priceService, PriceData } from '../services/api/price.service';
import { Card, CardContent, Typography, CircularProgress } from '@mui/material';

export const PriceDisplay: React.FC = () => {
    const [prices, setPrices] = useState<PriceData[]>([]);
    const [loading, setLoading] = useState(true);

    const formatPrice = (price: any): string => {
        const cleanPrice = typeof price === 'string' ? 
          parseFloat(price.replace(/,/g, '')) : 
          price;
      
        return cleanPrice.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
    };
  
    useEffect(() => {
      const fetchPrices = async () => {
        try {
          const symbols = ['ETH', 'BTC', 'SOL'];
          const data = await priceService.getLatestPrices(symbols);
          setPrices(data);
        } catch (error) {
          console.error('Failed to fetch prices:', error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchPrices();
      const interval = setInterval(fetchPrices, 30000);
      return () => clearInterval(interval);
    }, []);
  
    if (loading) return (
        <div className="flex items-center justify-center h-48">
          <CircularProgress color="primary" />
        </div>
      );
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          {prices.map((price) => (
            <Card 
              key={price.id} 
              className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 
                       p-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 
                       transition-all duration-300 border border-slate-700/50"
            >
              <CardContent>
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full 
                              -translate-x-10 -translate-y-10 blur-2xl"></div>
                
                <Typography variant="h6" className="text-lg font-bold text-gray-100 mb-2 flex items-center gap-2">
                  {price.symbol}
                  <span className="text-xs px-2 py-1 bg-blue-500/20 rounded-full text-blue-300">
                    CRYPTO
                  </span>
                </Typography>
                
                <Typography variant="h4" className={`font-bold bg-gradient-to-r from-blue-400 to-cyan-300 
                bg-clip-text text-transparent tracking-tight
                ${price.price.toString().length > 8 ? 'text-2xl' : 'text-3xl'}`}>
                  ${formatPrice(price.price)}
                </Typography>
                
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                  <Typography variant="body2" className="text-sm text-gray-400">
                    Confidence: 
                    <span className="ml-1 text-gray-200">
                      {Number(price.conf).toFixed(2)}%
                    </span>
                  </Typography>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
};