import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { depositFunds, withdrawFunds } from '../utils/contractServices';

const ContractActions = () => {
  const [depositValue, setDepositValue] = useState('');
  const [withdrawValue, setWithdrawValue] = useState('');
  
  const handleDeposit = async () => {
    try {
      if (!depositValue) {
        toast.error('Please enter an amount to deposit');
        return;
      }

      if (parseFloat(depositValue) <= 0) {
        toast.error('Please enter an amount greater than 0');
        return;
      }

      await depositFunds(depositValue);
      
      console.log('Deposit value:', depositValue);
    } catch (error: any) {
      toast.error(error?.reason);
    }
    setDepositValue('');
  };

  const handleWithdraw = async () => {
    try {
      if (!withdrawValue) {
        toast.error('Please enter an amount to withdraw');
        return;
      }

      if (parseFloat(withdrawValue) <= 0) {
        toast.error('Please enter an amount greater than 0');
        return;
      }

      console.log('Withdraw value:', withdrawValue);
      await withdrawFunds(withdrawValue);
    } catch (error: any) {
      toast.error(error?.reason || error.message);
    }
    setWithdrawValue('');
  };

  return (
    <div className="space-y-6">
      <div/>
      <div className="bg-purple-50 rounded-lg p-6 shadow-sm space-y-6">
        <div className="space-y-4">
          <label className="block text-purple-700 font-medium mb-2">Deposit Funds</label>
          <div className="flex space-x-4">
            <input
              type="number"
              min="0"
              step="0.0001"
              value={depositValue}
              onChange={(e) => setDepositValue(e.target.value)}
              placeholder="Amount in ETH"
              className="flex-1 px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <button 
              onClick={handleDeposit}
              className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors duration-200"
            >
              Deposit
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-purple-700 font-medium mb-2">Withdraw Funds</label>
          <div className="flex space-x-4">
            <input
              type="number"
              min="0"
              step="0.0001"
              value={withdrawValue}
              onChange={(e) => setWithdrawValue(e.target.value)}
              placeholder="Amount in ETH"
              className="flex-1 px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <button 
              onClick={handleWithdraw}
              className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors duration-200"
            >
              Withdraw
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractActions;
