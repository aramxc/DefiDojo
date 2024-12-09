import React, { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import ConnectWalletButton from './components/ConnectWalletButton';
import ContractInfo from './components/ContractInfo';
import ContractActions from './components/ContractActions';
import { requestAccount } from './services/web3/contract.service';
import { PriceDisplay } from './components/PriceDisplay';
import { PriceAnalytics } from './components/PriceAnalytics';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Define a dark theme for the application
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  const handleSymbolSelect = (symbol: string) => {
    console.log('App: Setting selected symbol:', symbol); // Add this log
    setSelectedSymbol(symbol);
  };

  useEffect(() => {
    // Request account from MetaMask
    requestAccount().then(setAccount);

    // Listen for account changes
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
      <div className="App min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
        <ToastContainer />
        {!account ? (
          <ConnectWalletButton setAccount={setAccount} />
        ) : (
          <div className="flex flex-col gap-6 w-full max-w-4xl">
            <div className="contract-interactions flex flex-col gap-4">
              <ContractInfo account={account} />
              <ContractActions />
            </div>
            <div className="price-display">
              <PriceDisplay onSelectSymbol={handleSymbolSelect} />
            </div>
            <div className="price-analytics">
              <PriceAnalytics symbol={selectedSymbol} />
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;