import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import ConnectWalletButton from './components/ConnectWalletButton';
import ContractInfo from './components/ContractInfo';
import ContractActions from './components/ContractActions';
import ContractSidebar from './components/ContractSidebar';

import NavigationBar from './components/NavigationBar';
import LearningResources from './components/LearningResources';
import Dashboard from './components/Dashboard';
import 'react-toastify/dist/ReactToastify.css';
import { requestAccount } from './services/web3/contract.service';
// Define a dark theme for the application
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const [account, setAccount] = useState<string | null>(null);
  
const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const handleAddTickers = (tickers: string[]) => {
    setSelectedTickers((prev) => [...new Set([...prev, ...tickers])]);
  };

  const handleRemoveTicker = (symbol: string) => {
    setSelectedTickers((prev) => prev.filter((ticker) => ticker !== symbol));
  };

  useEffect(() => {
    // get account from metamask
    requestAccount().then(setAccount);

    // listener for account changes
    if (window.ethereum) {
      const handleAccountChange = (accounts: string[]) => {
        setAccount(accounts[0] || null);
      };

      window.ethereum.on('accountsChanged', handleAccountChange);
      return () => window.ethereum?.removeListener('accountsChanged', handleAccountChange);
    }
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <Router>
        <div className="App min-h-screen bg-slate-900">
          <NavigationBar />
          <ToastContainer />
          <div className="w-full">
            <Routes>
              <Route 
                path="/" 
                element={
                  <Home 
                    account={account}
                    setAccount={setAccount}
                    selectedTickers={selectedTickers} 
                    onAddTickers={handleAddTickers} 
                    onRemoveTicker={handleRemoveTicker} 
                  />
                } 
              />
              <Route path="/about" element={<LearningResources />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

interface HomeProps {
  account: string | null;
  setAccount: (account: string | null) => void;
  selectedTickers: string[];
  onAddTickers: (tickers: string[]) => void;
  onRemoveTicker: (symbol: string) => void;
}

const Home = ({ account, setAccount, selectedTickers, onAddTickers, onRemoveTicker }: HomeProps) => {
  return (
    <div className="w-full min-h-screen">
      {!account ? (
        <div className="max-w-4xl mx-auto px-6 flex justify-center items-center min-h-screen">
          <ConnectWalletButton setAccount={setAccount} />
        </div>
      ) : (
        <div className="flex">
          {/* Sidebar */}
          <ContractSidebar account={account} />
          
          {/* Main Content */}
          <div className="flex-1 pl-12">
            <Dashboard 
              selectedTickers={selectedTickers} 
              onAddTickers={onAddTickers} 
              onRemoveTicker={onRemoveTicker}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;