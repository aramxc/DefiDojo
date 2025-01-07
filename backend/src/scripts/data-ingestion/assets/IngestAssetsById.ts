import { AssetIngestion } from './BatchAssetIngestion';
import { connectToSnowflake } from '../../../config/snowflake.config';

async function main() {
    await connectToSnowflake();

    const coinIds = process.argv.slice(2);

    if (coinIds.length === 0) {
        console.error('Please provide at least one CoinGecko ID. Usage: ts-node IngestAssetsBySymbol.ts bitcoin ethereum ...');
        process.exit(1);
    }

    const ingestion = new SpecificCoinIngestion();
    await ingestion.ingestSpecificCoins(coinIds);
}

class SpecificCoinIngestion extends AssetIngestion {
    async ingestSpecificCoins(coinIds: string[]) {
        try {
            console.log(`Starting ingestion for CoinGecko IDs: ${coinIds.join(', ')}`);
            
            for (const coinId of coinIds) {
                try {
                    await this.rateLimit();
                    console.log(`Fetching detailed info for ${coinId}...`);
                    const coinInfo = await this.retryWithBackoff(() => this.coinGecko.getCoinInfo(coinId));

                    console.log(`Inserting ${coinId} into Snowflake...`);
                    await this.insertAsset({
                        ASSET_ID: coinInfo.symbol.toUpperCase(),
                        NAME: coinInfo.name,
                        SYMBOL: coinInfo.symbol.toUpperCase(),
                        COINGECKO_ID: coinId,
                        PYTH_PRICE_FEED_ID: null,
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
                    });

                    console.log(`Successfully processed ${coinId}`);

                } catch (error: unknown) {
                    console.error(`Error processing ${coinId}:`, {
                        message: error instanceof Error ? error.message : String(error),
                        stack: error instanceof Error ? error.stack : undefined,
                        coinId
                    });
                    continue;
                }
            }

            console.log('Ingestion complete');
            process.exit(0);

        } catch (error) {
            console.error('Fatal error during specific coin ingestion:', error);
            throw error;
        }
    }
}

main().catch(console.error);