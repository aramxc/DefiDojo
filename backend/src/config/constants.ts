import path from 'path';
import dotenv from 'dotenv';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  flipside: {
    apiKey: process.env.FLIPSIDE_CRYPTO_API_KEY || null,
    baseUrl: 'https://api-v2.flipsidecrypto.xyz'
  },
  pythHermesBaseUrl: 'https://hermes.pyth.network',
  coinGecko: {
    apiKey: process.env.COINGECKO_API_KEY,
    proApiKey: process.env.COINGECKO_PRO_API_KEY,
    baseUrl: 'https://api.coingecko.com/api/v3',
    proBaseUrl: 'https://pro-api.coingecko.com/api/v3'
  },
  coinmarketcap: {
    apiKey: process.env.COINMARKETCAP_API_KEY,
    baseUrl: 'https://pro-api.coinmarketcap.com/v3'
  },
  google: {
    apiKey: process.env.GOOGLE_CSE_API_KEY,
    baseUrl: 'https://www.googleapis.com/customsearch/v1',
    searchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID
  },
  nebula: {
    clientId: process.env.NEBULA_CLIENT_ID,
    secretKey: process.env.NEBULA_SECRET_KEY,
    baseUrl: 'https://nebula-api.thirdweb.com'
  }
};

// Move validation to where it's actually needed
export const validateFlipsideKey = () => {
  if (!config.flipside.apiKey) {
    throw new Error('FLIPSIDE_CRYPTO_API_KEY is not defined in .env file');
  }
};

export const validateCoinGeckoKey = () => {
  if (config.coinGecko.proBaseUrl && !config.coinGecko.proApiKey) {
    throw new Error('COINGECKO_PRO_API_KEY is not defined in .env file');
  }
  return true;
};

export const validateNebulaKey = () => {
  if (!config.nebula.secretKey) {
    throw new Error('Nebula API key is not configured');
  }
};

export const SYMBOL_TO_PYTH_ID: Record<string, string> = {
  'ADA': '0x2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42fecd2829867a0d',
  'APT': '0x03ae4db29ed4ae33d323568895aa00337e658e348b37509f5372ae51f0af00d5',
  'BTC': '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
  'DOGE': '0xdcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c',
  'ETH': '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  'SOL': '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
  'SUI': '0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744',
  'XRP': '0xec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8'
};

export const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  'ADA': 'cardano',
  'APT': 'aptos',
  'BTC': 'bitcoin',
  'DOGE': 'dogecoin',
  'ETH': 'ethereum',
  'SOL': 'solana',
  'SUI': 'sui',
  'XRP': 'ripple'
};


