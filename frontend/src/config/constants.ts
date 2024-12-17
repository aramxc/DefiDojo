import Lock_ABI from '../services/web3/abi/Lock_ABI.json';

export const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // local hardhat address
export const CONTRACT_ABI = Lock_ABI;

export const API_BASE_URL = 'http://localhost:8080/api'; // local backend address

// Define the default ticker symbols
export const DEFAULT_TICKER_SYMBOLS = ['ETH', 'BTC', 'SOL'];