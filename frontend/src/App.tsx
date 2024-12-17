import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import ConnectWalletButton from './components/ConnectWalletButton';
import ContractInfo from './components/ContractInfo';
import ContractActions from './components/ContractActions';
import { PriceAnalytics } from './components/PriceAnalytics';

import NavigationBar from './components/NavigationBar';
import LearningResources from './components/LearningResources';
import Dashboard from './components/Dashboard';
import 'react-toastify/dist/ReactToastify.css';
import { DEFAULT_TICKER_SYMBOLS } from './config/constants';

// Define a dark theme for the application
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const [selectedTickers, setSelectedTickers] = useState<string[]>(DEFAULT_TICKER_SYMBOLS);

  const handleAddTickers = (tickers: string[]) => {
    setSelectedTickers((prev) => [...new Set([...prev, ...tickers])]);
  };

  const handleRemoveTicker = (symbol: string) => {
    setSelectedTickers((prev) => prev.filter((ticker) => ticker !== symbol));
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Router>
        <div className="App min-h-screen bg-slate-900 flex flex-col">
          <NavigationBar />
          <ToastContainer />
          <div className="flex-grow flex flex-col items-center justify-center p-6">
            <Routes>
              <Route path="/" element={<Home selectedTickers={selectedTickers} onAddTickers={handleAddTickers} onRemoveTicker={handleRemoveTicker} />} />
              <Route path="/about" element={<LearningResources />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

const Home = ({ selectedTickers, onAddTickers, onRemoveTicker }: { selectedTickers: string[], onAddTickers: (tickers: string[]) => void, onRemoveTicker: (symbol: string) => void }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  const handleSymbolSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl">
      {!account ? (
        <ConnectWalletButton setAccount={setAccount} />
      ) : (
        <div className="flex flex-col gap-6">
          <ContractInfo account={account} />
          <ContractActions />
          <Dashboard selectedTickers={selectedTickers} onAddTickers={onAddTickers} onRemoveTicker={onRemoveTicker} />
          <PriceAnalytics symbol={selectedSymbol} />
        </div>
      )}
    </div>
  );
};

export default App;