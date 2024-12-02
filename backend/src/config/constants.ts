require('dotenv').config();

// Flipside Crypto API Key: https://docs.flipsidecrypto.com/api-reference/api-keys
if (!process.env.FLIPSIDE_CRYPTO_API_KEY) {
  throw new Error('FLIPSIDE_CRYPTO_API_KEY is not defined in .env file');
}

export const config = {
  flipsideCryptoApiKey: process.env.FLIPSIDE_CRYPTO_API_KEY,
  flipsideBaseUrl: 'https://api-v2.flipsidecrypto.xyz',
  pythHermesBaseUrl: 'https://hermes.pyth.network' // no api key required
};

export const SYMBOL_TO_PYTH_ID: Record<string, string> = {
  // pyth ids can be found here: https://www.pyth.network/developers/price-feed-ids
  'BTC': '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
  'ETH': '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  'SOL': '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
  // Add more mappings as needed
};

