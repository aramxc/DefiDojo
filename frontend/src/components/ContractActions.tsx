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

      console.log('Deposit value:', depositValue);
      await depositFunds(depositValue);
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
    <div>
      <h2>Contract Actions</h2>
      <div>
        <input
          type="number"
          min="0"
          step="0.0001"
          value={depositValue}
          onChange={(e) => setDepositValue(e.target.value)}
          placeholder="Amount in ETH"
          required
        />
        <button onClick={handleDeposit}>Deposit Funds</button>
      </div>
      <br />
      <div>
        <input
          type="number"
          min="0"
          step="0.0001"
          value={withdrawValue}
          onChange={(e) => setWithdrawValue(e.target.value)}
          placeholder="Amount in ETH"
          required
        />
        <button onClick={handleWithdraw}>Withdraw Funds</button>
      </div>
    </div>
  );
};

export default ContractActions;
