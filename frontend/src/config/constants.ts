import Lock_ABI from '../services/web3/abi/Lock_ABI.json';
import { parseEther } from 'ethers';

export const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // local hardhat address
export const CONTRACT_ABI = Lock_ABI;

export const API_BASE_URL = 'http://localhost:8080/api'; // local backend address

// Define the default ticker symbols
export const TICKER_SYMBOLS = ['ADA', 'APT', 'DOGE', 'ETH', 'BTC', 'SOL', 'SUI', 'XRP'].sort();

// Web3 Constants
export const PRO_ACCESS_PRICE_ETH = 0.01; // 0.01 ETH
export const PRO_ACCESS_FEATURES = {
    '5Y': {
        price: PRO_ACCESS_PRICE_ETH,
        features: [
            '5 Year Historical Data',
            'Advanced Technical Indicators',
            'Real-time Market Insights'
        ]
    }
    // Add more premium features here
};

// Convert ETH to Wei for smart contract interactions
export const PRO_ACCESS_PRICE_WEI = parseEther(PRO_ACCESS_PRICE_ETH.toString());