import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

import PaymentsSidebar from './components/sidebar/SidebarContainer';
import ConnectWalletButton from './components/auth/ConnectWalletButton';
import NavigationBar from './components/nav/NavigationBar';
import Dashboard from './pages/Dashboard';
import LearningHub from './pages/LearningHub';
import CreateUserForm from './components/auth/CreateUserForm';
import AdvancedDashboard from './pages/PremiumDashboard';
import { News } from './pages/News';
import 'react-toastify/dist/ReactToastify.css';
import { requestAccount } from './services/web3/contract.service';
import { TimezoneProvider } from './contexts/TimezoneContext';
import AuthLandingPage from './pages/AuthLandingPage';

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
          <div className="min-h-screen bg-slate-900" style={{ '--navbar-height': '5rem' } as React.CSSProperties}>
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
                      account ? (
                        <Home 
                          account={account}
                          setAccount={setAccount}
                          selectedTickers={selectedTickers}
                          onAddTickers={handleAddTickers}
                          onRemoveTicker={handleRemoveTicker}
                          isSidebarExpanded={isSidebarExpanded}
                        />
                      ) : (
                        <AuthLandingPage setAccount={setAccount} />
                      )
                    }
                  />
                  <Route 
                    path="/advanced-dashboard" 
                    element={
                      account ? (
                        <AdvancedDashboard 
                          selectedTickers={selectedTickers}
                          onAddTickers={handleAddTickers}
                          onRemoveTicker={handleRemoveTicker}
                        />
                      ) : (
                        <AuthLandingPage setAccount={setAccount} />
                      )
                    }
                  />
                  <Route 
                    path="/learning" 
                    element={
                      account ? (
                        <LearningHub />
                      ) : (
                        <AuthLandingPage setAccount={setAccount} />
                      )
                    }
                  />
                  <Route 
                    path="/news" 
                    element={
                      account ? (
                        <News />
                      ) : (
                        <AuthLandingPage setAccount={setAccount} />
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
      <div className="flex flex-col justify-center items-center min-h-screen relative overflow-hidden">
        {/* Animated background elements */}
        <motion.div 
          className="absolute inset-0 opacity-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-cyan-300/10 to-teal-400/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.1),transparent_50%)]" />
        </motion.div>

        {/* Floating elements */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-64 h-64 bg-gradient-to-r from-blue-400/5 via-cyan-300/5 to-teal-400/5 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight 
            }}
            animate={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ 
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}

        {/* Welcome content */}
        <motion.div
          className="relative z-10 text-center space-y-8 max-w-2xl px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
              Welcome to the Dojo! 
            </span>
          </h1>
          
          <p className="text-gray-400 text-lg mb-8 leading-relaxed">
            Connect your wallet to access real-time analytics and and start learning about the future of finance.
          </p>

          <ConnectWalletButton setAccount={setAccount} />
        </motion.div>
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