import React, { useState, useEffect } from 'react';
// import { PriceDisplay } from '../components/PriceDisplay';
import { PriceAnalytics } from '../components/dashboard/PriceAnalytics';
import TickerInputForm from '../components/dashboard/TickerInputForm';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DndContextProps } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortablePriceDisplay } from '../components/dashboard/SortablePriceDisplay';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardProps {
  selectedTickers: string[];
  onAddTickers: (tickers: string[]) => void;
  onRemoveTicker: (symbol: string) => void;
  getRealTimeData?: boolean;
}

const DndContextComponent = DndContext as React.FC<DndContextProps>;

const Dashboard: React.FC<DashboardProps> = ({ 
  selectedTickers, 
  onAddTickers, 
  onRemoveTicker,
  getRealTimeData = true
}): JSX.Element => {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  
  // Update items whenever selectedTickers changes
  const [items, setItems] = useState(selectedTickers);

  // Add this useEffect to sync items with selectedTickers
  useEffect(() => {
    setItems(selectedTickers);
  }, [selectedTickers]);

  // Configure sensors for drag interactions
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = (event: any) => {
    const {active, over} = event;
    
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="min-h-screen pt-[var(--navbar-height)] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="container max-w-7xl mx-auto px-4 py-2 sm:p-6 lg:p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full backdrop-blur-xl bg-white/5 rounded-2xl overflow-hidden"
        >
          {/* Main Container */}
          <div className="divide-y divide-white/5">
            {/* Ticker Input Section */}
            <div className="p-6">
              <TickerInputForm onAddTickers={onAddTickers}/>
            </div>

            {/* Price Display Grid */}
            <div className="p-6">
              <DndContextComponent sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={items} strategy={rectSortingStrategy}>
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: {
                        transition: {
                          staggerChildren: 0.1
                        }
                      }
                    }}
                  >    
                    {items.map((ticker) => (
                      <motion.div
                        key={ticker}
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          visible: { opacity: 1, y: 0 }
                        }}
                        transition={{ duration: 0.4 }}
                      >
                        <SortablePriceDisplay
                          id={ticker}
                          symbol={ticker}
                          onRemove={() => onRemoveTicker(ticker)}
                          onSelectSymbol={setSelectedSymbol}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </SortableContext>
              </DndContextComponent>
            </div>

            {/* Analytics Section with AnimatePresence */}
            <AnimatePresence>
              {selectedSymbol && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ 
                    duration: 0.3,
                    height: {
                      duration: 0.4,
                      ease: 'easeInOut'
                    }
                  }}
                  className="relative"
                >
                  <div className="p-6">
                    <PriceAnalytics 
                      symbol={selectedSymbol} 
                      onClose={() => setSelectedSymbol(null)} 
                      closeable={true}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard; 