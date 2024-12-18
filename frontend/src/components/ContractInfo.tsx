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
      {/* Wallet Info Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-100 mb-4">Wallet Info</h3>
        <div className="space-y-3">
          <div>
            <span className="text-gray-400">Address</span>
            <p className="font-mono text-sm text-gray-300">{account}</p>
          </div>
          <div>
            <span className="text-gray-400">Balance</span>
            <p className="font-bold text-2xl text-purple-400">
              {walletBalance.toFixed(4)} ETH
            </p>
          </div>
        </div>
      </div>

      {/* Contract Info Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-100 mb-4">Contract Info</h3>
        <div className="space-y-3">
          <div>
            <span className="text-gray-400">Address</span>
            <p className="font-mono text-sm text-gray-300">{CONTRACT_ADDRESS}</p>
          </div>
          <div>
            <span className="text-gray-400">Balance</span>
            <p className="font-bold text-2xl text-purple-400">
              {contractBalance.toFixed(4)} ETH
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractInfo;