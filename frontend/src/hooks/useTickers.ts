import { useState } from 'react';

export interface Ticker {
  symbol: string;
  coingeckoId: string;
}

interface UseTickersOptions {
  allowMultiple?: boolean;
  defaultTicker?: Ticker;
}

export const useTickers = (options: UseTickersOptions = {}) => {
  const { allowMultiple = true, defaultTicker } = options;
  const [tickers, setTickers] = useState<Ticker[]>(defaultTicker ? [defaultTicker] : []);

  const addTickers = (newTickers: Ticker[]) => {
    if (!allowMultiple) {
      setTickers([newTickers[0]]);
      return;
    }
    setTickers(prev => [...prev, ...newTickers]);
  };

  const removeTicker = (symbol: string) => {
    setTickers(prev => prev.filter(ticker => ticker.symbol !== symbol));
  };

  const selectTicker = (ticker: Ticker) => {
    setTickers([ticker]);
  };

  return { 
    tickers, 
    addTickers, 
    removeTicker,
    selectTicker,
    currentTicker: tickers[0] 
  };
};