import LOCK_ABI from './abi/Lock_ABI.json';
import { toast } from 'react-toastify';
import { BrowserProvider, Contract, parseEther, formatEther, JsonRpcSigner } from 'ethers';
import { CONTRACT_ADDRESS } from '../../config/constants';

// Module level variables to store provider, signer, and contract instances
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

/**
 * Initializes the contract instance with MetaMask provider
 * Ensures only one initialization process runs at a time
 * @throws Error if MetaMask is not installed or initialization fails
 */
const initializeContract = async () => {
    if (isInitializing) {
        // Wait for initialization to complete if already in progress
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
            throw new Error('Please install MetaMask!');
        }
    } catch (error) {
        console.error('Error initializing contract:', error);
        throw error;
    } finally {
        isInitializing = false;
    }
};

/**
 * Requests user's MetaMask account
 * @returns Promise containing the connected account address or null if request fails
 */
export const requestAccount = async () => {
  if (isProcessingRequest) {
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

/**
 * Fetches the current balance of the smart contract
 * @returns Promise containing contract balance in ETH as string
 */
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

/**
 * Fetches the wallet balance for a given account
 * @param account Ethereum address to check balance for
 * @returns Promise containing wallet balance in ETH as string
 */
export const getWalletBalanceInEth = async (account: string): Promise<string> => {
  try {
    provider = new BrowserProvider(window.ethereum);
    const balanceWei = await provider.getBalance(account);
    return formatEther(balanceWei);
  } catch (error) {
    console.error('Error in getWalletBalanceInEth:', error);
    return '0';
  }
};

/**
 * Fetches both contract and wallet balances in a single call
 * @param account Ethereum address to check wallet balance for
 * @returns Promise containing both balances as numbers
 */
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

/**
 * Deposits ETH into the smart contract
 * @param depositValue Amount of ETH to deposit as string
 * @throws Error if deposit fails
 */
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

/**
 * Withdraws ETH from the smart contract
 * @param withdrawValue Amount of ETH to withdraw as string
 * @throws Error if withdrawal fails
 */
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

/**
 * Checks if an address has pro access for a given symbol
 * @param symbol Trading symbol to check access for
 * @returns Promise containing boolean indicating access status
 */
export const checkProAccess = async (symbol: string): Promise<boolean> => {
  try {
    await initializeContract();
    return await contract.hasProAccess(symbol);
  } catch (error) {
    console.error('Error checking pro access:', error);
    return false;
  }
};

/**
 * Purchases pro access for a given symbol
 * @param symbol Trading symbol to purchase access for
 * @throws Error if purchase fails
 */
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

