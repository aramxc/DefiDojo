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

