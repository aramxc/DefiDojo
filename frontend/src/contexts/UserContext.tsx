import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile } from '@defidojo/shared-types';
import { toast } from 'react-toastify';
import { WalletService } from '../services/web3/wallet.service';

interface UserContextType {
  wallet: string | null;
  profile: UserProfile | null;
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  upgradeToFullProfile: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Setup wallet listeners
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setWallet(null);
        localStorage.removeItem('walletAddress');
      } else {
        setWallet(accounts[0]);
        localStorage.setItem('walletAddress', accounts[0]);
      }
    };

    WalletService.setupWalletListeners(handleAccountsChanged);
    return () => WalletService.removeWalletListeners();
  }, []);

  const connectWallet = async () => {
    try {
      const address = await WalletService.requestConnection();
      if (address) {
        setWallet(address);
        localStorage.setItem('walletAddress', address);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const disconnectWallet = async () => {
    await WalletService.disconnectWallet();
    setWallet(null);
    setProfile(null);
  };

  const upgradeToFullProfile = async (email: string, username: string, password: string) => {
    if (!wallet) {
      throw new Error('Wallet must be connected first');
    }

    try {
      const response = await fetch('/api/users/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: wallet,
          email,
          username,
          password
        }),
      });

      if (!response.ok) {
        throw new Error('Profile upgrade failed');
      }

      const profileData = await response.json();
      setProfile(profileData);
      toast.success('Profile upgraded successfully!');
    } catch (error) {
      toast.error('Failed to upgrade profile');
      throw error;
    }
  };

  const logout = () => {
    setWallet(null);
    setProfile(null);
  };

  return (
    <UserContext.Provider 
      value={{ 
        wallet, 
        profile, 
        isLoading, 
        connectWallet, 
        disconnectWallet,
        upgradeToFullProfile, 
        logout 
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};