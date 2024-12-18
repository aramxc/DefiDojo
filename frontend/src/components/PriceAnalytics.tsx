import React, { useState, useEffect } from 'react';
import { Table, TableContainer, Paper } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { priceService, PriceData} from '../services/api/price.service';
import { historicalPriceService, HistoricalPriceData } from '../services/api/historicalPrice.service';

// Constants and Types
type Timeframe = {
  label: string;
  days: number;
};

const TIMEFRAMES: Timeframe[] = [
  { label: '24H', days: 1 },
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 }
];

// Utility functions
const formatPrice = (price: number): string => 
  Number(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const PriceAnalytics: React.FC<{ symbol: string | null }> = ({ symbol }) => {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [historicalData, setHistoricalData] = useState<HistoricalPriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>(TIMEFRAMES[0]);

  useEffect(() => {
    if (!symbol) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [currentPrices, historical] = await Promise.all([
          priceService.getLatestPrices([symbol]),
          historicalPriceService.getHistoricalPrices(symbol, selectedTimeframe.days)
        ]);
        setPrices(currentPrices);
        setHistoricalData(historical);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [symbol, selectedTimeframe]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 shadow-xl border border-slate-700/30 backdrop-blur-sm">
      <div className="flex gap-2 mb-6">
        {TIMEFRAMES.map(timeframe => (
          <button
            key={timeframe.label}
            onClick={() => setSelectedTimeframe(timeframe)}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              selectedTimeframe.label === timeframe.label
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600 hover:shadow-lg'
            }`}
          >
            {timeframe.label}
          </button>
        ))}
      </div>

      <TableContainer component={Paper} className="bg-slate-800/50 backdrop-blur-sm">
        <Table>
          {/* Add Table Header */}
          <thead>
            <tr className="border-b border-slate-700">
              <th className="p-4 text-left text-gray-300 font-semibold">Asset</th>
              <th className="p-4 text-left text-gray-300 font-semibold">Current Price</th>
              <th className="p-4 text-left text-gray-300 font-semibold">Price Change</th>
              <th className="p-4 text-left text-gray-300 font-semibold">Low / High</th>
            </tr>
          </thead>
          <tbody>
          {prices.map((price) => {
            const symbolData = historicalData?.[price.symbol as string];
            const priceChange = symbolData?.priceChange ?? 0;
            const { lowPrice = 0, highPrice = 0 } = symbolData ?? {};
            
            return (
              <tr key={price.symbol} className="hover:bg-slate-700/50 transition-colors">
                <td className="p-4 text-gray-300 border-b border-slate-700">{price.symbol}</td>
                <td className="p-4 text-gray-300 border-b border-slate-700">${formatPrice(price.price)}</td>
                <td className={`p-4 border-b border-slate-700 flex items-center gap-2 ${priceChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {priceChange > 0 ? <TrendingUp /> : <TrendingDown />}
                  {Math.abs(priceChange)}%
                </td>
                <td className="p-4 text-gray-300 border-b border-slate-700">
                  ${formatPrice(lowPrice)} / ${formatPrice(highPrice)}
                </td>
              </tr>
            );
          })}
          </tbody>
        </Table>
      </TableContainer>
    </div>
  );
};