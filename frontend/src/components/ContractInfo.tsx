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
    <div>
      <h2>Contract Info</h2>
      <div>Account: {account}</div>
      <div>Balance: {balance} ETH</div>
    </div>
  );
};

export default ContractInfo;
