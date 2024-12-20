import React, { useEffect, useState } from 'react';
import { fetchBalances } from '../services/web3/contract.service';
import { CONTRACT_ADDRESS } from '../config/constants';

const ContractInfo = ({ account }: { account: string }) => {
  const [contractBalance, setContractBalance] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletCopied, setWalletCopied] = useState(false);
  const [contractCopied, setContractCopied] = useState(false);

  useEffect(() => {
    const updateBalances = async () => {
      const { contractBalance, walletBalance } = await fetchBalances(account);
      setContractBalance(contractBalance);
      setWalletBalance(walletBalance);
    };

    updateBalances();
  }, [account]); 

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleCopy = async (text: string, setCopied: (value: boolean) => void) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Wallet Info Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4">
        <h3 className="text-lg font-bold text-gray-100 mb-3">Wallet Info</h3>
        <div className="space-y-3">
          <div>
            <span className="text-gray-400 text-sm">Address</span>
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm text-gray-300 truncate" title={account}>
                {truncateAddress(account)}
              </p>
              <button 
                onClick={() => handleCopy(account, setWalletCopied)}
                className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
              >
                {walletCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <div>
            <span className="text-gray-400 text-sm">Balance</span>
            <p className="font-bold text-xl text-purple-400">
              {walletBalance.toFixed(4)} ETH
            </p>
          </div>
        </div>
      </div>

      {/* Contract Info Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4">
        <h3 className="text-lg font-bold text-gray-100 mb-3">Contract Info</h3>
        <div className="space-y-3">
          <div>
            <span className="text-gray-400 text-sm">Address</span>
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm text-gray-300 truncate" title={CONTRACT_ADDRESS}>
                {truncateAddress(CONTRACT_ADDRESS)}
              </p>
              <button 
                onClick={() => handleCopy(CONTRACT_ADDRESS, setContractCopied)}
                className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
              >
                {contractCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <div>
            <span className="text-gray-400 text-sm">Balance</span>
            <p className="font-bold text-xl text-purple-400">
              {contractBalance.toFixed(4)} ETH
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractInfo;