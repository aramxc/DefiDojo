import { getConnection } from '../../../config/snowflake.config';
import { CoinGeckoService } from '../../../services/external/coingecko/coingecko.service';

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
            
            // Get top coins by market cap
            await this.rateLimit();
            console.log('Fetching top coins from CoinGecko...');
            const topCoins = await this.retryWithBackoff(() => 
                this.coinGecko.getTopCoins(limit));
            
            for (const coin of topCoins) {
                try {
                    console.log(`Processing ${coin.symbol.toUpperCase()}...`);
                    
                    await this.rateLimit();
                    console.log(`Fetching detailed info for ${coin.id}...`);
                    const coinInfo = await this.retryWithBackoff(() => 
                        this.coinGecko.getAssetInfoById(coin.id));

                    console.log(`Inserting ${coin.symbol.toUpperCase()} into Snowflake...`);
                    await this.insertAsset({
                        ID: coin.symbol.toUpperCase(),
                        NAME: coinInfo.NAME || coin.name,
                        SYMBOL: coin.symbol.toUpperCase(),
                        COINGECKO_ID: coin.id,
                        PYTH_PRICE_FEED_ID: null,
                        IS_ACTIVE: true,
                        MARKET_CAP_RANK: coinInfo.MARKET_DATA?.MARKET_CAP_RANK,
                        BLOCK_TIME_IN_MINUTES: coinInfo.BLOCK_TIME_IN_MINUTES,
                        HASHING_ALGORITHM: coinInfo.HASHING_ALGORITHM,
                        DESCRIPTION: coinInfo.DESCRIPTION?.EN,
                        COUNTRY_ORIGIN: coinInfo.COUNTRY_ORIGIN,
                        GENESIS_DATE: coinInfo.GENESIS_DATE,
                        TOTAL_SUPPLY: coinInfo.MARKET_DATA?.TOTAL_SUPPLY,
                        MAX_SUPPLY: coinInfo.MARKET_DATA?.MAX_SUPPLY,
                        CIRCULATING_SUPPLY: coinInfo.MARKET_DATA?.CIRCULATING_SUPPLY,
                        GITHUB_REPOS: coinInfo.LINKS?.REPOS_URL?.GITHUB || [],
                        GITHUB_FORKS: coinInfo.DEVELOPER_DATA?.FORKS,
                        GITHUB_STARS: coinInfo.DEVELOPER_DATA?.STARS,
                        GITHUB_SUBSCRIBERS: coinInfo.DEVELOPER_DATA?.SUBSCRIBERS,
                        GITHUB_TOTAL_ISSUES: coinInfo.DEVELOPER_DATA?.TOTAL_ISSUES,
                        GITHUB_CLOSED_ISSUES: coinInfo.DEVELOPER_DATA?.CLOSED_ISSUES,
                        GITHUB_PULL_REQUESTS_MERGED: coinInfo.DEVELOPER_DATA?.PULL_REQUESTS_MERGED,
                        GITHUB_PULL_REQUEST_CONTRIBUTORS: coinInfo.DEVELOPER_DATA?.PULL_REQUEST_CONTRIBUTORS,
                        BID_ASK_SPREAD_PERCENTAGE: coinInfo.TICKERS?.[0]?.BID_ASK_SPREAD_PERCENTAGE,
                        WEB_SLUG: coinInfo.WEB_SLUG,
                        ASSET_PLATFORM_ID: coinInfo.ASSET_PLATFORM_ID,
                        PLATFORMS: coinInfo.PLATFORMS,
                        DETAIL_PLATFORMS: coinInfo.DETAIL_PLATFORMS,
                        CATEGORIES: coinInfo.CATEGORIES,
                        PREVIEW_LISTING: coinInfo.PREVIEW_LISTING || false,
                        PUBLIC_NOTICE: coinInfo.PUBLIC_NOTICE,
                        ADDITIONAL_NOTICES: coinInfo.ADDITIONAL_NOTICES,
                        LOCALIZATION: coinInfo.LOCALIZATION,
                        LINKS: coinInfo.LINKS,
                        IMAGE: coinInfo.IMAGE,
                        MARKET_DATA: coinInfo.MARKET_DATA,
                        COMMUNITY_DATA: coinInfo.COMMUNITY_DATA,
                        DEVELOPER_DATA: coinInfo.DEVELOPER_DATA,
                        STATUS_UPDATES: coinInfo.STATUS_UPDATES,
                        TICKERS: coinInfo.TICKERS,
                        SENTIMENT_VOTES_UP_PERCENTAGE: coinInfo.SENTIMENT_VOTES_UP_PERCENTAGE,
                        SENTIMENT_VOTES_DOWN_PERCENTAGE: coinInfo.SENTIMENT_VOTES_DOWN_PERCENTAGE,
                        CREATED_AT: 'CURRENT_TIMESTAMP()',
                        UPDATED_AT: 'CURRENT_TIMESTAMP()'
                    });

                    console.log(`Successfully processed ${coin.symbol.toUpperCase()}`);

                } catch (error) {
                    console.error(`Error processing ${coin.symbol}:`, error);
                }
            }

            console.log('Asset ingestion completed');
        } catch (error) {
            console.error('Fatal error during asset ingestion:', error);
            throw error;
        }
    }

    protected async insertAsset(asset: any) {
        return new Promise((resolve, reject) => {
            const formatValue = (value: any): string => {
                if (value === null || value === undefined) return 'NULL';
                if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
                if (typeof value === 'number') return value.toString();
                if (Array.isArray(value) || typeof value === 'object') {
                    return `PARSE_JSON('${JSON.stringify(value).replace(/'/g, "''")}')`; 
                }
                if (value === 'CURRENT_TIMESTAMP()') return value;
                return `'${value.toString().replace(/'/g, "''")}'`;
            };

            const columns = Object.keys(asset).join(', ');
            const values = Object.values(asset).map(formatValue).join(', ');

            const sqlText = `
                MERGE INTO PUBLIC.ASSETS target
                USING (SELECT ${values}) source (${columns})
                ON target.ID = source.ID
                WHEN MATCHED THEN
                    UPDATE SET
                        ${Object.keys(asset)
                            .filter(key => key !== 'ID')
                            .map(key => `${key} = COALESCE(target.${key}, source.${key})`)
                            .join(',\n                        ')}
                WHEN NOT MATCHED THEN
                    INSERT (${columns})
                    VALUES (${values})`;

            this.connection.execute({
                sqlText,
                complete: (err, _stmt, _rows) => {
                    if (err) {
                        console.error(`Error inserting ${asset.SYMBOL}:`, err);
                        reject(err);
                    } else {
                        console.log(`Successfully inserted ${asset.SYMBOL}`);
                        resolve(true);
                    }
                }
            });
        });
    }
}
