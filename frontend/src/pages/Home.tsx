import { Ticker } from '../hooks/useTickers';
import { useWalletConnection } from '../hooks/useWalletConnection';
import AuthLandingPage from './AuthLandingPage';
import Dashboard from './Dashboard';

interface HomeProps {
    account: string;
    selectedTickers: Ticker[];
    onAddTickers: (tickers: Ticker[]) => void;
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
  
    if (!account) return <AuthLandingPage />;
  
    return (
      <Dashboard 
        selectedTickers={selectedTickers} 
        onAddTickers={onAddTickers} 
        onRemoveTicker={onRemoveTicker}
      />
    );
  };

  export default Home;