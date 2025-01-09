import { API_BASE_URL } from '../../../config/constants';

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
    private cache: Map<string, CoinInfo> = new Map();

    async getCoinInfo(symbol: string): Promise<CoinInfo> {
        // Check cache first
        const cachedInfo = this.cache.get(symbol);
        if (cachedInfo) {
            return cachedInfo;
        }

        try {
            const response = await fetch(`${this.baseUrl}/${symbol}`);
            if (!response.ok) {
                throw new Error('Failed to fetch coin info');
            }
            const data = await response.json();
            
            // Store in cache
            this.cache.set(symbol, data);
            return data;
        } catch (error) {
            console.error('CoinInfoService: Error:', error);
            throw error;
        }
    }

    // Optional: method to clear cache if needed
    clearCache(symbol?: string) {
        if (symbol) {
            this.cache.delete(symbol);
        } else {
            this.cache.clear();
        }
    }
}

export const coinInfoService = new CoinInfoService();