export interface AssetInfo {
    ASSET_ID: string;
    NAME: string;
    SYMBOL: string;
    COINGECKO_ID: string | null;
    PYTH_PRICE_FEED_ID: string | null;
    IS_ACTIVE: boolean;
    MARKET_CAP_RANK: number | null;
    CREATED_AT: string;
    UPDATED_AT: string;
    BLOCK_TIME_IN_MINUTES: number | null;
    HASHING_ALGORITHM: string | null;
    DESCRIPTION: string | null;
    HOMEPAGE_URL: string | null;
    WHITEPAPER_URL: string | null;
    SUBREDDIT_URL: string | null;
    IMAGE_URL: string | null;
    COUNTRY_ORIGIN: string | null;
    GENESIS_DATE: string | null;
    TOTAL_SUPPLY: number | null;
    MAX_SUPPLY: number | null;
    CIRCULATING_SUPPLY: number | null;
    GITHUB_REPOS: string[] | null;
    GITHUB_FORKS: number | null;
    GITHUB_STARS: number | null;
    GITHUB_SUBSCRIBERS: number | null;
    GITHUB_TOTAL_ISSUES: number | null;
    GITHUB_CLOSED_ISSUES: number | null;
    GITHUB_PULL_REQUESTS_MERGED: number | null;
    GITHUB_PULL_REQUEST_CONTRIBUTORS: number | null;
    BID_ASK_SPREAD_PERCENTAGE: number | null;
}

