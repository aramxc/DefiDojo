export interface AssetInfo {
    ID: string;
    SYMBOL: string;
    NAME: string;
    WEB_SLUG: string;
    ASSET_PLATFORM_ID: string | null;
    PLATFORMS: {
        [key: string]: string;
    };
    DETAIL_PLATFORMS: {
        [key: string]: {
            DECIMAL_PLACE: number | null;
            CONTRACT_ADDRESS: string;
        };
    };
    BLOCK_TIME_IN_MINUTES: number;
    HASHING_ALGORITHM: string;
    CATEGORIES: string[];
    PREVIEW_LISTING: boolean;
    PUBLIC_NOTICE: string | null;
    ADDITIONAL_NOTICES: string[];
    LOCALIZATION: {
        [key: string]: string;
    };
    DESCRIPTION: {
        [key: string]: string;
    };
    LINKS: {
        HOMEPAGE: string[];
        WHITEPAPER: string[];
        BLOCKCHAIN_SITE: string[];
        OFFICIAL_FORUM_URL: string[];
        CHAT_URL: string[];
        ANNOUNCEMENT_URL: string[];
        SNAPSHOT_URL: string | null;
        TWITTER_SCREEN_NAME: string;
        FACEBOOK_USERNAME: string;
        BITCOINTALK_THREAD_IDENTIFIER: number | null;
        TELEGRAM_CHANNEL_IDENTIFIER: string;
        SUBREDDIT_URL: string;
        REPOS_URL: {
            GITHUB: string[];
            BITBUCKET: string[];
        };
    };
    IMAGE: {
        THUMB: string;
        SMALL: string;
        LARGE: string;
    };
    MARKET_DATA: {
        CURRENT_PRICE: { [key: string]: number };
        TOTAL_VALUE_LOCKED: number | null;
        MCAP_TO_TVL_RATIO: number | null;
        FDV_TO_TVL_RATIO: number | null;
        ROI: number | null;
        ATH: { [key: string]: number };
        ATH_CHANGE_PERCENTAGE: { [key: string]: number };
        ATH_DATE: { [key: string]: string };
        ATL: { [key: string]: number };
        ATL_CHANGE_PERCENTAGE: { [key: string]: number };
        ATL_DATE: { [key: string]: string };
        MARKET_CAP: { [key: string]: number };
        MARKET_CAP_RANK: number;
        FULLY_DILUTED_VALUATION: { [key: string]: number };
        PRICE_CHANGE_24H_IN_CURRENCY: { [key: string]: number };
        PRICE_CHANGE_PERCENTAGE_1H_IN_CURRENCY: { [key: string]: number };
        PRICE_CHANGE_PERCENTAGE_24H_IN_CURRENCY: { [key: string]: number };
        PRICE_CHANGE_PERCENTAGE_7D_IN_CURRENCY: { [key: string]: number };
        PRICE_CHANGE_PERCENTAGE_14D_IN_CURRENCY: { [key: string]: number };
        PRICE_CHANGE_PERCENTAGE_30D_IN_CURRENCY: { [key: string]: number };
        PRICE_CHANGE_PERCENTAGE_60D_IN_CURRENCY: { [key: string]: number };
        PRICE_CHANGE_PERCENTAGE_200D_IN_CURRENCY: { [key: string]: number };
        PRICE_CHANGE_PERCENTAGE_1Y_IN_CURRENCY: { [key: string]: number };
        MARKET_CAP_CHANGE_24H_IN_CURRENCY: { [key: string]: number };
        MARKET_CAP_CHANGE_PERCENTAGE_24H_IN_CURRENCY: { [key: string]: number };
        TOTAL_SUPPLY: number;
        MAX_SUPPLY: number;
        CIRCULATING_SUPPLY: number;
        LAST_UPDATED: string;
        MARKET_CAP_FDV_RATIO: number;
        TOTAL_VOLUME: { [key: string]: number };
        HIGH_24H: { [key: string]: number };
        LOW_24H: { [key: string]: number };
        PRICE_CHANGE_24H: number;
        PRICE_CHANGE_PERCENTAGE_24H: number;
        PRICE_CHANGE_PERCENTAGE_7D: number;
        PRICE_CHANGE_PERCENTAGE_14D: number;
        PRICE_CHANGE_PERCENTAGE_30D: number;
        PRICE_CHANGE_PERCENTAGE_60D: number;
        PRICE_CHANGE_PERCENTAGE_200D: number;
        PRICE_CHANGE_PERCENTAGE_1Y: number;
        MARKET_CAP_CHANGE_24H: number;
        MARKET_CAP_CHANGE_PERCENTAGE_24H: number;
    };
    COMMUNITY_DATA: {
        FACEBOOK_LIKES: number | null;
        TWITTER_FOLLOWERS: number;
        REDDIT_AVERAGE_POSTS_48H: number;
        REDDIT_AVERAGE_COMMENTS_48H: number;
        REDDIT_SUBSCRIBERS: number;
        REDDIT_ACCOUNTS_ACTIVE_48H: number;
        TELEGRAM_CHANNEL_USER_COUNT: number | null;
    };
    DEVELOPER_DATA: {
        FORKS: number;
        STARS: number;
        SUBSCRIBERS: number;
        TOTAL_ISSUES: number;
        CLOSED_ISSUES: number;
        PULL_REQUESTS_MERGED: number;
        PULL_REQUEST_CONTRIBUTORS: number;
        CODE_ADDITIONS_DELETIONS_4_WEEKS: {
            ADDITIONS: number;
            DELETIONS: number;
        };
        COMMIT_COUNT_4_WEEKS: number;
        LAST_4_WEEKS_COMMIT_ACTIVITY_SERIES: number[];
    };
    STATUS_UPDATES: any[];
    LAST_UPDATED: string;
    TICKERS: Array<{
        BASE: string;
        TARGET: string;
        MARKET: {
            NAME: string;
            IDENTIFIER: string;
            HAS_TRADING_INCENTIVE: boolean;
        };
        LAST: number;
        VOLUME: number;
        CONVERTED_LAST: {
            BTC: number;
            ETH: number;
            USD: number;
        };
        CONVERTED_VOLUME: {
            BTC: number;
            ETH: number;
            USD: number;
        };
        TRUST_SCORE: string;
        BID_ASK_SPREAD_PERCENTAGE: number;
        TIMESTAMP: string;
        LAST_TRADED_AT: string;
        LAST_FETCH_AT: string;
        IS_ANOMALY: boolean;
        IS_STALE: boolean;
        TRADE_URL: string;
        TOKEN_INFO_URL: string | null;
        COIN_ID: string;
        TARGET_COIN_ID: string;
    }>;
    PYTH_PRICE_FEED_ID: string | null;
    COINGECKO_ID: string | null;
    IS_ACTIVE: boolean;
    COUNTRY_ORIGIN: string;
    GENESIS_DATE: string;
    SENTIMENT_VOTES_UP_PERCENTAGE: number;
    SENTIMENT_VOTES_DOWN_PERCENTAGE: number;
}