import React, { useEffect, useState } from 'react';
import { getBalanceInEth } from '../utils/contractServices';

const ContractInfo = ({ account }: { account: string }) => {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const balanceInEth = await getBalanceInEth(account);
        console.log('balanceInEth', balanceInEth);
        setBalance(Number(balanceInEth));
      } catch (error) {
        console.error('Error fetching balance', error);
      }
    };
    fetchBalance();
  }, [account]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Contract Info</h2>
      <div className="bg-purple-50 rounded-lg p-4 shadow-sm space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-purple-600 font-semibold">Account:</span>
          <span className="text-gray-700 font-mono bg-white px-3 py-1 rounded-md text-sm overflow-hidden overflow-ellipsis">
            {account}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-purple-600 font-semibold">Balance:</span>
          <span className="text-gray-700 font-mono bg-white px-3 py-1 rounded-md">
            {balance.toFixed(4)} ETH
          </span>
        </div>
      </div>
    </div>
  );
};

export default ContractInfo;
