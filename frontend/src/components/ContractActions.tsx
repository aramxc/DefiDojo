import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { depositFunds, withdrawFunds } from '../services/web3/contract.service';

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
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 
                    rounded-xl p-6 shadow-lg border border-slate-700/50">
        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full 
                      -translate-x-10 -translate-y-10 blur-2xl"></div>

        <div className="space-y-6">
          {/* Deposit Section */}
          <div className="space-y-4">
            <label className="block text-gray-100 font-medium mb-2">Deposit Funds</label>
            <div className="flex gap-4">
              <input
                type="number"
                min="0"
                step="0.0001"
                value={depositValue}
                onChange={(e) => setDepositValue(e.target.value)}
                placeholder="Amount in ETH"
                className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-600 text-gray-100
                         rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 
                         focus:border-transparent placeholder-gray-500"
                required
              />
              <button 
                onClick={handleDeposit}
                className="w-32 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white 
                         font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 
                         transition-all duration-200 shadow-lg hover:shadow-xl whitespace-nowrap"
              >
                Deposit
              </button>
            </div>
          </div>

          {/* Withdraw Section */}
          <div className="space-y-4">
            <label className="block text-gray-100 font-medium mb-2">Withdraw Funds</label>
            <div className="flex gap-4">
              <input
                type="number"
                min="0"
                step="0.0001"
                value={withdrawValue}
                onChange={(e) => setWithdrawValue(e.target.value)}
                placeholder="Amount in ETH"
                className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-600 text-gray-100
                         rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 
                         focus:border-transparent placeholder-gray-500"
                required
              />
              <button 
                onClick={handleWithdraw}
                className="w-32 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white 
                         font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 
                         transition-all duration-200 shadow-lg hover:shadow-xl whitespace-nowrap"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractActions;
