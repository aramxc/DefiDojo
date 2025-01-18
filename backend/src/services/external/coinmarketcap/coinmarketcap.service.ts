import axios from 'axios';
import { config } from '../../../config/constants';
import { FearGreed } from '@defidojo/shared-types';

export class CoinMarketCapService {
    private baseUrl: string;
    private apiKey: string;

    constructor() {
        this.baseUrl = config.coinmarketcapBaseUrl;
        this.apiKey = config.coinmarketcapApiKey || '';
    }

    async getFearAndGreedIndex(): Promise<FearGreed> {
        try {
            const response = await axios.get(`${this.baseUrl}/fear-and-greed/latest`, {
                headers: {
                    'X-CMC_PRO_API_KEY': this.apiKey
                }
            });

            if (!response.data?.data?.value) {
                throw new Error('Invalid response format from CoinMarketCap API');
            }

            return {
                value: response.data.data.value,
                timestamp: new Date(response.data.data.timestamp)
            };
        } catch (error) {
            console.error('CoinMarketCap Fear & Greed Index Error:', {
                status: (error as any).response?.status,
                message: (error as any).response?.data?.error || (error as Error).message
            });
            throw error;
        }
    }

    async getHistoricalFearAndGreedIndex(limit: number = 30): Promise<FearGreed[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/fear-and-greed/historical`, {
                headers: {
                    'X-CMC_PRO_API_KEY': this.apiKey
                },
                params: {
                    limit
                }
            });

            if (!Array.isArray(response.data?.data)) {
                throw new Error('Invalid response format from CoinMarketCap API');
            }

            return response.data.data.map((item: any) => ({
                value: item.value,
                timestamp: new Date(item.timestamp)
            }));
        } catch (error) {
            console.error('CoinMarketCap Historical Fear & Greed Index Error:', {
                status: (error as any).response?.status,
                message: (error as any).response?.data?.error || (error as Error).message
            });
            throw error;
        }
    }
}

export const coinMarketCapService = new CoinMarketCapService();
