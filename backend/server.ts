import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import { EvmPriceServiceConnection, PriceFeed } from '@pythnetwork/pyth-evm-js';

// Initialize Express
const app = express();

// Configure middleware
app.use(cors());
app.use(express.json());

// Create Pyth connection instance
const connection = new EvmPriceServiceConnection(
  'https://xc-mainnet.pyth.network'
);

// Routes:
app.get('/', (req: Request, res: Response) => {
  res.send("Welcome to the server!");
});

app.get('/api', async (req: Request, res: Response) => {
  res.json({ message: 'Hello, World!' });
});

// TODO: Add endpoint for current price and price feeds:


// Add health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start the server
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 8080; // default to 8080, TODO: make this dynamic / use env variable
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});