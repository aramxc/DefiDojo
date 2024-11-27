import React from 'react';
import { requestAccount } from '../utils/contractServices';

const ConnectWalletButton = ({ setAccount }: { setAccount: (account: string) => void }) => {
  const connectWallet = async () => {
    try {
      const account = await requestAccount();
      setAccount(account);
    } catch (error) {
      console.error('Error connecting wallet', error);
    }
  };

  return <button onClick={connectWallet}>Connect Web3 Wallet</button>;
};

export default ConnectWalletButton;
