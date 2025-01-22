import axios from 'axios';
import { config } from '../../../config/constants';

interface SearchResult {
    title: string;
    link: string;
    snippet: string;
    source: string;
    publishedAt?: string;
}

export class GoogleSearchService {
    private static API_KEY = config.google.apiKey;
    private static SEARCH_ENGINE_ID = config.google.searchEngineId;
    private static BASE_URL = config.google.baseUrl;

    static async searchCryptoNewsBySymbol(symbol: string): Promise<SearchResult[]> {
        try {
            const response = await axios.get(this.BASE_URL, {
                params: {
                    key: this.API_KEY,
                    cx: this.SEARCH_ENGINE_ID,
                    q: `latest ${symbol} crypto news`,
                    num: 10, // Number of results
                    sort: 'date', // Sort by date if available
                }
            });
          

            return response.data.items.map((item: any) => ({
                title: item.title,
                link: item.link,
                snippet: item.snippet,
                source: item.displayLink,
                publishedAt: item.pagemap?.metatags?.[0]?.['article:published_time'] || 
                            item.pagemap?.metatags?.[0]?.['date'] ||
                            new Date().toISOString() // fallback to current time
            }));
        } catch (error) {
            console.error('Error fetching crypto news:', error);
            throw error;
        }
    }

    static async searchCryptoNews(): Promise<SearchResult[]> {
        try {
            const response = await axios.get(this.BASE_URL, {
                params: {
                    key: this.API_KEY,
                    cx: this.SEARCH_ENGINE_ID,
                    q: `latest crypto news`,
                    num: 10, // Number of results
                    sort: 'date', // Sort by date if available
                }
            });
            console.log(response.data);

            return response.data.items.map((item: any) => ({
                title: item.title,
                link: item.link,
                snippet: item.snippet,
                source: item.displayLink,
                publishedAt: item.pagemap?.metatags?.[0]?.['article:published_time'] || 
                            item.pagemap?.metatags?.[0]?.['date'] ||
                            new Date().toISOString() // fallback to current time
            }));
        } catch (error) {
            console.error('Error fetching crypto news:', error);
            throw error;
        }
    }
}