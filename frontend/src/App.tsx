import React, { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import ConnectWalletButton from './components/ConnectWalletButton';
import ContractInfo from './components/ContractInfo';
import ContractActions from './components/ContractActions';
import { requestAccount } from './utils/contractServices';
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
    <div className="App min-h-screen bg-purple-50 flex flex-col items-center justify-center">
      <ToastContainer />
      {!account ? (
        <ConnectWalletButton setAccount={setAccount} />
      ) : (
        <div className="contract-interactions bg-white shadow-lg rounded-xl p-8 border border-purple-200">
          <ContractInfo account={account} />
          <ContractActions />
        </div>
      )}
    </div>
  );
}

export default App;
