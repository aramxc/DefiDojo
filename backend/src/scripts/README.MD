# Data Collection Documentation

## Running Data Ingestion Scripts

To run the data ingestion scripts, follow these steps:

### Prerequisites

- Ensure you have Node.js and `ts-node` installed on your system.
- Navigate to the backend directory where the scripts are located.

### Running the Historical Data Ingestion Script

1. **Navigate to the Script Directory**:
   Open your terminal and navigate to the `backend` directory:

   ```bash
   cd backend/
   ```

2. **Run the Script**:
   Use the following command to run the historical data ingestion script for the top 200 coins:

   ```bash
   ts-node src/scripts/data-ingestion/index.ts historical 200
   ```

   - Replace `200` with the desired number of top coins you want to process.

### Running the Asset Ingestion Script

1. **Navigate to the Script Directory**:
   Ensure you are in the `data-ingestion` directory:

   ```bash
   cd backend/src/scripts/data-ingestion
   ```

2. **Run the Script**:
   Use the following command to run the asset ingestion script:

   ```bash
   ts-node src/scripts/data-ingestion/index.ts assets 200
   ```

   - Replace `200` with the desired number of top coins you want to process.

### Notes

- Ensure your environment variables are correctly set up in the `.env` file located in the `backend` directory.
- The scripts will connect to Snowflake and perform the necessary data ingestion tasks based on the specified parameters.
