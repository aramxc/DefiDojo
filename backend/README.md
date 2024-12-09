# Crypto Learning API

- This API provides a simple way to access crypto learning resources and price feeds. Uses both Flipside Crypto, CoinGecko, and Pyth Network APIs.
- API is deployed on ___ and is available at ___. # TODO: add deployment details
- API is built with TypeScript and Express and follows a MVC (Model-View-Controller) architecture.
 - Routes define API endpoints (e.g. /api/prices/latest)
 - Controllers contain the logic for handling requests and responses
 - Services contain the logic for fetching data from external APIs

## Frontend Implementation

example: 
```typescript
export const getPrices = async (symbols: string[]) => {
  const response = await fetch(`/api/prices/latest?symbols=${symbols.join(',')}`);
  if (!response.ok) throw new Error('Failed to fetch prices');
  return response.json();
};

export const getLearningResources = async (topic: string) => {
  const response = await fetch(`/api/learning/resources?topic=${encodeURIComponent(topic)}`);
  if (!response.ok) throw new Error('Failed to fetch resources');
  return response.json();
};
```

## API Documentation:

### Flipside Crypto API Docs: https://docs.flipsidecrypto.com/api-reference

### Hermes API - Pyth Network Docs: https://hermes.pyth.network/docs/#/

### CoinGecko API Docs: https://docs.coingecko.com/v3.0.1/reference/introduction
