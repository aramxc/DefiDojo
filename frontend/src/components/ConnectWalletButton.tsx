import React, { useState } from 'react';
import { requestAccount } from '../services/web3/contract.service';

interface ConnectWalletButtonProps {
  setAccount: (account: string | null) => void;
}

// Loading spinner component for better reusability
const LoadingSpinner = () => (
  <div className="flex items-center gap-2">
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
    <span>Connecting...</span>
  </div>
);

const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({ setAccount }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle wallet connection/disconnection
  const handleWalletAction = async () => {
    if (isConnected) {
      setAccount(null);
      setIsConnected(false);
      return;
    }

    setIsLoading(true);
    try {
      const account = await requestAccount();
      setAccount(account);
      setIsConnected(true);
    } catch (error) {
      console.error('Error connecting wallet', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleWalletAction}
      disabled={isLoading}
      className={`
        px-6 py-3 rounded-lg font-medium transition-all duration-200
        flex items-center justify-center min-w-[200px]
        ${isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:scale-105 hover:shadow-lg'}
        ${isConnected 
          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/25' 
          : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/25'
        }
      `}
    >
      {isLoading ? <LoadingSpinner /> : (
        <span>{isConnected ? 'Disconnect Wallet' : 'Connect Web3 Wallet'}</span>
      )}
    </button>
  );
};

export default ConnectWalletButton;