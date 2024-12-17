import React from 'react';
import { PriceDisplay } from './PriceDisplay';
import TickerInputForm from './TickerInputForm';

interface DashboardProps {
  selectedTickers: string[];
  onAddTickers: (tickers: string[]) => void;
  onRemoveTicker: (symbol: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ selectedTickers, onAddTickers, onRemoveTicker }) => {
  return (
    <div className="flex flex-col items-center">
      <TickerInputForm onAddTickers={onAddTickers} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {selectedTickers.map((ticker) => (
          <PriceDisplay
            key={ticker}
            symbol={ticker}
            onRemove={() => onRemoveTicker(ticker)}
            onSelectSymbol={() => {}}
            selectedTickers={selectedTickers}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard; 