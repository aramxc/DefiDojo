import React, { useEffect, useState } from 'react';
import { fetchBalances } from '../services/web3/contract.service';
import { CONTRACT_ADDRESS } from '../config/constants';

const ContractInfo = ({ account }: { account: string }) => {
  const [contractBalance, setContractBalance] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    const updateBalances = async () => {
      const { contractBalance, walletBalance } = await fetchBalances(account);
      setContractBalance(contractBalance);
      setWalletBalance(walletBalance);
    };

    updateBalances();
  }, [account]); 


  return (
    <div className="flex flex-col gap-4">
      {/* Wallet Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 
                    rounded-xl p-6 shadow-lg hover:shadow-2xl
                    transition-all duration-300 border border-slate-700/50">
        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full 
                      -translate-x-10 -translate-y-10 blur-2xl"></div>
        
        <h3 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">
          Wallet Info
          <span className="text-xs px-2 py-1 bg-purple-500/20 rounded-full text-purple-300">
            CONNECTED
          </span>
        </h3>

        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <span className="text-gray-400 text-sm">Address</span>
            <span className="font-mono text-sm bg-slate-800/50 px-3 py-2 rounded-lg text-gray-300 
                          overflow-hidden overflow-ellipsis">{account}</span>
          </div>
          
          <div className="flex flex-col gap-1">
            <span className="text-gray-400 text-sm">Balance</span>
            <p className="font-bold text-2xl bg-gradient-to-r from-purple-400 to-pink-300 
                       bg-clip-text text-transparent">
              {walletBalance.toFixed(4)} ETH
            </p>
          </div>
        </div>
      </div>

      {/* Contract Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 
                    rounded-xl p-6 shadow-lg hover:shadow-2xl 
                    transition-all duration-300 border border-slate-700/50">
        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full 
                      -translate-x-10 -translate-y-10 blur-2xl"></div>
        
        <h3 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">
          Contract Info
          <span className="text-xs px-2 py-1 bg-purple-500/20 rounded-full text-purple-300">
            ACTIVE
          </span>
        </h3>

        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <span className="text-gray-400 text-sm">Address</span>
            <span className="font-mono text-sm bg-slate-800/50 px-3 py-2 rounded-lg text-gray-300 
                          overflow-hidden overflow-ellipsis">{CONTRACT_ADDRESS}</span>
          </div>
          
          <div className="flex flex-col gap-1">
            <span className="text-gray-400 text-sm">Balance</span>
            <p className="font-bold text-2xl bg-gradient-to-r from-purple-400 to-pink-300 
                       bg-clip-text text-transparent">
              {contractBalance.toFixed(4)} ETH
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractInfo;