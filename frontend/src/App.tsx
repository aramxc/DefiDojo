import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import ConnectWalletButton from './components/ConnectWalletButton';
import ContractInfo from './components/ContractInfo';
import ContractActions from './components/ContractActions';
import { PriceDisplay } from './components/PriceDisplay';
import { PriceAnalytics } from './components/PriceAnalytics';

import NavigationBar from './components/NavigationBar';
import AboutSection from './components/AboutSection';
import 'react-toastify/dist/ReactToastify.css';

// Define a dark theme for the application
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <Router>
        <div className="App min-h-screen bg-slate-900 flex flex-col">
          <NavigationBar />
          <ToastContainer />
          <div className="flex-grow flex flex-col items-center justify-center p-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<AboutSection />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

const Home = () => {
  const [account, setAccount] = React.useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = React.useState<string | null>(null);

  const handleSymbolSelect = (symbol: string) => {
    console.log('App: Setting selected symbol:', symbol);
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
          <PriceDisplay onSelectSymbol={handleSymbolSelect} />
          <PriceAnalytics symbol={selectedSymbol} />
        </div>
      )}
    </div>
  );
};

export default App;