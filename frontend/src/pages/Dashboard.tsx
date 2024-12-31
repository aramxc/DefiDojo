import React, { useState } from 'react';
import { PriceDisplay } from '../components/PriceDisplay';
import { PriceAnalytics } from '../components/PriceAnalytics';
import TickerInputForm from '../components/TickerInputForm';

interface DashboardProps {
  selectedTickers: string[];
  onAddTickers: (tickers: string[]) => void;
  onRemoveTicker: (symbol: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  selectedTickers, 
  onAddTickers, 
  onRemoveTicker,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="space-y-8">
        {/* Ticker input section */}
        <div className="w-full">
          <TickerInputForm onAddTickers={onAddTickers} />
        </div>

        {/* Price display grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">    
          {selectedTickers.map((ticker) => (
            <PriceDisplay
              key={ticker}
              symbol={ticker}
              onRemove={() => onRemoveTicker(ticker)}
              onSelectSymbol={setSelectedSymbol}
            />
          ))}
        </div>

        {/* Analytics Section */}
        {selectedSymbol && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-between items-center">
                <h2 className="bg-slate-900 pr-3 text-xl font-semibold text-gray-200">
                  Price Analytics: {selectedSymbol}
                </h2>
                <button
                  onClick={() => setSelectedSymbol(null)}
                  className="bg-slate-900 pl-3 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>
            <PriceAnalytics symbol={selectedSymbol} />
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 