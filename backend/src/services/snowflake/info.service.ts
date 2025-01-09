import NodeCache from 'node-cache';
import { connectToSnowflake } from '../../config/snowflake.config';
import { AssetRepository } from './repositories/asset.repository';
import { AssetInfo } from '../interfaces/asset.interface';

export class InfoService {
    private assetRepository: AssetRepository;
    private cache: NodeCache;

    constructor() {
        this.assetRepository = new AssetRepository();
        // Cache for 5 minutes, check for expired entries every minute
        this.cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
    }

    static async initialize() {
        try {
            await connectToSnowflake('PUBLIC');
            console.log('AssetService: Snowflake connection initialized');
        } catch (error) {
            console.error('Failed to initialize Snowflake connection:', error);
            throw error;
        }
    }

    async getAssetBySymbol(symbol: string): Promise<AssetInfo> {
        const cacheKey = `asset_${symbol.toLowerCase()}`;
        const cached = this.cache.get<AssetInfo>(cacheKey);
        
        if (cached) {
            return cached;
        }

        try {
            const asset = await this.assetRepository.findBySymbol(symbol);
            this.cache.set(cacheKey, asset);
            return asset;
        } catch (error) {
            console.error('Error fetching asset:', error);
            throw error;
        }
    }

    async getAssetById(assetId: string): Promise<AssetInfo> {
        try {
            return await this.assetRepository.findById(assetId);
        } catch (error) {
            console.error('Error fetching asset:', error);
            throw error;
        }
    }

    async getTopAssets(limit: number = 100): Promise<AssetInfo[]> {
        try {
            return await this.assetRepository.findTopByMarketCap(limit);
        } catch (error) {
            console.error('Error fetching top assets:', error);
            throw error;
        }
    }
}