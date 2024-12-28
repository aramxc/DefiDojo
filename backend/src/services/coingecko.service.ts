import axios from 'axios';
import { config } from '../config/constants';

export interface HistoricalRangeData {
    prices: [number, number][];
    market_caps: [number, number][];
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
}