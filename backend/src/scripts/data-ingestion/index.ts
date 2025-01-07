import { config } from 'dotenv';
import { resolve } from 'path';
import { AssetIngestion } from './Assets/BatchAssetIngestion';
import { connectToSnowflake } from '../../config/snowflake.config';

// Load .env from backend folder
config({ path: resolve(__dirname, '../../.env') });

async function main() {
    try {
        // First, initialize Snowflake connection
        console.log('Connecting to Snowflake...');
        await connectToSnowflake('PUBLIC');
        console.log('Snowflake connection established');

        // Then create AssetIngestion instance
        console.log('Initializing asset ingestion...');
        const ingestion = new AssetIngestion();
        
        // Process top 200 coins
        await ingestion.ingestAssets(200);
        
        console.log('Asset ingestion completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

main();