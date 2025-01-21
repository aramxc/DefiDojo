import { API_BASE_URL } from '../../config/constants';
import { NewsItem } from '@defidojo/shared-types';


export class NewsService {
  private baseUrl = `${API_BASE_URL}/news`;

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