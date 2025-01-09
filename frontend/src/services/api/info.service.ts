import { API_BASE_URL } from '../../config/constants';
// import useSWR from 'swr';

export interface CoinInfo {
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
            return this.transformDates(data);
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
            return data.map(this.transformDates);
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
            return this.transformDates(data);
        } catch (error) {
            console.error('Error fetching coin info:', error);
            throw error;
        }
    }

    private transformDates(asset: any): CoinInfo {
        return {
            ...asset,
            created_at: asset.created_at ? new Date(asset.created_at) : new Date(),
            updated_at: asset.updated_at ? new Date(asset.updated_at) : new Date(),
            genesis_date: asset.genesis_date ? new Date(asset.genesis_date) : null
        };
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