import LOCK_ABI from './Lock_ABI.json';
import { toast } from 'react-toastify';
import { BrowserProvider, Contract, parseEther, formatEther, JsonRpcSigner } from 'ethers';
import { CONTRACT_ADDRESS } from './constants';

// Module level variables to store provider, signer, and contract
let provider: BrowserProvider;
let signer: JsonRpcSigner;
let contract: Contract;

declare global {
  interface Window {
    ethereum?: any;
  }
}

const initializeContract = async () => {
  if (typeof window.ethereum !== 'undefined') {
    provider = new BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    contract = new Contract(CONTRACT_ADDRESS, LOCK_ABI, signer);
  } else {
    toast.error('Please install metamask!');
  }
};

// Initialize contract
initializeContract();

// Function to request account
export const requestAccount = async () => {
  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    return accounts[0]; // return the first account
  } catch (error: any) {
    toast.error('Error requesting account', error.message);
    return null;
  }
};

export const getContractBalance = async () => {
  try {
    const balance = await contract.getContractBalance();  // Call the contract's function
    return formatEther(balance);
  } catch (error) {
    console.error('Error getting contract balance:', error);
    return '0';
  }
};

// Function to get wallet balance in Eth (FYI, 1 eth = 10^18 wei!)
export const getWalletBalanceInEth = async (account: string) => {
  try {
    provider = new BrowserProvider(window.ethereum);
    const balanceWei = await provider.getBalance(account);
    const balanceEth = formatEther(balanceWei);
    return balanceEth;
  } catch (error) {
    console.error('Error in getWalletBalanceInEth:', error);
    return '0';
  }
};

// Function to deposit ETH into the contract
export const depositFunds = async (depositValue: string) => {
  const ethValue = parseEther(depositValue);
  toast.info(`Depositing ${depositValue} ETH into the contract...`);
  const depositTx = await contract.deposit({ value: ethValue });
  await depositTx.wait();
  toast.success(`Deposit successful!`);
};

// Function to withdraw ETH from the contract
export const withdrawFunds = async (withdrawValue: string) => {
  try {
    const ethValue = parseEther(withdrawValue);
    toast.info(`Withdrawing ${withdrawValue} ETH from the contract...`);
    const withdrawTx = await contract.withdraw(ethValue);
    await withdrawTx.wait();
    toast.success(`Withdrawal successful!`);
  } catch (error: any) {
    toast.error(`Error withdrawing funds: ${error.message}`);
    throw error;
  }
};
