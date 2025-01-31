import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

/**
 * Hook for handling wallet connection state
 * Manages MetaMask connection and account state
 * @returns Object containing account address and connection function
 */
export const useWalletConnection = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(false);

  // Handle wallet connection request
  const connect = useCallback(async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        setAccount(accounts[0]);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  }, []);

  // Listen for account changes in MetaMask
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setAccount(accounts[0] || null);
      });
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

  return { account, hasProfile, connect };
};