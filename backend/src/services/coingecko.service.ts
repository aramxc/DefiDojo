import axios from 'axios';
import { config, validateCoinGeckoKey } from '../config/constants';

export interface HistoricalRangeData {
    prices: [number, number][];
    market_caps: [number, number][];
    total_volumes: [number, number][];
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

    async getCoinList(): Promise<any> {
        const url = `${this.baseUrl}/coins/list`;
        const response = await axios.get(url);
        return response.data;
    }

    async getHistoricalRangeData(coinId: string, from: number, to: number): Promise<HistoricalRangeData> {
        const baseUrl = config.coinGeckoProApiKey ? config.coinGeckoProBaseUrl : config.coinGeckoBaseUrl;
        const url = `${baseUrl}/coins/${coinId}/market_chart/range`;
        
        const headers = config.coinGeckoProApiKey ? { 'x-cg-pro-api-key': config.coinGeckoProApiKey } : {};
        
        const response = await axios.get(url, {
            params: {
                vs_currency: 'usd',
                from: Math.floor(from / 1000),
                to: Math.floor(to / 1000),
                // interval: 'hourly' // default is daily i.e. blank
            },
            headers
        });
        
        if (!response.data.prices || !response.data.market_caps || !response.data.total_volumes) {
            throw new Error('Invalid data format from CoinGecko API');
        }

        return response.data;
    }

    async getCoinInfo(coinId: string): Promise<any> {
        validateCoinGeckoKey();
        const url = `${this.baseUrl}/coins/${coinId}`;
        const response = await axios.get(url, {
            params: {
                localization: false,
                tickers: false,
                market_data: true,
                community_data: false,
                developer_data: true,
                sparkline: false
            }
        });

        if (!response.data) {
            throw new Error('Invalid data format from CoinGecko API');
        }
            
        return response.data;
    }

    async getTopCoins(limit: number = 200): Promise<any> {
        validateCoinGeckoKey();
        const url = `${this.baseUrl}/coins/markets`;
        const response = await axios.get(url, {
            params: {
                vs_currency: 'usd',
                order: 'market_cap_desc',
                per_page: limit,
                page: 1,
                sparkline: false
            }
        });
        return response.data;
    }
}