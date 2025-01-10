import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { requestAccount } from '../../services/web3/contract.service';

interface ConnectWalletButtonProps {
  setAccount: (account: string | null) => void;
}

const LoadingSpinner = () => (
  <div className="flex items-center gap-2">
    <div className="w-4 h-4 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin" />
    <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
      Connecting...
    </span>
  </div>
);

const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({ 
  setAccount 
}): JSX.Element => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.button
        onClick={handleWalletAction}
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          relative overflow-hidden rounded-lg font-medium text-lg px-8 py-4
          transition-all duration-200 min-w-[280px]
          before:absolute before:inset-0 
          before:bg-gradient-to-r before:from-blue-400 before:via-cyan-300 before:to-teal-400
          before:opacity-70 before:transition-all before:duration-200
          after:absolute after:inset-0 
          after:bg-gradient-to-r after:from-blue-400 after:via-cyan-300 after:to-teal-400
          after:opacity-50
          shadow-[0_0_12px_rgba(34,211,238,0.25)]
          hover:shadow-[0_0_20px_rgba(34,211,238,0.35)]
          disabled:opacity-75 disabled:cursor-not-allowed
          ${isConnected ? 'before:opacity-50 after:opacity-30' : ''}
        `}
      >
        <span className="relative z-10 text-white font-semibold">
          {isLoading ? <LoadingSpinner /> : (
            isConnected ? 'Disconnect Wallet' : 'Connect Web3 Wallet'
          )}
        </span>
      </motion.button>
    </motion.div>
  );
};

export default ConnectWalletButton;