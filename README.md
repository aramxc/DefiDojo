# Welcome to the Dojo! 🥷
Project Goal:

To build a decentralized crypto analytics and learning platform that helps users discover and reward the best educational content in the Web3 and Defi space. Users can see price analytics for most of the top trading cryptocurrencies in terms of market cap (adding more in the future), find learning resources on each, vote on the most helpful content, and eventually reward content creators and other community members directly through smart contracts.

Check back soon for updates! Currently in the process of building out frontend components..

~ Aaron

[Dojo Platform Demo](https://www.loom.com/share/8b38458278704f8396ae61abcd7b64ad)

Current state as of 1/12/25 ^

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
5. Run `npm run dev` to start all services locally

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

### Future Improvements / TODO's

#### Features
- **User Profiles:** Allow users to create and customize profiles to track their learning progress and contributions.
- **Content Curation:** Implement a recommendation system to suggest content based on user preferences and past interactions.
- **Gamification:** Introduce badges and leaderboards to encourage user engagement and content creation.
- **Mobile Support:** Develop a mobile-friendly version of the platform for better accessibility.

#### Enhanced Styling
- **Responsive Design:** Ensure the platform is fully responsive across all devices and screen sizes.
- **Dark Mode:** Add a dark mode option for users who prefer a different visual experience.
- **Custom Themes:** Allow users to select from a variety of themes to personalize their interface.
- **Improved UI/UX:** Continuously refine the user interface and experience based on user feedback and testing.
