import React, { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import ConnectWalletButton from './components/ConnectWalletButton';
import ContractInfo from './components/ContractInfo';
import ContractActions from './components/ContractActions';
import { requestAccount } from './services/web3/contract.service';
import { PriceDisplay } from './components/PriceDisplay';
// import { PriceChart } from './components/PriceChart';

import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [account, setAccount] = useState<string | null>(null);

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
    <div className="App min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
      <ToastContainer />
      {!account ? (
        <ConnectWalletButton setAccount={setAccount} />
      ) : (
        <div className="flex flex-col gap-6 w-full max-w-4xl">
          <div className="contract-interactions flex flex-col gap-4">
            <ContractInfo account={account} />
            <ContractActions/>
          </div>
          <div />
          <div className="price-display">
            <PriceDisplay />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
