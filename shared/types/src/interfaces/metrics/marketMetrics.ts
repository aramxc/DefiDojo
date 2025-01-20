import { AssetPriceData, AssetHistoricalRangeData } from '../market/assetPrice';

export interface VolatilityMetrics {
  daily: number;
  weekly: number;
  monthly: number;
  standardDeviation: number;
  timestamp: Date;
}

export interface MarketTrends {
  price: {
    change24h: number;
    change7d: number;
    change30d: number;
    currentPrice: AssetPriceData;
    historicalData: AssetHistoricalRangeData;
  };
  volume: {
    change24h: number;
    change7d: number;
    change30d: number;
    currentVolume: number;
  };
}

export interface MarketMetrics {
  volatility: VolatilityMetrics;
  trends: MarketTrends;
  marketCap?: number;
  marketCapRank?: number;
}