import React, { useState, useEffect } from 'react';
import { 
  Tabs, Tab, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, CircularProgress 
} from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { priceService, PriceData } from '../services/api/price.service';
import { historicalPriceService, HistoricalPriceData } from '../services/api/historicalPrice.service';

// TabPanel component for switching content
const TabPanel: React.FC<{ children: React.ReactNode; isActive: boolean }> = ({ children, isActive }) => 
  isActive ? <>{children}</> : null;

interface PriceAnalyticsProps {
  symbol: string | null;
}

interface TimeframeData {
  label: string;
  days: number;
}

const TIMEFRAMES: TimeframeData[] = [
  { label: '24H', days: 1 },
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
];

// Format price to a string with two decimal places
const formatPrice = (price: any): string => {
  const numPrice = Number(price.toString().replace(/,/g, ''));
  return isNaN(numPrice) ? '0.00' : numPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const PriceAnalytics: React.FC<PriceAnalyticsProps> = ({ symbol }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [historicalData, setHistoricalData] = useState<HistoricalPriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeData>(TIMEFRAMES[0]);

  // Fetch price data based on the selected symbol and timeframe
  useEffect(() => {
    if (!symbol) return;

    const fetchPriceData = async () => {
      setLoading(true);
      try {
        const [currentPrices, historical] = await Promise.all([
          priceService.getLatestPrices([symbol]),
          historicalPriceService.getHistoricalPrices(symbol, selectedTimeframe.days)
        ]);
        setPrices(currentPrices);
        setHistoricalData(historical);
      } catch (error) {
        console.error('Price data fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPriceData();
    const interval = setInterval(fetchPriceData, 30000);
    return () => clearInterval(interval);
  }, [symbol, selectedTimeframe]);

  // Calculate price change percentage
  const getPriceChange = (price: PriceData): number => {
    if (!historicalData?.prices.length) return 0;
    const oldestPrice = historicalData.prices[0]?.price;
    const currentPrice = parseFloat(price.price.toString());
    return oldestPrice ? parseFloat(((currentPrice - oldestPrice) / oldestPrice * 100).toFixed(2)) : 0;
  };

  // Render timeframe selector buttons
  const renderTimeframeSelector = () => (
    <div className="flex gap-2 mb-4">
      {TIMEFRAMES.map((timeframe) => (
        <button
          key={timeframe.label}
          onClick={() => setSelectedTimeframe(timeframe)}
          className={`px-4 py-2 rounded-lg transition-all ${
            selectedTimeframe.label === timeframe.label
              ? 'bg-blue-500 text-white'
              : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
          }`}
        >
          {timeframe.label}
        </button>
      ))}
    </div>
  );

  // Render price table
  const renderPriceTable = () => (
    <TableContainer component={Paper} className="bg-slate-800">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell className="text-gray-300 font-semibold border-slate-700">Asset</TableCell>
            <TableCell className="text-gray-300 font-semibold border-slate-700">Current Price</TableCell>
            <TableCell className="text-gray-300 font-semibold border-slate-700">
              {selectedTimeframe.label} Change
            </TableCell>
            <TableCell className="text-gray-300 font-semibold border-slate-700">
              {selectedTimeframe.label} Low/High
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {prices.map((price) => {
            const priceChange = getPriceChange(price);
            const isPriceUp = priceChange > 0;
            const priceHistory = historicalData?.prices || [];
            const lowPrice = Math.min(...priceHistory.map(p => p.price));
            const highPrice = Math.max(...priceHistory.map(p => p.price));

            return (
              <TableRow key={price.id} className="hover:bg-slate-700/50">
                <TableCell className="text-gray-300 border-slate-700">{price.symbol}</TableCell>
                <TableCell className="text-gray-300 border-slate-700">${formatPrice(price.price)}</TableCell>
                <TableCell className={`border-slate-700 flex items-center gap-2 ${isPriceUp ? 'text-green-400' : 'text-red-400'}`}>
                  {isPriceUp ? <TrendingUp /> : <TrendingDown />}
                  {Math.abs(priceChange)}%
                </TableCell>
                <TableCell className="text-gray-300 border-slate-700">
                  ${formatPrice(lowPrice)} / ${formatPrice(highPrice)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <div className="bg-slate-800 rounded-xl p-4 shadow-lg">
      {renderTimeframeSelector()}
      <Tabs 
        value={activeTab} 
        onChange={(_, newValue) => setActiveTab(newValue)}
        className="border-b border-slate-700"
        TabIndicatorProps={{ style: { backgroundColor: '#3b82f6' } }}
      >
        <Tab label="Price Analysis" className="text-gray-300 hover:text-blue-400" />
        <Tab label="24h Summary" className="text-gray-300 hover:text-blue-400" />
      </Tabs>

      <TabPanel isActive={activeTab === 0}>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <CircularProgress />
          </div>
        ) : (
          renderPriceTable()
        )}
      </TabPanel>

      <TabPanel isActive={activeTab === 1}>
        <div className="p-4 text-gray-300">
          <h3 className="text-xl font-semibold">24 Hour Price Summary</h3>
          {historicalData ? (
            <p className="text-gray-400 mt-2">Historical data available</p>
          ) : (
            <p>No historical data available</p>
          )}
        </div>
      </TabPanel>
    </div>
  );
};