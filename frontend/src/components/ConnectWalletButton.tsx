import React, { useState, useEffect } from 'react';
import { requestAccount } from '../services/web3/contract.service';

interface ConnectWalletButtonProps {
  setAccount: (account: string | null) => void;
}

const ConnectWalletButton = ({ setAccount }: ConnectWalletButtonProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedAccount = localStorage.getItem('connectedAccount');
    if (savedAccount) {
      setAccount(savedAccount);
      setIsConnected(true);
    }
  }, [setAccount]);

  const connectWallet = async () => {
    setIsLoading(true);
    try {
      const account = await requestAccount();
      setAccount(account);
      setIsConnected(true);
      localStorage.setItem('connectedAccount', account);
    } catch (error) {
      console.error('Error connecting wallet', error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    localStorage.removeItem('connectedAccount');
  };

  return (
    <button
      onClick={isConnected ? disconnectWallet : connectWallet}
      disabled={isLoading}
      className={`
        px-6 py-2 rounded-lg font-medium transition-all duration-200
        flex items-center justify-center min-w-[180px]
        ${isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:opacity-90'}
        ${isConnected 
          ? 'bg-red-500 hover:bg-red-600 text-white' 
          : 'bg-blue-500 hover:bg-blue-600 text-white'
        }
      `}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Connecting...</span>
        </div>
      ) : (
        <span>
          {isConnected ? 'Disconnect Wallet' : 'Connect Web3 Wallet'}
        </span>
      )}
    </button>
  );
};

export default ConnectWalletButton;