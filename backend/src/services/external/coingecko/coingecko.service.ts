import axios from 'axios';
import { config, validateCoinGeckoKey } from '../../../config/constants';
import { 
    AssetInfo,
    AssetHistoricalRangeData,
    MarketMetrics,
    VolatilityMetrics,
    MarketTrends,
    FearGreed,
} from '@defidojo/shared-types';

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

    async getHistoricalRangeData(
        coinId: string, 
        from: number, 
        to: number
    ): Promise<AssetHistoricalRangeData> {
        const timeRangeInDays = (to - from) / (24 * 60 * 60 * 1000);
        
        if (timeRangeInDays > 90) {
            if (!config.coinGeckoProApiKey) {
                throw new Error('Pro API key required for historical data over 90 days');
            }
            
            const url = `${config.coinGeckoProBaseUrl}/coins/${coinId}/market_chart/range`;
            
            try {
                const response = await axios.get<AssetHistoricalRangeData>(url, {
                    params: {
                        vs_currency: 'usd',
                        from: Math.floor(from / 1000),
                        to: Math.floor(to / 1000),
                    },
                    headers: {
                        'x-cg-pro-api-key': config.coinGeckoProApiKey
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
                    hasApiKey: !!config.coinGeckoProApiKey
                });
                throw error;
            }
        }
        
        const url = `${config.coinGeckoBaseUrl}/coins/${coinId}/market_chart/range`;
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

    async getCoinInfo(coinId: string): Promise<AssetInfo> {
        const baseUrl = config.coinGeckoProApiKey ? config.coinGeckoProBaseUrl : config.coinGeckoBaseUrl;
        const url = `${baseUrl}/coins/${coinId}`;
        
        const headers = config.coinGeckoProApiKey ? { 'x-cg-pro-api-key': config.coinGeckoProApiKey } : {};
        
        const response = await axios.get(url, {
            params: {
                localization: false,
                tickers: false,
                market_data: true,
                community_data: false,
                developer_data: true,
                sparkline: false
            },
            headers
        });

        if (!response.data) {
            throw new Error('Invalid data format from CoinGecko API');
        }
        
        // Transform the response to match our AssetInfo interface
        return this.transformToAssetInfo(response.data);
    }

    private transformToAssetInfo(data: any): AssetInfo {
        return {
            ASSET_ID: data.id,
            NAME: data.name,
            SYMBOL: data.symbol?.toUpperCase(),
            COINGECKO_ID: data.id,
            PYTH_PRICE_FEED_ID: null, // Not available from CoinGecko
            IS_ACTIVE: true,
            MARKET_CAP_RANK: data.market_cap_rank,
            CREATED_AT: new Date().toISOString(),
            UPDATED_AT: new Date().toISOString(),
            BLOCK_TIME_IN_MINUTES: data.block_time_in_minutes,
            HASHING_ALGORITHM: data.hashing_algorithm,
            DESCRIPTION: data.description?.en,
            HOMEPAGE_URL: data.links?.homepage?.[0],
            WHITEPAPER_URL: data.links?.whitepaper,
            SUBREDDIT_URL: data.links?.subreddit_url,
            IMAGE_URL: data.image?.large,
            COUNTRY_ORIGIN: data.country_origin,
            GENESIS_DATE: data.genesis_date ? new Date(data.genesis_date).toISOString() : null,
            TOTAL_SUPPLY: data.market_data?.total_supply,
            MAX_SUPPLY: data.market_data?.max_supply,
            CIRCULATING_SUPPLY: data.market_data?.circulating_supply,
            GITHUB_REPOS: data.links?.repos_url?.github || [],
            GITHUB_FORKS: data.developer_data?.forks,
            GITHUB_STARS: data.developer_data?.stars,
            GITHUB_SUBSCRIBERS: data.developer_data?.subscribers,
            GITHUB_TOTAL_ISSUES: data.developer_data?.total_issues,
            GITHUB_CLOSED_ISSUES: data.developer_data?.closed_issues,
            GITHUB_PULL_REQUESTS_MERGED: data.developer_data?.pull_requests_merged,
            GITHUB_PULL_REQUEST_CONTRIBUTORS: data.developer_data?.pull_request_contributors,
            BID_ASK_SPREAD_PERCENTAGE: data.market_data?.bid_ask_spread_percentage
        };
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
            const fearGreed = this.calculateFearGreedIndex(volatility, trends);

            return {
                fearGreed,
                volatility,
                trends
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

    private calculateFearGreedIndex(
        volatility: VolatilityMetrics,
        trends: MarketTrends
    ): FearGreed {
        // Normalize values to 0-100 scale
        const volatilityScore = Math.max(0, Math.min(100, 
            50 - (volatility.daily * 100)
        ));

        const momentumScore = Math.max(0, Math.min(100,
            50 + trends.price.change24h
        ));

        const volumeScore = Math.max(0, Math.min(100,
            50 + trends.volume.change24h
        ));

        // Calculate final fear and greed value
        const value = Math.round(
            volatilityScore * 0.25 +
            momentumScore * 0.25 +
            volumeScore * 0.25
        );

        return {
            value,
            components: {
                volatility: volatilityScore,
                momentum: momentumScore,
                socialMetrics: 50 // Default neutral value
            },
            timestamp: new Date()
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
}