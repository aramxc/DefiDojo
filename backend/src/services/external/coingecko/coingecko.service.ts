import axios from 'axios';
import { config, validateCoinGeckoKey } from '../../../config/constants';
import { 
    AssetInfo,
    AssetHistoricalRangeData,
    MarketMetrics,
    VolatilityMetrics,
    MarketTrends,
} from '@defidojo/shared-types';

export class CoinGeckoService {
    private baseUrl: string;
    private symbolToIdCache: Map<string, string> = new Map();
    private lastCacheUpdate: number = 0;
    private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes, matching CoinGecko's update frequency
  
    constructor() {
        this.baseUrl = config.coinGecko.baseUrl;
    }

    async getCoinList(symbol?: string): Promise<any> {
        const url = `${this.baseUrl}/coins/list`;
        const response = await axios.get(url);
        
        if (symbol) {
            // Find the first match for the symbol (case-insensitive)
            return response.data.find((coin: any) => 
                coin.symbol.toLowerCase() === symbol.toLowerCase()
            );
        }
        
        return response.data;
    }

    async getHistoricalRangeData(
        coinId: string, 
        from: number, 
        to: number
    ): Promise<AssetHistoricalRangeData> {
        const timeRangeInDays = (to - from) / (24 * 60 * 60 * 1000);
        
        if (timeRangeInDays > 90) {
            if (!config.coinGecko.apiKey) {
                throw new Error('Pro API key required for historical data over 90 days');
            }
            
            const url = `${config.coinGecko.proBaseUrl}/coins/${coinId}/market_chart/range`;
            
            try {
                const response = await axios.get<AssetHistoricalRangeData>(url, {
                    params: {
                        vs_currency: 'usd',
                        from: Math.floor(from / 1000),
                        to: Math.floor(to / 1000),
                    },
                    headers: {
                        'x-cg-pro-api-key': config.coinGecko.apiKey
                    }
                });
                
                if (!response.data.prices || !response.data.market_caps || !response.data.total_volumes) {
                    throw new Error('Invalid data format from CoinGecko API');
                }
                
                return response.data;
            } catch (error) {
                console.error('Pro API Error:', {
                    status: (error as any).response?.status,
                    message: (error as any).response?.data?.error || (error as Error).message,
                    hasApiKey: !!config.coinGecko.apiKey
                });
                throw error;
            }
        }
        
        const url = `${config.coinGecko.baseUrl}/coins/${coinId}/market_chart/range`;
        const response = await axios.get<AssetHistoricalRangeData>(url, {
            params: {
                vs_currency: 'usd',
                from: Math.floor(from / 1000),
                to: Math.floor(to / 1000),
            }
        });
        
        if (!response.data.prices || !response.data.market_caps || !response.data.total_volumes) {
            throw new Error('Invalid data format from CoinGecko API');
        }
        
        return response.data;
    }

    async getAssetInfoById(id: string): Promise<AssetInfo> {
        const response = await axios.get<any>(
            `${this.baseUrl}/coins/${id}?localization=false&tickers=true&market_data=true&community_data=true&developer_data=true`
        );

        // Store original name before converting to uppercase
        const originalName = response.data.name;
        
        // Convert data to uppercase
        const upperData = this.convertKeysToUpperCase(response.data);

        // Now we can safely access the uppercase properties
        const assetInfo: AssetInfo = {
            ID: upperData.ID,
            COINGECKO_ID: upperData.ID,
            SYMBOL: upperData.SYMBOL,
            NAME: originalName,
            WEB_SLUG: upperData.WEB_SLUG,
            ASSET_PLATFORM_ID: upperData.ASSET_PLATFORM_ID,
            PLATFORMS: upperData.PLATFORMS,
            DETAIL_PLATFORMS: upperData.DETAIL_PLATFORMS,
            BLOCK_TIME_IN_MINUTES: upperData.BLOCK_TIME_IN_MINUTES,
            HASHING_ALGORITHM: upperData.HASHING_ALGORITHM,
            CATEGORIES: upperData.CATEGORIES,
            PREVIEW_LISTING: upperData.PREVIEW_LISTING,
            PUBLIC_NOTICE: upperData.PUBLIC_NOTICE,
            ADDITIONAL_NOTICES: upperData.ADDITIONAL_NOTICES,
            LOCALIZATION: upperData.LOCALIZATION,
            DESCRIPTION: upperData.DESCRIPTION,
            LINKS: upperData.LINKS || {
                HOMEPAGE: [],
                WHITEPAPER: [],
                BLOCKCHAIN_SITE: [],
                OFFICIAL_FORUM_URL: [],
                CHAT_URL: [],
                ANNOUNCEMENT_URL: [],
                SNAPSHOT_URL: null,
                TWITTER_SCREEN_NAME: '',
                FACEBOOK_USERNAME: '',
                BITCOINTALK_THREAD_IDENTIFIER: null,
                TELEGRAM_CHANNEL_IDENTIFIER: '',
                SUBREDDIT_URL: '',
                REPOS_URL: {
                    GITHUB: [],
                    BITBUCKET: []
                }
            },
            IMAGE: upperData.IMAGE,
            MARKET_DATA: upperData.MARKET_DATA,
            COMMUNITY_DATA: upperData.COMMUNITY_DATA,
            DEVELOPER_DATA: upperData.DEVELOPER_DATA,
            STATUS_UPDATES: upperData.STATUS_UPDATES,
            LAST_UPDATED: upperData.LAST_UPDATED,
            TICKERS: upperData.TICKERS,
            PYTH_PRICE_FEED_ID: null,
            IS_ACTIVE: true,
            COUNTRY_ORIGIN: upperData.COUNTRY_ORIGIN,
            GENESIS_DATE: upperData.GENESIS_DATE,
            SENTIMENT_VOTES_UP_PERCENTAGE: upperData.SENTIMENT_VOTES_UP_PERCENTAGE,
            SENTIMENT_VOTES_DOWN_PERCENTAGE: upperData.SENTIMENT_VOTES_DOWN_PERCENTAGE
        };

        return assetInfo;
    }

    async getMarketMetrics(coinId: string): Promise<MarketMetrics> {
        try {
            console.log('CoinGecko service fetching metrics for:', coinId);
            const [historicalData] = await Promise.all([
                this.getHistoricalRangeData(
                    coinId,
                    Date.now() - 30 * 24 * 60 * 60 * 1000,
                    Date.now()
                )
            ]);

            const volatility = this.calculateVolatility(historicalData.prices);
            const trends = this.calculateTrends(historicalData);


            return {
                volatility,
                trends,
            };
        } catch (error) {
            console.error('CoinGecko service error:', error);
            throw error;
        }
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

    private calculateVolatility(prices: [number, number][]): VolatilityMetrics {
        const returns = prices.map((price, i) => {
            if (i === 0) return 0;
            return (price[1] - prices[i-1][1]) / prices[i-1][1];
        }).slice(1); // Remove first element (0)

        const standardDeviation = Math.sqrt(
            returns.reduce((sum, ret) => sum + ret * ret, 0) / returns.length
        );

        return {
            daily: standardDeviation * Math.sqrt(24), // Annualized daily volatility
            weekly: standardDeviation * Math.sqrt(24 * 7), // Weekly volatility
            monthly: standardDeviation * Math.sqrt(24 * 30), // Monthly volatility
            standardDeviation,
            timestamp: new Date()
        };
    }

    private calculateTrends(data: AssetHistoricalRangeData): MarketTrends {
        const prices = data.prices;
        const volumes = data.total_volumes;
        
        // Get current and historical values
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

        return {
            price: {
                change24h: this.calculatePercentageChange(price24hAgo, currentPrice),
                change7d: this.calculatePercentageChange(price7dAgo, currentPrice),
                change30d: this.calculatePercentageChange(price30dAgo, currentPrice),
                currentPrice: {
                    symbol: '', // Set this based on your needs
                    price: currentPrice,
                    timestamp: Date.now(),
                    volume: currentVolume
                },
                historicalData: data
            },
            volume: {
                change24h: this.calculatePercentageChange(volume24hAgo, currentVolume),
                change7d: this.calculatePercentageChange(volume7dAgo, currentVolume),
                change30d: this.calculatePercentageChange(volume30dAgo, currentVolume),
                currentVolume
            }
        };
    }

    // Helper methods
    private findValueNHoursAgo(
        data: [number, number][], 
        hours: number
    ): number {
        const targetTime = Date.now() - (hours * 60 * 60 * 1000);
        const closest = data.reduce((prev, curr) => {
            return Math.abs(curr[0] - targetTime) < Math.abs(prev[0] - targetTime) 
                ? curr 
                : prev;
        });
        return closest[1];
    }

    private calculatePercentageChange(
        oldValue: number, 
        newValue: number
    ): number {
        return ((newValue - oldValue) / oldValue) * 100;
    }

    async getCoinMarketData(geckoId: string) {
        try {
            const response = await axios.get(`${this.baseUrl}/coins/${geckoId}`);
            
            return {
                marketCap: response.data?.market_data?.market_cap?.usd || null,
                marketCapRank: response.data?.market_cap_rank || null,
                // Add other market data as needed
            };
        } catch (error) {
            console.error('Error fetching coin market data:', error);
            throw error;
        }
    }

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

    private async getCoingeckoId(symbol: string): Promise<string> {
        await this.updateSymbolCache();
        const id = this.symbolToIdCache.get(symbol.toLowerCase());
        if (!id) {
            throw new Error(`No coin found for symbol: ${symbol}`);
        }
        return id;
    }

    async getAssetInfoBySymbol(symbol: string): Promise<AssetInfo> {
        const coingeckoId = await this.getCoingeckoId(symbol);
        return this.getAssetInfoById(coingeckoId);
    }

    // Helper method to convert object keys to uppercase
    private convertKeysToUpperCase(obj: any): any {
        if (!obj) return null;
        
        if (Array.isArray(obj)) {
            return obj.map(item => this.convertKeysToUpperCase(item));
        }
        
        if (typeof obj === 'object') {
            return Object.keys(obj).reduce((acc, key) => {
                const upperKey = key.toUpperCase();
                acc[upperKey] = this.convertKeysToUpperCase(obj[key]);
                return acc;
            }, {} as any);
        }
        
        return obj;
    }
}