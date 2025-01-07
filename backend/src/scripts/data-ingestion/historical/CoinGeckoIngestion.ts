import { getConnection } from '../../config/snowflake.config';
import { CoinGeckoService } from '../../services/coingecko.service';

export class CoinGeckoIngestion {
    private connection;
    private coinGecko: CoinGeckoService;
    
    constructor() {
        this.connection = getConnection();
        this.coinGecko = new CoinGeckoService();
    }

    async ingestHistoricalData() {
        try {
            // 1. Get all active assets
            const assets = await this.getActiveAssets() as Array<{ASSET_ID: string, COINGECKO_ID: string}>;
            console.log(`Found ${assets.length} active assets to process`);

            // 2. Process each asset
            for (const asset of assets) {
                try {
                    console.log(`Processing ${asset.ASSET_ID}...`);
                    
                    const historicalData = await this.coinGecko.getHistoricalRangeData(
                        asset.COINGECKO_ID,
                        new Date('2013-04-28').getTime(), // Bitcoin's first date on CoinGecko
                        new Date().getTime()
                    );

                    // Insert data
                    await this.insertHistoricalData(asset.ASSET_ID, historicalData);
                    console.log(`Successfully processed ${asset.ASSET_ID}`);
                    
                    // Rate limiting
                    await new Promise(resolve => setTimeout(resolve, 1000));

                } catch (error) {
                    console.error(`Error processing ${asset.ASSET_ID}:`, error);
                    continue;
                }
            }
        } catch (error) {
            console.error('Fatal error during ingestion:', error);
            throw error;
        }
    }

    private async getActiveAssets() {
        return new Promise((resolve, reject) => {
            this.connection.execute({
                sqlText: `
                    SELECT ASSET_ID, COINGECKO_ID 
                    FROM PUBLIC.ASSETS 
                    WHERE IS_ACTIVE = true
                `,
                complete: (err, stmt, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            });
        });
    }

    private async insertHistoricalData(assetId: string, data: any) {
        const { prices, market_caps, total_volumes } = data;
        
        return new Promise((resolve, reject) => {
            this.connection.execute({
                sqlText: `
                    INSERT INTO PUBLIC.PRICE_HISTORY_COMPLETE (
                        ASSET_ID,
                        TIMESTAMP,
                        PRICE_USD,
                        MARKET_CAP_USD,
                        VOLUME_24H_USD,
                        CREATED_AT
                    )
                    SELECT column1, column2, column3, column4, column5, CURRENT_TIMESTAMP()
                    FROM VALUES ${prices.map((price: any, index: number) => `(
                        '${assetId}',
                        TO_TIMESTAMP_NTZ(${price[0] / 1000}),
                        ${price[1]},
                        ${market_caps[index][1]},
                        ${total_volumes[index][1]}
                    )`).join(',')}
                `,
                complete: (err) => {
                    if (err) reject(err);
                    else resolve(true);
                }
            });
        });
    }
}
