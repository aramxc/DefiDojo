import LOCK_ABI from './abi/Lock_ABI.json';
import { toast } from 'react-toastify';
import { BrowserProvider, Contract, parseEther, formatEther, JsonRpcSigner } from 'ethers';
import { CONTRACT_ADDRESS } from '../../config/constants';

// Module level variables to store provider, signer, and contract
let provider: BrowserProvider;
let signer: JsonRpcSigner;
let contract: Contract;
let isInitializing = false;
let isProcessingRequest = false;

declare global {
  interface Window {
    ethereum?: any;
  }
}

const initializeContract = async () => {
    if (isInitializing) {
        // Wait for initialization to complete
        while (isInitializing) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return;
    }
    
    if (contract) return; // Already initialized
    
    try {
        isInitializing = true;
        if (typeof window.ethereum !== 'undefined') {
            provider = new BrowserProvider(window.ethereum);
            signer = await provider.getSigner();
            contract = new Contract(CONTRACT_ADDRESS, LOCK_ABI, signer);
        } else {
            throw new Error('Please install metamask!');
        }
    } catch (error) {
        console.error('Error initializing contract:', error);
        throw error;
    } finally {
        isInitializing = false;
    }
};

// Function to request account
export const requestAccount = async () => {
  if (isProcessingRequest) {
    console.log('Request already in progress');
    return null;
  }

  try {
    isProcessingRequest = true;
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    return accounts[0];
  } catch (error: any) {
    toast.error('Error requesting account', error.message);
    return null;
  } finally {
    isProcessingRequest = false;
  }
};

export const getContractBalance = async (): Promise<string> => {
  try {
    await initializeContract();
    const balance = await contract.getContractBalance();
    return formatEther(balance.toString());
  } catch (error) {
    console.error('Error getting contract balance:', error);
    return '0';
  }
};

// Function to get wallet balance in Eth (FYI, 1 eth = 10^18 wei!)
export const getWalletBalanceInEth = async (account: string): Promise<string> => {
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
// Function to fetch both contract and wallet balances at once
export const fetchBalances = async (account: string) => {
  try {
    const contractBal = await getContractBalance();
    const walletBal = await getWalletBalanceInEth(account);
    return {
      contractBalance: Number(contractBal),
      walletBalance: Number(walletBal)
    };
  } catch (error) {
    console.error('Error fetching balances', error);
    return {
      contractBalance: 0,
      walletBalance: 0
    };
  }
};

// Function to deposit ETH into the contract
export const depositFunds = async (depositValue: string): Promise<void> => {
  try {
    await initializeContract();
    const ethValue = parseEther(depositValue);
    toast.info(`Depositing ${depositValue} ETH into the contract...`);
    const depositTx = await contract.deposit({ value: ethValue });
    await depositTx.wait();
    toast.success(`Deposit successful!`);
  } catch (error: any) {
    toast.error(`Error depositing funds: ${error.message}`);
    throw error;
  }
};

// Function to withdraw ETH from the contract
export const withdrawFunds = async (withdrawValue: string): Promise<void> => {
  try {
    await initializeContract();
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

export const checkProAccess = async (symbol: string): Promise<boolean> => {
  try {
    await initializeContract();
    const hasAccess = await contract.hasProAccess(symbol);
    return hasAccess;
  } catch (error) {
    console.error('Error checking pro access:', error);
    return false;
  }
};

export const purchaseProAccess = async (symbol: string): Promise<void> => {
  try {
    await initializeContract();
    const price = await contract.getProAccessPrice();
    toast.info(`Purchasing pro access for ${symbol}...`);
    const purchaseTx = await contract.purchaseProAccess(symbol, { value: price });
    await purchaseTx.wait();
    toast.success(`Successfully purchased pro access for ${symbol}!`);
  } catch (error: any) {
    toast.error(`Error purchasing pro access: ${error.message}`);
    throw error;
  }
};

