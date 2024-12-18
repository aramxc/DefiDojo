import React from 'react';
import { PriceDisplay } from './PriceDisplay';
import TickerInputForm from './TickerInputForm';

interface DashboardProps {
  selectedTickers: string[];
  onAddTickers: (tickers: string[]) => void;
  onRemoveTicker: (symbol: string) => void;
  onSelectSymbol: (symbol: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  selectedTickers, 
  onAddTickers, 
  onRemoveTicker,
  onSelectSymbol 
}) => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    {/* Ticker input section */}
    <div className="mb-8">
      <TickerInputForm onAddTickers={onAddTickers} />
    </div>

    {/* Price display grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">    
      {selectedTickers.map((ticker) => (
        <PriceDisplay
          key={ticker}
          symbol={ticker}
          onRemove={() => onRemoveTicker(ticker)}
          onSelectSymbol={onSelectSymbol}
        />
      ))}
    </div>
  </div>
);

export default Dashboard; 