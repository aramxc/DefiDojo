import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { UserProvider } from './contexts/UserContext';
import { TimezoneProvider } from './contexts/TimezoneContext';
import { useWalletConnection } from './hooks/useWalletConnection';
import { useTickers, Ticker } from './hooks/useTickers';
import NavigationBar from './components/nav/NavigationBar';
import PaymentsSidebar from './components/sidebar/SidebarContainer';
import AuthLandingPage from './pages/AuthLandingPage';
import CreateUserForm from './components/auth/CreateUserForm';
import Dashboard from './pages/Dashboard';
import LearningHub from './pages/LearningHub';
import { News } from './pages/News';
import Home from './pages/Home';
import 'react-toastify/dist/ReactToastify.css';
import { ChatProvider } from './contexts/ChatContext';
import ChatButton from './components/nebula_chat/ChatToggleButton';
import ChatWindow from './components/nebula_chat/ChatWindow';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const { account, hasProfile } = useWalletConnection();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const { tickers, addTickers, removeTicker } = useTickers();

  return (
    <UserProvider>
      <TimezoneProvider>
        <ChatProvider>
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
                              selectedTickers={tickers}
                              onAddTickers={addTickers}
                              onRemoveTicker={removeTicker}
                              isSidebarExpanded={isSidebarExpanded}
                            />
                          ) : (
                            <AuthLandingPage />
                          )
                        }
                      />
                      <Route 
                        path="/dashboard" 
                        element={
                          account ? (
                            <Dashboard 
                              selectedTickers={tickers}
                              onAddTickers={addTickers}
                              onRemoveTicker={removeTicker}
                            />
                          ) : (
                            <AuthLandingPage />
                          )
                        }
                      />
                      <Route 
                        path="/learning" 
                        element={
                          account ? <LearningHub /> : <AuthLandingPage />
                        }
                      />
                      <Route 
                        path="/news" 
                        element={
                          account ? <News /> : <AuthLandingPage />
                        }
                      />
                    </Routes>
                  </div>
                </div>
                <ChatButton />
                <ChatWindow />
              </div>
            </Router>
          </ThemeProvider>
        </ChatProvider>
      </TimezoneProvider>
    </UserProvider>
  );
}

export default App;