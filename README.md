# Web3 Academy (Under Construction!)
Project Goal:

To build a decentralized learning platform that helps users discover and reward the best educational content in the Web3 space. Users can search for learning resources, vote on the most helpful content, and reward content creators directly through smart contracts.

Check back soon for updates! Currently in the process of building out frontend components..

~ Aaron

![120224_current_state](https://github.com/user-attachments/assets/5e3cfd24-a884-40d9-bbd9-fdaa9375fde8)

Current state as of 12/2/24 ^

## Getting Started

### Prerequisites
- Node.js v18 or higher (Required)
  ```bash
  # If using nvm:
  nvm use 18
  ```
- Hardhat
- MetaMask wallet

### Setup Options

#### Option 1: Quick Start (Recommended)
1. Clone the repository
2. Run `npm install` in the root directory to install root dependencies
3. Check node version: `node -v` and make sure you have v18 or higher
4. Run `npm run install-all` to install all workspace dependencies
5. Run `npm run dev` to start all services

This will automatically:
- Start the local Hardhat node
- Deploy smart contracts to your local network
- Start the backend server
- Launch the frontend client

#### Option 2: Manual Setup
If you prefer to run services individually:

1. Clone the repository
2. Install dependencies in frontend and backend subdirectories
3. Navigate to '/contracts' and run `npx hardhat node` to initialize the local blockchain
4. Navigate to '/contracts' and run `npx hardhat run scripts/deploy.js --network localhost` to deploy the smart contracts
5. Navigate to '/backend' and run `npm run start-local` to start the backend server
6. Navigate to '/frontend' and run `npm start` to start the frontend client

### Available Scripts
- `npm run install-all` - Install all dependencies across workspaces
- `npm run start-node` - Start local Hardhat node
- `npm run deploy-contracts` - Deploy contracts to local network
- `npm run start-backend` - Start backend server
- `npm run start-frontend` - Start frontend development server
- `npm run dev` - Start all services in the correct order

