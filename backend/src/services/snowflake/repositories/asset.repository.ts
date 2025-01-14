import { getConnection } from '../../../config/snowflake.config';
import { AssetInfo } from '@defidojo/shared-types';

export class AssetRepository {
    async findBySymbol(symbol: string): Promise<AssetInfo> {
        const connection = getConnection();
        
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    ASSET_ID as asset_id,
                    NAME as name,
                    SYMBOL as symbol,
                    COINGECKO_ID as coingecko_id,
                    PYTH_PRICE_FEED_ID as pyth_price_feed_id,
                    IS_ACTIVE as is_active,
                    MARKET_CAP_RANK as market_cap_rank,
                    CREATED_AT as created_at,
                    UPDATED_AT as updated_at,
                    BLOCK_TIME_IN_MINUTES as block_time_in_minutes,
                    HASHING_ALGORITHM as hashing_algorithm,
                    DESCRIPTION as description,
                    HOMEPAGE_URL as homepage_url,
                    WHITEPAPER_URL as whitepaper_url,
                    SUBREDDIT_URL as subreddit_url,
                    IMAGE_URL as image_url,
                    COUNTRY_ORIGIN as country_origin,
                    GENESIS_DATE as genesis_date,
                    TOTAL_SUPPLY as total_supply,
                    MAX_SUPPLY as max_supply,
                    CIRCULATING_SUPPLY as circulating_supply,
                    GITHUB_REPOS as github_repos,
                    GITHUB_FORKS as github_forks,
                    GITHUB_STARS as github_stars,
                    GITHUB_SUBSCRIBERS as github_subscribers,
                    GITHUB_TOTAL_ISSUES as github_total_issues,
                    GITHUB_CLOSED_ISSUES as github_closed_issues,
                    GITHUB_PULL_REQUESTS_MERGED as github_pull_requests_merged,
                    GITHUB_PULL_REQUEST_CONTRIBUTORS as github_pull_request_contributors,
                    BID_ASK_SPREAD_PERCENTAGE as bid_ask_spread_percentage
                FROM PUBLIC.ASSETS
                WHERE SYMBOL = :1
                AND IS_ACTIVE = TRUE
            `;

            connection.execute({
                sqlText: query,
                binds: [symbol.toUpperCase()],
                complete: (err, _stmt, rows) => {
                    if (err) {
                        reject(err);
                    } else if (!rows?.[0]) {
                        reject(new Error('Asset not found'));
                    } else {
                        // Direct mapping since column aliases match interface
                        const asset = rows[0] as AssetInfo;
                        
                        // Convert dates from string to Date objects
                        asset.CREATED_AT = new Date(asset.CREATED_AT).toISOString();
                        // Convert dates to strings in ISO format
                        asset.UPDATED_AT = new Date(asset.UPDATED_AT).toISOString();
                        if (asset.GENESIS_DATE) {
                            asset.GENESIS_DATE = new Date(asset.GENESIS_DATE).toISOString();
                        }

                        resolve(asset);
                    }
                }
            });
        });
    }

    async findTopByMarketCap(limit: number): Promise<AssetInfo[]> {
        const connection = getConnection();
        
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    ASSET_ID as asset_id,
                    NAME as name,
                    SYMBOL as symbol,
                    COINGECKO_ID as coingecko_id,
                    PYTH_PRICE_FEED_ID as pyth_price_feed_id,
                    IS_ACTIVE as is_active,
                    MARKET_CAP_RANK as market_cap_rank,
                    CREATED_AT as created_at,
                    UPDATED_AT as updated_at,
                    BLOCK_TIME_IN_MINUTES as block_time_in_minutes,
                    HASHING_ALGORITHM as hashing_algorithm,
                    DESCRIPTION as description,
                    HOMEPAGE_URL as homepage_url,
                    WHITEPAPER_URL as whitepaper_url,
                    SUBREDDIT_URL as subreddit_url,
                    IMAGE_URL as image_url,
                    COUNTRY_ORIGIN as country_origin,
                    GENESIS_DATE as genesis_date,
                    TOTAL_SUPPLY as total_supply,
                    MAX_SUPPLY as max_supply,
                    CIRCULATING_SUPPLY as circulating_supply,
                    GITHUB_REPOS as github_repos,
                    GITHUB_FORKS as github_forks,
                    GITHUB_STARS as github_stars,
                    GITHUB_SUBSCRIBERS as github_subscribers,
                    GITHUB_TOTAL_ISSUES as github_total_issues,
                    GITHUB_CLOSED_ISSUES as github_closed_issues,
                    GITHUB_PULL_REQUESTS_MERGED as github_pull_requests_merged,
                    GITHUB_PULL_REQUEST_CONTRIBUTORS as github_pull_request_contributors,
                    BID_ASK_SPREAD_PERCENTAGE as bid_ask_spread_percentage
                FROM PUBLIC.ASSETS
                WHERE IS_ACTIVE = TRUE
                ORDER BY MARKET_CAP_RANK ASC NULLS LAST
                LIMIT :1
            `;

            connection.execute({
                sqlText: query,
                binds: [limit],
                complete: (err, _stmt, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        const assets = (rows || []).map(row => {
                            const asset = row as AssetInfo;
                            
                            // Convert dates from string to Date objects
                            asset.CREATED_AT = new Date(asset.CREATED_AT).toISOString();
                            asset.UPDATED_AT = new Date(asset.UPDATED_AT).toISOString();
                            if (asset.GENESIS_DATE) {
                                asset.GENESIS_DATE = new Date(asset.GENESIS_DATE).toISOString();
                            }

                            return asset;
                        });
                        resolve(assets);
                    }
                }
            });
        });
    }

    async findById(assetId: string): Promise<AssetInfo> {
        const connection = getConnection();
        
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    ASSET_ID as asset_id,
                    NAME as name,
                    SYMBOL as symbol,
                    COINGECKO_ID as coingecko_id,
                    PYTH_PRICE_FEED_ID as pyth_price_feed_id,
                    IS_ACTIVE as is_active,
                    MARKET_CAP_RANK as market_cap_rank,
                    CREATED_AT as created_at,
                    UPDATED_AT as updated_at,
                    BLOCK_TIME_IN_MINUTES as block_time_in_minutes,
                    HASHING_ALGORITHM as hashing_algorithm,
                    DESCRIPTION as description,
                    HOMEPAGE_URL as homepage_url,
                    WHITEPAPER_URL as whitepaper_url,
                    SUBREDDIT_URL as subreddit_url,
                    IMAGE_URL as image_url,
                    COUNTRY_ORIGIN as country_origin,
                    GENESIS_DATE as genesis_date,
                    TOTAL_SUPPLY as total_supply,
                    MAX_SUPPLY as max_supply,
                    CIRCULATING_SUPPLY as circulating_supply,
                    GITHUB_REPOS as github_repos,
                    GITHUB_FORKS as github_forks,
                    GITHUB_STARS as github_stars,
                    GITHUB_SUBSCRIBERS as github_subscribers,
                    GITHUB_TOTAL_ISSUES as github_total_issues,
                    GITHUB_CLOSED_ISSUES as github_closed_issues,
                    GITHUB_PULL_REQUESTS_MERGED as github_pull_requests_merged,
                    GITHUB_PULL_REQUEST_CONTRIBUTORS as github_pull_request_contributors,
                    BID_ASK_SPREAD_PERCENTAGE as bid_ask_spread_percentage
                FROM PUBLIC.ASSETS
                WHERE ASSET_ID = :1
                AND IS_ACTIVE = TRUE
            `;

            connection.execute({
                sqlText: query,
                binds: [assetId.toUpperCase()],
                complete: (err, _stmt, rows) => {
                    if (err) {
                        reject(err);
                    } else if (!rows?.[0]) {
                        reject(new Error('Asset not found'));
                    } else {
                        const asset = rows[0] as AssetInfo;
                        
                        // Convert dates from string to Date objects
                        asset.CREATED_AT = new Date(asset.CREATED_AT).toISOString();
                        asset.UPDATED_AT = new Date(asset.UPDATED_AT).toISOString();
                        if (asset.GENESIS_DATE) {
                            asset.GENESIS_DATE = new Date(asset.GENESIS_DATE).toISOString();
                        }

                        resolve(asset);
                    }
                }
            });
        });
    }
}