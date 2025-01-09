export interface AssetInfo {
    asset_id: string;
    name: string | null;
    symbol: string | null;
    coingecko_id: string | null;
    pyth_price_feed_id: string | null;
    is_active: boolean;
    market_cap_rank: number | null;
    created_at: Date;
    updated_at: Date;
    block_time_in_minutes: number | null;
    hashing_algorithm: string | null;
    description: string | null;
    homepage_url: string | null;
    whitepaper_url: string | null;
    subreddit_url: string | null;
    image_url: string | null;
    country_origin: string | null;
    genesis_date: Date | null;
    total_supply: number | null;
    max_supply: number | null;
    circulating_supply: number | null;
    github_repos: string[] | null;
    github_forks: number | null;
    github_stars: number | null;
    github_subscribers: number | null;
    github_total_issues: number | null;
    github_closed_issues: number | null;
    github_pull_requests_merged: number | null;
    github_pull_request_contributors: number | null;
    bid_ask_spread_percentage: number | null;
}

// For frontend compatibility, create a transform function
export function transformToFrontendFormat(asset: AssetInfo): FrontendAssetInfo {
    return {
        id: asset.coingecko_id || asset.asset_id,
        symbol: asset.symbol || '',
        name: asset.name || '',
        image: {
            thumb: asset.image_url || '',
            small: asset.image_url || '',
            large: asset.image_url || '',
        },
        links: {
            homepage: [asset.homepage_url || ''],
            whitepaper: asset.whitepaper_url || '',
            subreddit_url: asset.subreddit_url || '',
            github_url: asset.github_repos || [''], // Match the interface property name
        },
        description: {
            en: asset.description || '',
        },
        genesis_date: asset.genesis_date?.toISOString().split('T')[0] || '',
        // Add any additional frontend-required fields
    };
}

// Keep the frontend interface for compatibility
export interface FrontendAssetInfo {
    id: string;
    symbol: string;
    name: string;
    image: {
        thumb: string;
        small: string;
        large: string;
    };
    links: {
        homepage: string[];
        whitepaper: string;
        subreddit_url: string;
        github_url: string[];
    };
    description: {
        en: string;
    };
    genesis_date: string;
}