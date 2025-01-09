export interface PriceData {
    symbol: string;
    price: number;
    timestamp: number;
    source?: string;
    confidence?: number;
    volume?: number;
    marketCap?: number;
}