import { getConnection } from '../../config/snowflake.config';
import { AssetInfo } from '../../interfaces/info/assetInfo';
import { PriceData } from '../../interfaces/market/price.interface';
import { snowflakeQueries } from './snowflake.queries';

export class SnowflakeService {
    async getAssetInfo(symbol: string): Promise<AssetInfo> {
        try {
            const result = await getConnection().execute({
                sqlText: snowflakeQueries.getAssetInfo,
                binds: { symbol: symbol.toUpperCase() }
            });
            
            if (!result.rows?.[0]) {
                throw new Error('Asset not found');
            }
            
            return this.transformAssetData(result.rows[0]);
        } catch (error) {
            console.error('Snowflake getAssetInfo error:', error);
            throw error;
        }
    }

    private transformAssetData(row: any): AssetInfo {
        // Transform database row to AssetInfo interface
        return {
            id: row.COINGECKO_ID,
            symbol: row.SYMBOL,
            name: row.NAME,
            image: row.IMAGE,
            links: row.LINKS,
            description: row.DESCRIPTION,
            sentiment_votes_up_percentage: row.SENTIMENT_VOTES_UP_PERCENTAGE,
            market_cap_rank: row.MARKET_CAP_RANK,
            coingecko_rank: row.COINGECKO_RANK,
        };
    }
}