import { getConnection } from '../../../config/snowflake.config';
import { CoinGeckoService } from '../../../services/external/coingecko/coingecko.service';

export class HistoricalDataIngestion {
    private connection;
    private coinGecko: CoinGeckoService;
    private requestCount = 0;
    private lastRequestTime = Date.now();

    // Rate limiting parameters
    private readonly RATE_LIMIT_PER_MINUTE = 400;
    private readonly MIN_REQUEST_INTERVAL = 5000; // 5 seconds between requests
    private readonly RATE_LIMIT_RESET_TIME = 60000; // 1 minute
    private readonly MAX_RETRIES = 3;

    constructor() {
        this.connection = getConnection();
        this.coinGecko = new CoinGeckoService();
    }

    protected async rateLimit() {
        this.requestCount++;

        // Always wait minimum interval between requests
        const timeSinceLastRequest = Date.now() - this.lastRequestTime;
        if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
            const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        // Check if we need to wait for next minute window
        if (this.requestCount >= this.RATE_LIMIT_PER_MINUTE) {
            const elapsedTime = Date.now() - this.lastRequestTime;
            if (elapsedTime < this.RATE_LIMIT_RESET_TIME) {
                const waitTime = this.RATE_LIMIT_RESET_TIME - elapsedTime;
                console.log(`Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)} seconds...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
            console.log('Resetting rate limit counter');
            this.requestCount = 0;
            this.lastRequestTime = Date.now();
        }

        this.lastRequestTime = Date.now();
    }

    protected async retryWithBackoff(operation: () => Promise<any>, retryCount = 0): Promise<any> {
        try {
            return await operation();
        } catch (error: any) {
            if (error?.response?.status === 429 && retryCount < this.MAX_RETRIES) {
                const waitTime = Math.pow(2, retryCount) * 10000; // Exponential backoff: 10s, 20s, 40s
                console.log(`Rate limit hit, waiting ${waitTime / 1000} seconds before retry ${retryCount + 1}...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                return this.retryWithBackoff(operation, retryCount + 1);
            }
            throw error;
        }
    }

    async ingestHistoricalData(numberOfCoins: number = 200) {
        try {
            const assets = await this.getTopAssets(numberOfCoins);
            
            if (!Array.isArray(assets)) {
                throw new Error(`Expected array of assets, got ${typeof assets}`);
            }

            if (assets.length === 0) {
                console.warn('No assets found in database. Have you run the asset ingestion first?');
                return;
            }

            // Initialize counters
            let processedCount = 0;
            let skippedCount = 0;
            let errorCount = 0;
            let currentCount = 0;  // Add this counter for progress tracking

            console.log(`Found ${assets.length} top assets to process`);

            for (const asset of assets) {
                try {
                    currentCount++;  // Increment at the start of each iteration
                    console.log(`\nProcessing ${currentCount}/${assets.length}: ${asset.ASSET_ID}...`);

                    const lastTimestamp = await this.getLastTimestamp(asset.ASSET_ID);
                    const toDate = new Date();
                    toDate.setHours(0, 0, 0, 0);
                    let fromDate: Date;

                    if (lastTimestamp) {
                        fromDate = new Date(lastTimestamp);
                        console.log(`Continuing from last record: ${fromDate.toISOString()}`);
                    } else {
                        fromDate = new Date('2013-04-28T00:00:00.000Z');
                        console.log(`Starting fresh from: ${fromDate.toISOString()}`);
                    }

                    // Skip if we're already up to date
                    if (lastTimestamp && (toDate.getTime() - lastTimestamp.getTime()) < 24 * 60 * 60 * 1000) {
                        console.log(`${asset.ASSET_ID} is up to date, skipping...`);
                        skippedCount++;
                        continue;
                    }

                    console.log('Date range:', {
                        asset: asset.COINGECKO_ID,
                        from: fromDate.toISOString(),
                        to: toDate.toISOString(),
                        fromTimestamp: Math.floor(fromDate.getTime() / 1000),
                        toTimestamp: Math.floor(toDate.getTime() / 1000)
                    });

                    await this.rateLimit();
                    const historicalData = await this.retryWithBackoff(() => this.coinGecko.getHistoricalRangeData(
                        asset.COINGECKO_ID,
                        fromDate.getTime(),
                        toDate.getTime()
                    ));

                    await this.insertHistoricalData(asset.ASSET_ID, historicalData);
                    console.log(`Successfully processed ${asset.ASSET_ID}`);
                    processedCount++;

                } catch (error: any) {
                    console.error(`Error processing ${asset.ASSET_ID}:`, error?.response?.data || error);
                    errorCount++;
                    continue;
                }
            }

            // Log summary with all counters
            console.log('\nIngestion Summary:');
            console.log(`Total assets: ${assets.length}`);
            console.log(`Successfully processed: ${processedCount}`);
            console.log(`Skipped (up to date): ${skippedCount}`);
            console.log(`Errors: ${errorCount}`);
            console.log(`Total processed + skipped + errors: ${processedCount + skippedCount + errorCount}`);

            console.log('\nVerifying data completeness...');
            await this.verifyDataIngestion();
            
        } catch (error) {
            console.error('Fatal error during ingestion:', error);
            throw error;
        }
    }

    private async getTopAssets(limit: number) {
        return new Promise((resolve, reject) => {
            this.connection.execute({
                sqlText: `
                    SELECT ASSET_ID, COINGECKO_ID 
                    FROM PUBLIC.ASSETS 
                    WHERE IS_ACTIVE = true
                    AND COINGECKO_ID IS NOT NULL
                    ORDER BY MARKET_CAP_RANK ASC
                    LIMIT ${limit}
                `,
                complete: function(err, stmt, rows) {
                    if (err) {
                        console.error('Error fetching assets:', err);
                        reject(err);
                    } else {
                        // Debug logging
                        console.log('Raw Snowflake response:', { stmt, rows });
                        
                        // Ensure we're returning an array
                        const assets = Array.isArray(rows) ? rows : [];
                        console.log(`Processed ${assets.length} assets`);
                        
                        resolve(assets);
                    }
                }
            });
        });
    }

    private async insertHistoricalData(assetId: string, data: any) {
        const { prices, market_caps, total_volumes } = data;

        if (!prices?.length || !market_caps?.length || !total_volumes?.length) {
            console.warn(`No data available for ${assetId}`);
            return;
        }

        // Debug log to see the data structure
        console.log('Sample data point:', {
            firstPrice: prices[0],
            firstMarketCap: market_caps[0],
            firstVolume: total_volumes[0]
        });

        return new Promise((resolve, reject) => {
            try {
                const values = prices.map((price: any, index: number) => {
                    // Ensure all required data exists for this index
                    if (!price?.[0] || !price?.[1] || !market_caps?.[index]?.[1] || !total_volumes?.[index]?.[1]) {
                        console.warn(`Skipping incomplete data point at index ${index}`);
                        return null;
                    }

                    return `(
                        '${assetId}',
                        TO_TIMESTAMP_NTZ(${Math.floor(price[0] / 1000)}),
                        ${price[1]},
                        ${market_caps[index][1]},
                        ${total_volumes[index][1]}
                    )`;
                })
                .filter((value: string | null) => value !== null) // Remove any null values
                .join(',');

                if (!values) {
                    console.warn(`No valid data points for ${assetId}`);
                    resolve(false);
                    return;
                }

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
                        FROM VALUES ${values}
                    `,
                    complete: (err) => {
                        if (err) {
                            console.error(`Error inserting data for ${assetId}:`, err);
                            reject(err);
                        } else {
                            resolve(true);
                        }
                    }
                });
            } catch (error) {
                console.error(`Error processing data for ${assetId}:`, error);
                reject(error);
            }
        });
    }

    private async getLastTimestamp(assetId: string): Promise<Date | null> {
        return new Promise((resolve, reject) => {
            this.connection.execute({
                sqlText: `
                    SELECT MAX(TIMESTAMP) as last_timestamp
                    FROM PUBLIC.PRICE_HISTORY_COMPLETE
                    WHERE ASSET_ID = ?
                `,
                binds: [assetId],
                complete: function(err, _stmt, rows) {
                    if (err) {
                        reject(err);
                    } else {
                        const lastTimestamp = rows?.[0]?.LAST_TIMESTAMP;
                        resolve(lastTimestamp ? new Date(lastTimestamp) : null);
                    }
                }
            });
        });
    }

    private async verifyDataIngestion() {
        return new Promise((resolve, reject) => {
            this.connection.execute({
                sqlText: `
                    SELECT 
                        ASSET_ID,
                        COUNT(*) as total_records,
                        CONVERT_TIMEZONE('UTC', 'America/Denver', MIN(TIMESTAMP)) as earliest_date,
                        CONVERT_TIMEZONE('UTC', 'America/Denver', MAX(TIMESTAMP)) as latest_date,
                        DATEDIFF('day', MIN(TIMESTAMP), MAX(TIMESTAMP)) as days_covered,
                        COUNT(*) / NULLIF(DATEDIFF('day', MIN(TIMESTAMP), MAX(TIMESTAMP)), 0) as avg_records_per_day
                    FROM PUBLIC.PRICE_HISTORY_COMPLETE
                    GROUP BY ASSET_ID
                    ORDER BY MIN(TIMESTAMP) ASC
                `,
                complete: function(err, _stmt, rows) {
                    if (err) {
                        console.error('Error verifying data:', err);
                        reject(err);
                    } else {
                        console.log('\nData Verification Summary:');
                        
                        // Format the data for console.table
                        const formattedRows = rows?.map((row: any) => ({
                            ASSET_ID: row.ASSET_ID,
                            TOTAL_RECORDS: row.TOTAL_RECORDS,
                            EARLIEST_DATE: row.EARLIEST_DATE ? new Date(row.EARLIEST_DATE).toLocaleString('en-US', { timeZone: 'America/Denver' }) : 'N/A',
                            LATEST_DATE: row.LATEST_DATE ? new Date(row.LATEST_DATE).toLocaleString('en-US', { timeZone: 'America/Denver' }) : 'N/A',
                            DAYS_COVERED: row.DAYS_COVERED,
                            AVG_RECORDS_PER_DAY: row.AVG_RECORDS_PER_DAY ? row.AVG_RECORDS_PER_DAY.toFixed(2) : 'N/A'
                        }));
                        
                        console.table(formattedRows);
                        
                        // Check for potential issues
                        rows?.forEach((row: any) => {
                            if (row.AVG_RECORDS_PER_DAY < 0.9) { // Expect at least ~1 record per day
                                console.warn(`Warning: ${row.ASSET_ID} has low data density (${row.AVG_RECORDS_PER_DAY.toFixed(2)} records/day)`);
                            }
                        });
                        
                        resolve(true);
                    }
                }
            });
        });
    }
}
