export interface FearGreed {
    value: number;
    components: FearGreedComponents;
    timestamp: Date;
}
export interface FearGreedComponents {
    volatility: number;
    momentum: number;
    socialMetrics: number;
}
