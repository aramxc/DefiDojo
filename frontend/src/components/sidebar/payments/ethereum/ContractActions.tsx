import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { depositFunds, withdrawFunds } from '../../../../services/web3/contract.service';

interface ContractActionsProps {
  onSuccess?: () => void;
}

const ContractActions: React.FC<ContractActionsProps> = ({ onSuccess }) => {
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
      onSuccess?.();
      
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
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.reason || error.message);
    }
    setWithdrawValue('');
  };

  return (
    <div className="space-y-4">
      {/* Deposit Section */}
      <div className="space-y-2">
        <label className="block text-gray-100 text-sm font-medium">Deposit Funds</label>
        <div className="grid grid-cols-[1fr,100px] gap-2">
          <input
            type="number"
            min="0"
            step="0.0001"
            value={depositValue}
            onChange={(e) => setDepositValue(e.target.value)}
            placeholder="ETH"
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 text-gray-100
                     rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 
                     focus:border-transparent placeholder-gray-500 text-sm"
          />
          <button 
            onClick={handleDeposit}
            className="w-[100px] px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white 
                     text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 
                     transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Deposit
          </button>
        </div>
      </div>

      {/* Withdraw Section */}
      <div className="space-y-2">
        <label className="block text-gray-100 text-sm font-medium">Withdraw Funds</label>
        <div className="grid grid-cols-[1fr,100px] gap-2">
          <input
            type="number"
            min="0"
            step="0.0001"
            value={withdrawValue}
            onChange={(e) => setWithdrawValue(e.target.value)}
            placeholder="ETH"
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 text-gray-100
                     rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 
                     focus:border-transparent placeholder-gray-500 text-sm"
          />
          <button 
            onClick={handleWithdraw}
            className="w-[100px] px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white 
                     text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 
                     transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Withdraw
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractActions;
