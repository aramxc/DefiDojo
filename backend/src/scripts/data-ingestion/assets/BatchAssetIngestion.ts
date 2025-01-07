import { getConnection } from '../../../config/snowflake.config';
import { CoinGeckoService } from '../../../services/coingecko.service';

export class AssetIngestion {
    protected connection;
    protected coinGecko: CoinGeckoService;
    private requestCount = 0;
    private lastRequestTime = Date.now();
    
    // Even more conservative rate limiting
    private readonly RATE_LIMIT_PER_MINUTE = 400; 
    private readonly MIN_REQUEST_INTERVAL = 5000; // 5 seconds between requests
    private readonly RATE_LIMIT_RESET_TIME = 60000; // 1 minute
    private readonly MAX_RETRIES = 3;
    
    constructor() {
        console.log('Initializing AssetIngestion...');
        try {
            this.connection = getConnection();
            this.coinGecko = new CoinGeckoService();
            console.log('AssetIngestion initialized successfully');
        } catch (error) {
            console.error('Error initializing AssetIngestion:', error);
            throw error;
        }
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
                console.log(`Rate limit reached. Waiting ${Math.ceil(waitTime/1000)} seconds...`);
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
                console.log(`Rate limit hit, waiting ${waitTime/1000} seconds before retry ${retryCount + 1}...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                return this.retryWithBackoff(operation, retryCount + 1);
            }
            throw error;
        }
    }

    async ingestAssets(limit: number = 200) {
        try {
            console.log('Starting asset ingestion process...');
            console.log(`Rate limits: ${this.RATE_LIMIT_PER_MINUTE}/minute, ${this.MIN_REQUEST_INTERVAL/1000}s between requests`);

            // Get top coins by market cap directly
            await this.rateLimit();
            console.log('Fetching top coins from CoinGecko...');
            const topCoins = await this.retryWithBackoff(() => this.coinGecko.getTopCoins(limit));
            
            console.log(`Processing ${topCoins.length} top coins by market cap`);

            // Process coins sequentially
            for (const coin of topCoins) {
                try {
                    console.log(`Processing ${coin.symbol.toUpperCase()} (Rank: ${coin.market_cap_rank})...`);
                    
                    await this.rateLimit();
                    console.log(`Fetching detailed info for ${coin.symbol}...`);
                    const coinInfo = await this.retryWithBackoff(() => this.coinGecko.getCoinInfo(coin.id));

                    console.log(`Inserting ${coin.symbol} into Snowflake...`);
                    await this.insertAsset({
                        ASSET_ID: coin.symbol.toUpperCase(),
                        NAME: coin.name,
                        SYMBOL: coin.symbol.toUpperCase(),
                        COINGECKO_ID: coin.id,
                        PYTH_PRICE_FEED_ID: null, // Custom field not in API
                        IS_ACTIVE: true,
                        MARKET_CAP_RANK: coinInfo.market_cap_rank || null,
                        BLOCK_TIME_IN_MINUTES: coinInfo.block_time_in_minutes || null,
                        HASHING_ALGORITHM: coinInfo.hashing_algorithm || null,
                        DESCRIPTION: coinInfo.description?.en || null,
                        HOMEPAGE_URL: coinInfo.links?.homepage?.[0] || null,
                        WHITEPAPER_URL: coinInfo.links?.whitepaper || null,
                        SUBREDDIT_URL: coinInfo.links?.subreddit_url || null,
                        IMAGE_URL: coinInfo.image?.large || null,
                        COUNTRY_ORIGIN: coinInfo.country_origin || null,
                        GENESIS_DATE: coinInfo.genesis_date || null,
                        TOTAL_SUPPLY: coinInfo.market_data?.total_supply || null,
                        MAX_SUPPLY: coinInfo.market_data?.max_supply || null,
                        CIRCULATING_SUPPLY: coinInfo.market_data?.circulating_supply || null,
                        GITHUB_FORKS: coinInfo.developer_data?.forks || null,
                        GITHUB_STARS: coinInfo.developer_data?.stars || null,
                        GITHUB_SUBSCRIBERS: coinInfo.developer_data?.subscribers || null,
                        GITHUB_TOTAL_ISSUES: coinInfo.developer_data?.total_issues || null,
                        GITHUB_CLOSED_ISSUES: coinInfo.developer_data?.closed_issues || null,
                        GITHUB_PULL_REQUESTS_MERGED: coinInfo.developer_data?.pull_requests_merged || null,
                        GITHUB_PULL_REQUEST_CONTRIBUTORS: coinInfo.developer_data?.pull_request_contributors || null,
                        CREATED_AT: 'CURRENT_TIMESTAMP()',
                        UPDATED_AT: 'CURRENT_TIMESTAMP()'
                    });

                    console.log(`Successfully processed ${coin.symbol}`);

                } catch (error: unknown) {
                    console.error(`Error processing ${coin.symbol}:`, {
                        message: error instanceof Error ? error.message : String(error),
                        stack: error instanceof Error ? error.stack : undefined,
                        coinData: {
                            symbol: coin.symbol,
                            id: coin.id,
                            rank: coin.market_cap_rank
                        }
                    });
                    // Continue with next coin even if one fails
                    continue;
                }
            }

            console.log('Asset ingestion completed successfully');
        } catch (error) {
            console.error('Fatal error during asset ingestion:', error);
            throw error;
        }
    }

    protected async insertAsset(asset: any) {
        return new Promise((resolve, reject) => {
            console.log(`Executing MERGE for ${asset.SYMBOL}...`);
            
            // Helper function to safely format values for SQL
            const formatValue = (value: any): string => {
                if (value === null || value === undefined) return 'NULL';
                if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
                if (typeof value === 'number') return value.toString();
                if (typeof value === 'string') {
                    // Escape single quotes and wrap in quotes
                    return `'${value.replace(/'/g, "''")}'`;
                }
                return 'NULL';
            };

            const sqlText = `
                MERGE INTO PUBLIC.ASSETS target
                USING (SELECT 
                    ${formatValue(asset.ASSET_ID)} as ASSET_ID,
                    ${formatValue(asset.NAME)} as NAME,
                    ${formatValue(asset.SYMBOL)} as SYMBOL,
                    ${formatValue(asset.COINGECKO_ID)} as COINGECKO_ID,
                    ${formatValue(asset.PYTH_PRICE_FEED_ID)} as PYTH_PRICE_FEED_ID,
                    ${formatValue(asset.IS_ACTIVE)} as IS_ACTIVE,
                    ${formatValue(asset.MARKET_CAP_RANK)} as MARKET_CAP_RANK,
                    ${formatValue(asset.BLOCK_TIME_IN_MINUTES)} as BLOCK_TIME_IN_MINUTES,
                    ${formatValue(asset.HASHING_ALGORITHM)} as HASHING_ALGORITHM,
                    ${formatValue(asset.DESCRIPTION)} as DESCRIPTION,
                    ${formatValue(asset.HOMEPAGE_URL)} as HOMEPAGE_URL,
                    ${formatValue(asset.WHITEPAPER_URL)} as WHITEPAPER_URL,
                    ${formatValue(asset.SUBREDDIT_URL)} as SUBREDDIT_URL,
                    ${formatValue(asset.IMAGE_URL)} as IMAGE_URL,
                    ${formatValue(asset.COUNTRY_ORIGIN)} as COUNTRY_ORIGIN,
                    ${formatValue(asset.GENESIS_DATE)} as GENESIS_DATE,
                    ${formatValue(asset.TOTAL_SUPPLY)} as TOTAL_SUPPLY,
                    ${formatValue(asset.MAX_SUPPLY)} as MAX_SUPPLY,
                    ${formatValue(asset.CIRCULATING_SUPPLY)} as CIRCULATING_SUPPLY,
                    ${formatValue(asset.GITHUB_FORKS)} as GITHUB_FORKS,
                    ${formatValue(asset.GITHUB_STARS)} as GITHUB_STARS,
                    ${formatValue(asset.GITHUB_SUBSCRIBERS)} as GITHUB_SUBSCRIBERS,
                    ${formatValue(asset.GITHUB_TOTAL_ISSUES)} as GITHUB_TOTAL_ISSUES,
                    ${formatValue(asset.GITHUB_CLOSED_ISSUES)} as GITHUB_CLOSED_ISSUES,
                    ${formatValue(asset.GITHUB_PULL_REQUESTS_MERGED)} as GITHUB_PULL_REQUESTS_MERGED,
                    ${formatValue(asset.GITHUB_PULL_REQUEST_CONTRIBUTORS)} as GITHUB_PULL_REQUEST_CONTRIBUTORS,
                    CURRENT_TIMESTAMP() as CREATED_AT,
                    CURRENT_TIMESTAMP() as UPDATED_AT
                ) as source
                ON target.ASSET_ID = source.ASSET_ID
                WHEN MATCHED THEN
                    UPDATE SET
                        NAME = source.NAME,
                        SYMBOL = source.SYMBOL,
                        COINGECKO_ID = source.COINGECKO_ID,
                        IS_ACTIVE = source.IS_ACTIVE,
                        MARKET_CAP_RANK = source.MARKET_CAP_RANK,
                        BLOCK_TIME_IN_MINUTES = source.BLOCK_TIME_IN_MINUTES,
                        HASHING_ALGORITHM = source.HASHING_ALGORITHM,
                        DESCRIPTION = source.DESCRIPTION,
                        HOMEPAGE_URL = source.HOMEPAGE_URL,
                        WHITEPAPER_URL = source.WHITEPAPER_URL,
                        SUBREDDIT_URL = source.SUBREDDIT_URL,
                        IMAGE_URL = source.IMAGE_URL,
                        COUNTRY_ORIGIN = source.COUNTRY_ORIGIN,
                        GENESIS_DATE = source.GENESIS_DATE,
                        TOTAL_SUPPLY = source.TOTAL_SUPPLY,
                        MAX_SUPPLY = source.MAX_SUPPLY,
                        CIRCULATING_SUPPLY = source.CIRCULATING_SUPPLY,
                        GITHUB_FORKS = source.GITHUB_FORKS,
                        GITHUB_STARS = source.GITHUB_STARS,
                        GITHUB_SUBSCRIBERS = source.GITHUB_SUBSCRIBERS,
                        GITHUB_TOTAL_ISSUES = source.GITHUB_TOTAL_ISSUES,
                        GITHUB_CLOSED_ISSUES = source.GITHUB_CLOSED_ISSUES,
                        GITHUB_PULL_REQUESTS_MERGED = source.GITHUB_PULL_REQUESTS_MERGED,
                        GITHUB_PULL_REQUEST_CONTRIBUTORS = source.GITHUB_PULL_REQUEST_CONTRIBUTORS,
                        UPDATED_AT = CURRENT_TIMESTAMP()
                WHEN NOT MATCHED THEN
                    INSERT (
                        ASSET_ID, NAME, SYMBOL, COINGECKO_ID, PYTH_PRICE_FEED_ID,
                        IS_ACTIVE, MARKET_CAP_RANK, BLOCK_TIME_IN_MINUTES,
                        HASHING_ALGORITHM, DESCRIPTION, HOMEPAGE_URL, WHITEPAPER_URL,
                        SUBREDDIT_URL, IMAGE_URL, COUNTRY_ORIGIN, GENESIS_DATE,
                        TOTAL_SUPPLY, MAX_SUPPLY, CIRCULATING_SUPPLY,
                        GITHUB_FORKS, GITHUB_STARS, GITHUB_SUBSCRIBERS,
                        GITHUB_TOTAL_ISSUES, GITHUB_CLOSED_ISSUES,
                        GITHUB_PULL_REQUESTS_MERGED, GITHUB_PULL_REQUEST_CONTRIBUTORS,
                        CREATED_AT, UPDATED_AT
                    )
                    VALUES (
                        source.ASSET_ID, source.NAME, source.SYMBOL, source.COINGECKO_ID,
                        source.PYTH_PRICE_FEED_ID, source.IS_ACTIVE, source.MARKET_CAP_RANK,
                        source.BLOCK_TIME_IN_MINUTES, source.HASHING_ALGORITHM,
                        source.DESCRIPTION, source.HOMEPAGE_URL, source.WHITEPAPER_URL,
                        source.SUBREDDIT_URL, source.IMAGE_URL, source.COUNTRY_ORIGIN,
                        source.GENESIS_DATE, source.TOTAL_SUPPLY, source.MAX_SUPPLY,
                        source.CIRCULATING_SUPPLY, source.GITHUB_FORKS, source.GITHUB_STARS,
                        source.GITHUB_SUBSCRIBERS, source.GITHUB_TOTAL_ISSUES,
                        source.GITHUB_CLOSED_ISSUES, source.GITHUB_PULL_REQUESTS_MERGED,
                        source.GITHUB_PULL_REQUEST_CONTRIBUTORS, source.CREATED_AT, source.UPDATED_AT
                    )
            `;

            this.connection.execute({
                sqlText,
                complete: (err) => {
                    if (err) {
                        console.error(`Error inserting ${asset.SYMBOL}:`, {
                            message: err.message,
                            stack: err.stack,
                            assetData: {
                                id: asset.ASSET_ID,
                                symbol: asset.SYMBOL,
                                name: asset.NAME
                            }
                        });
                        reject(err);
                    } else {
                        console.log(`Successfully inserted/updated ${asset.SYMBOL}`);
                        resolve(true);
                    }
                }
            });
        });
    }
}
