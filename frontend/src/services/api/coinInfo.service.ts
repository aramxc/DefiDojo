import { API_BASE_URL } from '../../config/constants';

export interface CoinInfo {
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
    sentiment_votes_up_percentage: number;
    sentiment_votes_down_percentage: number;
    genesis_date: string;
}

class CoinInfoService {
    private baseUrl = `${API_BASE_URL}/coin-info`;

    async getCoinInfo(symbol: string): Promise<CoinInfo> {
        try {
            const response = await fetch(`${this.baseUrl}/${symbol}`);
            if (!response.ok) {
                throw new Error('Failed to fetch coin info');
            }
            return await response.json();
        } catch (error) {
            console.error('CoinInfoService: Error:', error);
            throw error;
        }
    }
}

export const coinInfoService = new CoinInfoService();