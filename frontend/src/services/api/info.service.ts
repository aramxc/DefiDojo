import { API_BASE_URL } from '../../config/constants';
// import useSWR from 'swr';

export interface CoinInfo {
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

export class InfoService {
    private baseUrl = `${API_BASE_URL}/info`;

    async getAssetInfoBySymbol(symbol: string): Promise<CoinInfo> {
        try {
            const response = await fetch(`${this.baseUrl}/${symbol}`);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch coin info');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching coin info:', error);
            throw error;
        }
    }

    async getTopAssetsInfo(limit: number = 100): Promise<CoinInfo[]> {
        try {
            const response = await fetch(`${this.baseUrl}/top/${limit}`);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch top coins');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching top coins:', error);
            throw error;
        }
    }

    async getAssetInfoById(assetId: string): Promise<CoinInfo> {
        try {
            const response = await fetch(`${this.baseUrl}/id/${assetId}`);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch coin info');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching coin info:', error);
            throw error;
        }
    }

}

// Export a singleton instance
export const infoService = new InfoService();

// // SWR hook for data fetching with caching
// export function useAssetInfo(symbol: string) {
//     const { data, error, isLoading } = useSWR(
//         symbol ? `/api/info/${symbol}` : null,
//         () => infoService.getAssetInfoBySymbol(symbol)
//     );

//     return {
//         assetInfo: data,
//         isLoading,
//         error
//     };
// }