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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Contract Info</h2>
      
      {/* Wallet Card */}
      <div className="bg-purple-50 rounded-lg p-4 shadow-sm space-y-3">
        <h3 className="text-lg font-semibold text-purple-800">Wallet Info</h3>
        <div className="flex items-center space-x-2">
          <span className="text-purple-600 font-semibold">Address:</span>
          <span className="text-gray-700 font-mono bg-white px-3 py-1 rounded-md text-sm overflow-hidden overflow-ellipsis">
            {account}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-purple-600 font-semibold">Balance:</span>
          <span className="text-gray-700 font-mono bg-white px-3 py-1 rounded-md">
            {walletBalance.toFixed(4)} ETH
          </span>
        </div>
      </div>
  
      {/* Contract Card */}
      <div className="bg-purple-50 rounded-lg p-4 shadow-sm space-y-3">
        <h3 className="text-lg font-semibold text-purple-800">Contract Info</h3>
        <div className="flex items-center space-x-2">
          <span className="text-purple-600 font-semibold">Address:</span>
          <span className="text-gray-700 font-mono bg-white px-3 py-1 rounded-md text-sm overflow-hidden overflow-ellipsis">
            {CONTRACT_ADDRESS}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-purple-600 font-semibold">Balance:</span>
          <span className="text-gray-700 font-mono bg-white px-3 py-1 rounded-md">
            {contractBalance.toFixed(4)} ETH
          </span>
        </div>
      </div>
    </div>
  );
};

export default ContractInfo;