import React, { useState } from 'react';
import { 
  Tabs, 
  Tab, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Tooltip,
  IconButton
} from '@mui/material';
import { InfoOutlined, TrendingUp, TrendingDown } from '@mui/icons-material';
import { PriceData } from '../services/api/price.service';

interface PriceAnalyticsProps {
  prices: PriceData[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// TabPanel component to handle tab content display
function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && children}
    </div>
  );
}

export const PriceAnalytics: React.FC<PriceAnalyticsProps> = ({ prices }) => {
  const [tabValue, setTabValue] = useState(0);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Calculate price change (mock implementation)
  const getPriceChange = (price: PriceData): number => {
    const seed = parseFloat(price.price.toString()) % 10;
    return parseFloat((seed - 5).toFixed(2)); // Mock change between -5 and +5
  };

  return (
    <div className="bg-slate-800 rounded-xl p-4 shadow-lg">
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange}
        className="border-b border-slate-700"
        TabIndicatorProps={{ style: { backgroundColor: '#3b82f6' } }}
      >
        <Tab label="Price Analysis" className="text-gray-300 hover:text-blue-400" />
        <Tab label="24h Summary" className="text-gray-300 hover:text-blue-400" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper} className="bg-slate-800">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className="text-gray-300 font-semibold border-slate-700">Asset</TableCell>
                <TableCell className="text-gray-300 font-semibold border-slate-700">Price</TableCell>
                <TableCell className="text-gray-300 font-semibold border-slate-700">24h Change</TableCell>
                <TableCell className="text-gray-300 font-semibold border-slate-700">Info</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prices.map((price) => {
                const priceChange = getPriceChange(price);
                return (
                  <TableRow key={price.id} className="hover:bg-slate-700/50">
                    <TableCell className="text-gray-300 border-slate-700">{price.symbol}</TableCell>
                    <TableCell className="text-gray-300 border-slate-700">${Number(price.price).toLocaleString()}</TableCell>
                    <TableCell className={`border-slate-700 flex items-center gap-2 ${priceChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {priceChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {Math.abs(priceChange)}%
                    </TableCell>
                    <TableCell className="border-slate-700">
                      <Tooltip title="View detailed analytics">
                        <IconButton size="small" className="text-blue-400 hover:text-blue-300">
                          <InfoOutlined />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <div className="p-4 text-gray-300">
          {/* Placeholder for 24h summary content */}
          24h Summary Content (To be implemented)
        </div>
      </TabPanel>
    </div>
  );
};