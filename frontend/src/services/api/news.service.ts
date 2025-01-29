import { API_BASE_URL } from '../../config/constants';
import { NewsItem } from '@defidojo/shared-types';

/**
 * Service for fetching crypto-related news articles from Google Search API
 * Provides methods to fetch both general crypto news and asset-specific news
 */
export class NewsService {
  private baseUrl = `${API_BASE_URL}/news`;

  /**
   * Fetches news articles related to a specific crypto asset
   * @param symbol Trading symbol (e.g., 'BTC')
   * @returns Promise containing array of news items
   * @throws Error if the fetch request fails
   */
  async getCryptoNewsBySymbol(symbol: string): Promise<NewsItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${symbol.toLowerCase()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch news data: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Frontend: NewsService Error:', error);
      throw error;
    }
  }

  /**
   * Fetches general crypto news articles
   * @returns Promise containing array of news items
   * @throws Error if the fetch request fails
   */
  async getCryptoNews(): Promise<NewsItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Frontend: NewsService Error:', error);
      throw error as Error;
    }
  }
}

export const newsService = new NewsService();