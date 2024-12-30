import axios from 'axios';
import { config } from '../config/constants';

export interface HistoricalRangeData {
    prices: [number, number][];
    market_caps: [number, number][];
}

export interface CoinInfo {
    id: string;
    symbol: string;
    name: string;
    image: {
        thumb: string;
        small: string;
        large: string;
    }
    links: {
        homepage: string[];
        whitepaper: string[];
        subreddit_url: string;
        github_url: string[];
    }
    genesis_date: string;
    sentiment_votes_up_percentage: number;
    sentiment_votes_down_percentage: number;
}

export class CoinGeckoService {
    private baseUrl: string;
  
    constructor() {
        this.baseUrl = config.coinGeckoBaseUrl;
    }

    async getHistoricalRangeData(coinId: string, from: number, to: number): Promise<HistoricalRangeData> {
        const url = `${this.baseUrl}/coins/${coinId}/market_chart/range`;
        const response = await axios.get(url, {
            params: {
                vs_currency: 'usd',
                from: Math.floor(from / 1000),
                to: Math.floor(to / 1000),
            },
        });
        
        if (!response.data.prices || !response.data.market_caps) {
            throw new Error('Invalid data format from CoinGecko API');
        }

        return response.data;
    }

    async getCoinInfo(coinId: string): Promise<any> {
        const url = `${this.baseUrl}/coins/${coinId}`;
        const response = await axios.get(url, {
            params: {
                localization: false, 
                tickers: false,      
                market_data: false, 
                community_data: false,
                developer_data: false,
                sparkline: false
            }
        });

        if (!response.data) {
            throw new Error('Invalid data format from CoinGecko API');
        }
            
        return response.data;
    }
}