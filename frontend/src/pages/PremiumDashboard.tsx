import React, { useState, useEffect } from 'react';
import TickerInputForm from '../components/dashboard/TickerInputForm';
import { PriceAnalytics } from '../components/dashboard/PriceAnalytics';
import { SortablePriceDisplay } from '../components/dashboard/SortablePriceDisplay';
import { StatCard } from '../components/dashboard/StatCard';

interface AdvancedDashboardProps {
  selectedTickers: string[];
  onAddTickers: (tickers: string[]) => void;
  onRemoveTicker: (symbol: string) => void;
}

const AdvancedDashboard: React.FC<AdvancedDashboardProps> = ({
  selectedTickers,
  onAddTickers,
  onRemoveTicker,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(selectedTickers[0] || '');
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedSymbol) return;
      setIsLoading(true);
      try {
        // Replace with your actual API call
        const response = await fetch(`/api/stats/${selectedSymbol}`);
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [selectedSymbol]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="p-4 sm:p-6 lg:p-8 h-screen flex flex-col">
        <div className="max-w-[1920px] mx-auto w-full">
          <div className="relative z-10 h-16 bg-slate-800/50 rounded-xl backdrop-blur-sm border border-white/5 p-3 mb-4">
            <TickerInputForm onAddTickers={onAddTickers} />
          </div>
        </div>

        <div className="max-w-[1920px] mx-auto w-full flex-1">
          <div className="h-[calc(100vh-15rem)] grid grid-cols-12 gap-4">
            {/* Left Sidebar */}
            <div className="col-span-2 bg-slate-800/50 rounded-xl backdrop-blur-sm border border-white/5 overflow-hidden">
              <div className="h-full overflow-y-auto pr-2 p-3 space-y-3 
                            scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {selectedTickers.map((ticker) => (
                  <SortablePriceDisplay
                    key={ticker}
                    id={ticker}
                    symbol={ticker}
                    onRemove={() => onRemoveTicker(ticker)}
                    onSelectSymbol={setSelectedSymbol}
                  />
                ))}
              </div>
            </div>
      
            {/* Center Content */}
            <div className="col-span-7 bg-slate-800/50 rounded-xl backdrop-blur-sm border border-white/5">
              <PriceAnalytics
                symbol={selectedSymbol}
                onClose={() => {}}
              />
            </div>
      
            {/* Right Sidebar */}
            <div className="col-span-3 h-full flex flex-col gap-4">
              <StatCard
                title="Market Overview"
                stats={[
                  { label: "24h Volume", value: "$16.55B" },
                  { label: "Market Cap", value: "$1.82T" },
                  { label: "24h Range", value: "$91,187 - $95,363" },
                ]}
                isLoading={isLoading}
              />
              <StatCard
                title="Network Stats"
                stats={[
                  { label: "Hash Rate", value: "826.38 EH/s" },
                  { label: "Difficulty", value: "109.78T" },
                  { label: "Block Height", value: "878,551" },
                ]}
                isLoading={isLoading}
              />
              <StatCard
                title="Fee Estimates"
                stats={[
                  { label: "Next Block", value: "6 sat/vB" },
                  { label: "Hour", value: "2 sat/vB" },
                  { label: "Mempool", value: "90,544 tx" },
                ]}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Second Viewport - Additional Charts */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1920px] mx-auto">
          <div className="grid grid-cols-3 gap-4 h-[80vh]">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="bg-slate-800/50 rounded-xl backdrop-blur-sm border border-white/5 p-4"
              >
                <h3 className="text-lg font-semibold text-gray-300 mb-4">
                  Additional Chart {i}
                </h3>
                {/* Chart component will go here */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};  

export default AdvancedDashboard;