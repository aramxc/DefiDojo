import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useWalletConnection } from './hooks/useWalletConnection';
import { UserProvider } from './contexts/UserContext';

import PaymentsSidebar from './components/sidebar/SidebarContainer';
import ConnectWalletButton from './components/auth/ConnectWalletButton';
import NavigationBar from './components/nav/NavigationBar';
import Dashboard from './pages/Dashboard';
import LearningHub from './pages/LearningHub';
import CreateUserForm from './components/auth/CreateUserForm';
import AdvancedDashboard from './pages/PremiumDashboard';
import { News } from './pages/News';
import 'react-toastify/dist/ReactToastify.css';
import { TimezoneProvider } from './contexts/TimezoneContext';
import AuthLandingPage from './pages/AuthLandingPage';

// Define a dark theme for the application
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const { account, hasProfile } = useWalletConnection();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);

  const handleAddTickers = (tickers: string[]) => {
    setSelectedTickers((prev) => [...new Set([...prev, ...tickers])]);
  };

  const handleRemoveTicker = (symbol: string) => {
    setSelectedTickers((prev) => prev.filter((ticker) => ticker !== symbol));
  };

  return (
    <UserProvider>
      <TimezoneProvider>
        <ThemeProvider theme={darkTheme}>
          <Router>
            <div className="min-h-screen bg-slate-900" style={{ '--navbar-height': '5rem' } as React.CSSProperties}>
              <NavigationBar 
                isExpanded={isSidebarExpanded}
                onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
               
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
                            selectedTickers={selectedTickers}
                            onAddTickers={handleAddTickers}
                            onRemoveTicker={handleRemoveTicker}
                            isSidebarExpanded={isSidebarExpanded}
                          />
                        ) : (
                          <AuthLandingPage />
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
                          <AuthLandingPage />
                        )
                      }
                    />
                    <Route 
                      path="/learning" 
                      element={
                        account ? (
                          <LearningHub />
                        ) : (
                          <AuthLandingPage />
                        )
                      }
                    />
                    <Route 
                      path="/news" 
                      element={
                        account ? (
                          <News />
                        ) : (
                          <AuthLandingPage />
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
    </UserProvider>
  );
}

interface HomeProps {
  account: string;
  selectedTickers: string[];
  onAddTickers: (tickers: string[]) => void;
  onRemoveTicker: (symbol: string) => void;
  isSidebarExpanded: boolean;
}

const Home = ({ 
  account, 
  selectedTickers, 
  onAddTickers, 
  onRemoveTicker,
  isSidebarExpanded
}: HomeProps) => {
  const { hasProfile } = useWalletConnection();

  if (!account) {
    return <AuthLandingPage />;
  }

  if (!hasProfile) {
    return (
      <CreateUserForm 
        isOpen={true}
        onClose={() => {}} 
        onSuccess={() => {}}
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