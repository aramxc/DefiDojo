require('dotenv').config();

/*
* Flipside Crypto API Key: https://docs.flipsidecrypto.com/api-reference/api-keys
*/
if (!process.env.FLIPSIDE_CRYPTO_API_KEY) {
  throw new Error('FLIPSIDE_CRYPTO_API_KEY is not defined in .env file');
}

/*
* CoinGecko API Key: https://www.coingecko.com/en/developers/dashboard
*/
if (!process.env.COINGECKO_API_KEY) {
  throw new Error('COINGECKO_API_KEY is not defined in .env file');
}

export const config = {
  flipsideCryptoApiKey: process.env.FLIPSIDE_CRYPTO_API_KEY,
  flipsideBaseUrl: 'https://api-v2.flipsidecrypto.xyz',
  pythHermesBaseUrl: 'https://hermes.pyth.network', // no api key required
  coinGeckoApiKey: process.env.COINGECKO_API_KEY,
  coinGeckoBaseUrl: 'https://api.coingecko.com/api/v3'
};



/* 
* Used for instant price feeds from Pyth Network:
* pyth ids can be found here: https://www.pyth.network/developers/price-feed-ids
*/
export const SYMBOL_TO_PYTH_ID: Record<string, string> = {
  'ADA': '0x2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42fecd2829867a0d',
  'BTC': '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
  'DOGE': '0xdcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c',
  'ETH': '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  'SOL': '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
  'SUI': '0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744',
  'XRP': '0xec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8'
  // Add more mappings as needed
};

export const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  'ADA': 'cardano',
  'BTC': 'bitcoin',
  'DOGE': 'dogecoin',
  'ETH': 'ethereum',
  'SOL': 'solana',
  'SUI': 'sui',
  'XRP': 'ripple'
  // Add more mappings as needed
};


