import axios from 'axios';
import { config } from '../config/constants';

export class CoinGeckoService {
    private baseUrl: string;
  
    constructor() {
      this.baseUrl = config.coinGeckoBaseUrl;
    }

    // async getHistoricalData(coinId: string, days: number): Promise<any> {
    //     const url = `${this.baseUrl}/coins/${coinId}/market_chart`;
    //     const response = await axios.get(url, {
    //         params: {
    //             vs_currency: 'usd',
    //             days: days,
    //         },
    //     });
    //     return response.data;
    // }

    async getHistoricalRangeData(coinId: string, from: number, to: number): Promise<any> {
        const url = `${this.baseUrl}/coins/${coinId}/market_chart/range`;
        const response = await axios.get(url, {
            params: {
                vs_currency: 'usd',
                from: Math.floor(from / 1000), // Convert to seconds
                to: Math.floor(to / 1000),
            },
        });
        return response.data;
    }
}