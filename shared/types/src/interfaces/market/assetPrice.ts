export interface AssetPriceData {
    symbol: string;
    price: number;
    timestamp?: number;
    source?: string;
    confidence?: number;
    volume?: number;
    marketCap?: number;
}


export interface AssetHistoricalRangeData {
    prices: [number, number][];
    market_caps: [number, number][];
    total_volumes: [number, number][];
}