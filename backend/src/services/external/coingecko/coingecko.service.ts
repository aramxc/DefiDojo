import axios from 'axios';
import { config, validateCoinGeckoKey } from '../../../config/constants';
import { 
    AssetInfo,
    AssetHistoricalRangeData,
    MarketMetrics,
    VolatilityMetrics,
    MarketTrends,
} from '@defidojo/shared-types';

/**
 * Utility function to pause execution for a specified duration
 * @param ms Duration in milliseconds
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Service class for interacting with the CoinGecko API
 * Handles data fetching, caching, and rate limiting
 */
export class CoinGeckoService {
    private baseUrl: string;
    private apiKey: string;
    private symbolToIdCache: Map<string, string> = new Map();
    private lastCacheUpdate: number = 0;
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes, matching CoinGecko's update frequency
    private readonly retryCount = 3;
    private readonly initialRetryDelay = 1000; // 1 second
    
  
    constructor() {
        validateCoinGeckoKey();
        this.baseUrl = config.coinGecko.proBaseUrl; // swap to baseUrl for free tier
        this.apiKey = config.coinGecko.proApiKey!; // swap to apiKey for free tier
    }

    /**
     * Makes an HTTP request with retry logic and rate limiting handling
     * Implements exponential backoff for retries
     * @private
     */
    private async makeRequest(url: string, params?: any) {
        let attempt = 0;
        while (attempt < this.retryCount) {
            try {
                const response = await axios.get(url, { 
                    params,
                    headers: {
                        'x-cg-pro-api-key': this.apiKey
                    }
                });
                return response.data;
            } catch (error: any) {
                if (error.response?.status === 429) {
                    const retryAfter = Math.pow(2, attempt) * this.initialRetryDelay;
                    console.log(`Rate limited. Retrying after ${retryAfter}ms. Attempt ${attempt + 1}/${this.retryCount}`);
                    await sleep(retryAfter);
                    attempt++;
                } else {
                    throw error;
                }
            }
        }
        throw new Error(`Failed after ${this.retryCount} retry attempts`);
    }

    /**
     * Fetches the complete list of coins or finds a specific coin by symbol
     * @param symbol Optional - specific coin symbol to search for
     * @returns Full coin list or specific coin data
     */
    async getCoinList(symbol?: string): Promise<any> {
        const url = `${this.baseUrl}/coins/list`;
        const data = await this.makeRequest(url);
        
        if (symbol) {
            return data.find((coin: any) => 
                coin.symbol.toLowerCase() === symbol.toLowerCase()
            );
        }
        
        return data;
    }

    /**
     * Fetches historical price data for a specific time range
     * @param coinId CoinGecko coin identifier
     * @param from Start timestamp in milliseconds
     * @param to End timestamp in milliseconds
     */
    async getHistoricalRangeData(
        coinId: string, 
        from: number, 
        to: number
    ): Promise<AssetHistoricalRangeData> {
        const url = `${this.baseUrl}/coins/${coinId}/market_chart/range`;
        const params = {
            vs_currency: 'usd',
            from: Math.floor(from / 1000),
            to: Math.floor(to / 1000),
        };
        
        const data = await this.makeRequest(url, params);
        
        if (!data.prices || !data.market_caps || !data.total_volumes) {
            throw new Error('Invalid data format from CoinGecko API');
        }
        
        return data;
    }

    /**
     * Fetches detailed asset information by CoinGecko ID
     * Includes market data, community stats, and developer metrics
     */
    async getAssetInfoById(id: string): Promise<any> {
        const url = `${this.baseUrl}/coins/${id}`;
        const params = {
            localization: false,
            tickers: true,
            market_data: true,
            community_data: true,
            developer_data: true
        };
        
        const data = await this.makeRequest(url, params);
        return data;
    }

    /**
     * Fetches market metrics including volatility and trends for a specific coin
     * @param coinId CoinGecko coin identifier
     */
    async calculateMarketMetrics(historicalData: AssetHistoricalRangeData): Promise<MarketMetrics> {
        try {
            const volatility = this.calculateVolatility(historicalData.prices);
            const trends = this.calculateTrends(historicalData);

            return { volatility, trends };
        } catch (error) {
            console.error('Market metrics calculation error:', error);
            throw error;
        }
    }
    /**
     * Fetches top coins by market cap
     * @param limit Number of coins to fetch (default 200)
     */
    async getTopCoins(limit: number = 200): Promise<any> {
        validateCoinGeckoKey();
        const url = `${this.baseUrl}/coins/markets`;
        const params = {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: limit,
            page: 1,
            sparkline: false
        };
        
        return this.makeRequest(url, params);
    }

    /**
     * Fetches basic market data for a specific coin
     * @param geckoId CoinGecko coin identifier
     */
    async getCoinMarketData(geckoId: string) {
        const url = `${this.baseUrl}/coins/${geckoId}`;
        try {
            const data = await this.makeRequest(url);
            
            return {
                marketCap: data?.market_data?.market_cap?.usd || null,
                marketCapRank: data?.market_cap_rank || null,
            };
        } catch (error) {
            console.error('Basic market data fetch error:', error);
            throw error;
        }
    }

    /**
     * Updates the internal symbol-to-ID cache to reduce API calls
     * Cache is updated every CACHE_DURATION milliseconds
     */
    private async updateSymbolCache(): Promise<void> {
        const now = Date.now();
        if (now - this.lastCacheUpdate > this.CACHE_DURATION) {
            const coins = await this.getCoinList();
            this.symbolToIdCache.clear();
            coins.forEach((coin: any) => {
                this.symbolToIdCache.set(coin.symbol.toLowerCase(), coin.id);
            });
            this.lastCacheUpdate = now;
        }
    }

    /**
     * Converts a symbol to its corresponding CoinGecko ID using cache
     * @param symbol Cryptocurrency symbol (e.g., 'BTC')
     */
    private async getCoingeckoId(symbol: string): Promise<string> {
        await this.updateSymbolCache();
        const id = this.symbolToIdCache.get(symbol.toLowerCase());
        if (!id) {
            throw new Error(`No coin found for symbol: ${symbol}`);
        }
        return id;
    }

    /**
     * Fetches asset information using a symbol instead of ID
     * @param symbol Cryptocurrency symbol (e.g., 'BTC')
     */
    async getAssetInfoBySymbol(symbol: string): Promise<AssetInfo> {
        const coingeckoId = await this.getCoingeckoId(symbol);
        return this.getAssetInfoById(coingeckoId);
    }

    /**
     * Calculates volatility metrics from price data
     * @param prices Array of timestamp-price pairs
     */
    private calculateVolatility(prices: [number, number][]): VolatilityMetrics {
        const returns = prices.map((price, i) => {
            if (i === 0) return 0;
            return (price[1] - prices[i-1][1]) / prices[i-1][1];
        }).slice(1);

        const standardDeviation = Math.sqrt(
            returns.reduce((sum, ret) => sum + ret * ret, 0) / returns.length
        );

        return {
            daily: standardDeviation * Math.sqrt(24),
            weekly: standardDeviation * Math.sqrt(24 * 7),
            monthly: standardDeviation * Math.sqrt(24 * 30),
            standardDeviation,
            timestamp: new Date()
        };
    }

    /**
     * Calculates market trends from historical data
     * @param data Historical price, market cap, and volume data
     */
    private calculateTrends(data: AssetHistoricalRangeData): MarketTrends {
        const prices = data.prices;
        const volumes = data.total_volumes;
        
        // Get current values
        const currentPrice = prices[prices.length - 1][1];
        const currentVolume = volumes[volumes.length - 1][1];
        
        // Calculate price changes
        const price24hAgo = this.findValueNHoursAgo(prices, 24);
        const price7dAgo = this.findValueNHoursAgo(prices, 24 * 7);
        const price30dAgo = this.findValueNHoursAgo(prices, 24 * 30);
        
        // Calculate volume changes
        const volume24hAgo = this.findValueNHoursAgo(volumes, 24);
        const volume7dAgo = this.findValueNHoursAgo(volumes, 24 * 7);
        const volume30dAgo = this.findValueNHoursAgo(volumes, 24 * 30);

        // More robust 24h price filtering
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        const last24hPrices = prices.filter(p => p[0] >= oneDayAgo);
        
        const high24h = last24hPrices.length > 0 
            ? Math.max(...last24hPrices.map(p => p[1]))
            : currentPrice;
        const low24h = last24hPrices.length > 0 
            ? Math.min(...last24hPrices.map(p => p[1]))
            : currentPrice;

        return {
            price: {
                change24h: this.calculatePercentageChange(price24hAgo, currentPrice),
                change7d: this.calculatePercentageChange(price7dAgo, currentPrice),
                change30d: this.calculatePercentageChange(price30dAgo, currentPrice),
                currentPrice: {
                    symbol: '',
                    price: currentPrice,
                    timestamp: Date.now(),
                    volume: currentVolume
                },
                historicalData: data,
                high24h,
                low24h
            },
            volume: {
                change24h: this.calculatePercentageChange(volume24hAgo, currentVolume),
                change7d: this.calculatePercentageChange(volume7dAgo, currentVolume),
                change30d: this.calculatePercentageChange(volume30dAgo, currentVolume),
                currentVolume
            }
        };
    }

    // Helper method to find historical values
    private findValueNHoursAgo(data: [number, number][], hours: number): number {
        const targetTime = Date.now() - (hours * 60 * 60 * 1000);
        const closest = data.reduce((prev, curr) => {
            return Math.abs(curr[0] - targetTime) < Math.abs(prev[0] - targetTime) 
                ? curr 
                : prev;
        });
        return closest[1];
    }

    // Helper method to calculate percentage changes
    private calculatePercentageChange(oldValue: number, newValue: number): number {
        return ((newValue - oldValue) / oldValue) * 100;
    }
}