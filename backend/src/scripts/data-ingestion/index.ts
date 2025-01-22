import { config } from 'dotenv';
import { resolve } from 'path';
import { connectToSnowflake } from '../../config/snowflake.config';
import { AssetIngestion } from './assets/BatchAssetIngestion';
import { HistoricalDataIngestion } from './historical/BatchPriceHistoryIngestion';

// Load .env from backend folder
config({ path: resolve(__dirname, '../../.env') });

async function main() {
    try {
        // First, initialize Snowflake connection
        console.log('Connecting to Snowflake...');
        await connectToSnowflake('PUBLIC');
        console.log('Snowflake connection established');

        // Determine which ingestion script to run
        const scriptToRun = process.argv[2]; // Get the script name from command-line arguments
        const numberOfCoins = parseInt(process.argv[3], 10) || 200; // Default to 200 if not specified

        switch (scriptToRun) {
            case 'assets':
                console.log('Initializing asset ingestion...');
                const assetIngestion = new AssetIngestion();
                await assetIngestion.ingestAssets(numberOfCoins); 
                console.log('Asset ingestion completed successfully');
                break;

            case 'historical':
                console.log('Initializing historical data ingestion...');
                const historicalIngestion = new HistoricalDataIngestion();
                await historicalIngestion.ingestHistoricalData(numberOfCoins);
                console.log('Historical data ingestion completed successfully');
                break;

            default:
                console.log('No valid script specified. Please use "assets" or "historical".');
                break;
        }

        process.exit(0);
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

main();