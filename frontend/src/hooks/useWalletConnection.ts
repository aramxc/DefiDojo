import { useState, useEffect } from 'react';
import { requestAccount } from '../services/web3/contract.service';

/**
 * Hook for handling wallet connection and account changes
 * Manages wallet connection state and listens for MetaMask account changes
 * @returns Object containing account address and profile status
 */
export const useWalletConnection = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(false);

  const connectWallet = async () => {
    const connectedAccount = await requestAccount();
    setAccount(connectedAccount);
    return connectedAccount;
  };

  // Handle initial wallet connection and account changes
  useEffect(() => {
    connectWallet();

    // Listen for account changes in MetaMask
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
          setHasProfile(false);
        }
      }
    };

    checkProfile();
  }, [account]);

  return { account, hasProfile, connectWallet };
};