import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import PaymentsSidebar from './components/sidebar/SidebarContainer';
import ConnectWalletButton from './components/ConnectWalletButton';
import NavigationBar from './components/NavigationBar';
import Dashboard from './pages/Dashboard';
import LearningHub from './pages/LearningHub';
import CreateUserForm from './components/CreateUserForm';

import 'react-toastify/dist/ReactToastify.css';
import { requestAccount } from './services/web3/contract.service';
import { TimezoneProvider } from './contexts/TimezoneContext';

// Define a dark theme for the application
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [hasProfile, setHasProfile] = useState(false);
 

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

  // Check for existing profile when wallet connects
  useEffect(() => {
    const checkProfile = async () => {
      if (account) {
        try {
          const response = await fetch(`/api/users/wallet/${account}`);
          setHasProfile(response.ok);
        } catch (error) {
          console.error('Error checking profile:', error);
        }
      }
    };

    checkProfile();
  }, [account]);

  return (
    <TimezoneProvider>
      <ThemeProvider theme={darkTheme}>
        <Router>
          <div className="min-h-screen bg-slate-900">
            <NavigationBar 
              isExpanded={isSidebarExpanded}
              onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
              account={account || undefined}
            />
            <ToastContainer />
            
            <div className="flex">
              {account && (
                <PaymentsSidebar 
                  account={account}
                  isExpanded={isSidebarExpanded}
                  onClose={() => setIsSidebarExpanded(false)}
                />
              )}
              
              <div className="flex-1">
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
                        isSidebarExpanded={isSidebarExpanded}
                      />
                    } 
                  />
                  <Route 
                    path="/learning" 
                    element={
                      account ? (
                        <LearningHub />
                      ) : (
                        <div className="flex justify-center items-center min-h-screen">
                          <ConnectWalletButton setAccount={setAccount} />
                        </div>
                      )
                    }
                  />
                </Routes>
              </div>
            </div>
          </div>
        </Router>
      </ThemeProvider>
    </TimezoneProvider>
  );
}

interface HomeProps {
  account: string | null;
  setAccount: (account: string | null) => void;
  selectedTickers: string[];
  onAddTickers: (tickers: string[]) => void;
  onRemoveTicker: (symbol: string) => void;
  isSidebarExpanded: boolean;
}

const Home = ({ 
  account, 
  setAccount, 
  selectedTickers, 
  onAddTickers, 
  onRemoveTicker,
  isSidebarExpanded
}: HomeProps) => {
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      if (account) {
        try {
          const response = await fetch(`/api/users/wallet/${account}`);
          setHasProfile(response.ok);
        } catch (error) {
          console.error('Error checking profile:', error);
        }
      }
    };

    checkProfile();
  }, [account]);

  if (!account) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ConnectWalletButton setAccount={setAccount} />
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <CreateUserForm 
        isOpen={true}
        onClose={() => {}} 
        onSuccess={() => setHasProfile(true)}
        walletAddress={account}
      />
    );
  }

  return (
    <Dashboard 
      selectedTickers={selectedTickers} 
      onAddTickers={onAddTickers} 
      onRemoveTicker={onRemoveTicker}
    />
  );
};

export default App;