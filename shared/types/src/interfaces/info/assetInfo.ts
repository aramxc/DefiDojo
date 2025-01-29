export interface AssetInfo {
    id: string;
    symbol: string;
    name: string;
    webSlug: string;
    assetPlatformId: string | null;
    platforms: {
        [key: string]: string;
    };
    detailPlatforms: {
        [key: string]: {
            decimalPlace: number | null;
            contractAddress: string;
        };
    };
    blockTimeInMinutes: number;
    hashingAlgorithm: string;
    categories: string[];
    previewListing: boolean;
    publicNotice: string | null;
    additionalNotices: string[];
    localization: {
        [key: string]: string;
    };
    description: {
        [key: string]: string;
    };
    links: {
        homepage: string[];
        whitepaper: string;
        blockchainSite: string[];
        officialForumUrl: string[];
        chatUrl: string[];
        announcementUrl: string[];
        snapshotUrl: string | null;
        twitterScreenName: string;
        facebookUsername: string;
        bitcointalkThreadIdentifier: number | null;
        telegramChannelIdentifier: string;
        subredditUrl: string;
        reposUrl: {
            github: string[];
            bitbucket: string[];
        };
    };
    image: {
        thumb: string;
        small: string;
        large: string;
    };
    marketData: {
        currentPrice: { [key: string]: number };
        totalValueLocked: number | null;
        mcapToTvlRatio: number | null;
        fdvToTvlRatio: number | null;
        roi: number | null;
        ath: { [key: string]: number };
        athChangePercentage: { [key: string]: number };
        athDate: { [key: string]: string };
        atl: { [key: string]: number };
        atlChangePercentage: { [key: string]: number };
        atlDate: { [key: string]: string };
        marketCap: { [key: string]: number };
        marketCapRank: number;
        fullyDilutedValuation: { [key: string]: number };
        priceChange24hInCurrency: { [key: string]: number };
        priceChangePercentage1hInCurrency: { [key: string]: number };
        priceChangePercentage24hInCurrency: { [key: string]: number };
        priceChangePercentage7dInCurrency: { [key: string]: number };
        priceChangePercentage14dInCurrency: { [key: string]: number };
        priceChangePercentage30dInCurrency: { [key: string]: number };
        priceChangePercentage60dInCurrency: { [key: string]: number };
        priceChangePercentage200dInCurrency: { [key: string]: number };
        priceChangePercentage1yInCurrency: { [key: string]: number };
        marketCapChange24hInCurrency: { [key: string]: number };
        marketCapChangePercentage24hInCurrency: { [key: string]: number };
        totalSupply: number;
        maxSupply: number;
        circulatingSupply: number;
        lastUpdated: string;
        marketCapFdvRatio: number;
        totalVolume: { [key: string]: number };
        high24h: { [key: string]: number };
        low24h: { [key: string]: number };
        priceChange24h: number;
        priceChangePercentage24h: number;
        priceChangePercentage7d: number;
        priceChangePercentage14d: number;
        priceChangePercentage30d: number;
        priceChangePercentage60d: number;
        priceChangePercentage200d: number;
        priceChangePercentage1y: number;
        marketCapChange24h: number;
        marketCapChangePercentage24h: number;
    };
    communityData: {
        facebookLikes: number | null;
        twitterFollowers: number;
        redditAveragePosts48h: number;
        redditAverageComments48h: number;
        redditSubscribers: number;
        redditAccountsActive48h: number;
        telegramChannelUserCount: number | null;
    };
    developerData: {
        forks: number;
        stars: number;
        subscribers: number;
        totalIssues: number;
        closedIssues: number;
        pullRequestsMerged: number;
        pullRequestContributors: number;
        codeAdditionsDeletions4Weeks: {
            additions: number;
            deletions: number;
        };
        commitCount4Weeks: number;
        last4WeeksCommitActivitySeries: number[];
    };
    statusUpdates: any[];
    lastUpdated: string;
    tickers: Array<{
        base: string;
        target: string;
        market: {
            name: string;
            identifier: string;
            hasTradingIncentive: boolean;
        };
        last: number;
        volume: number;
        convertedLast: {
            btc: number;
            eth: number;
            usd: number;
        };
        convertedVolume: {
            btc: number;
            eth: number;
            usd: number;
        };
        trustScore: string;
        bidAskSpreadPercentage: number;
        timestamp: string;
        lastTradedAt: string;
        lastFetchAt: string;
        isAnomaly: boolean;
        isStale: boolean;
        tradeUrl: string;
        tokenInfoUrl: string | null;
        coinId: string;
        targetCoinId: string;
    }>;
    pythPriceFeedId: string | null;
    coingeckoId: string | null;
    isActive: boolean;
    countryOrigin: string;
    genesisDate: string;
    sentimentVotesUpPercentage: number;
    sentimentVotesDownPercentage: number;
}