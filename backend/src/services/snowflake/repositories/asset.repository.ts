import { getConnection } from '../../../config/snowflake.config';
import { AssetInfo } from '@defidojo/shared-types';
import { transformSnowflakeToApi } from '../../../utils/transformers';

/**
 * Repository class for handling asset-related database operations
 */
export class AssetRepository {
    /**
     * Finds an asset by its trading symbol
     * @param symbol The trading symbol (e.g., 'BTC')
     * @returns Promise<AssetInfo>
     */
    async findBySymbol(symbol: string): Promise<AssetInfo> {
        const connection = getConnection();
        
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    ID,
                    SYMBOL,
                    NAME,
                    COINGECKO_ID,
                    PYTH_PRICE_FEED_ID,
                    IS_ACTIVE
                FROM ASSETS
                WHERE SYMBOL = ?
                AND IS_ACTIVE = TRUE
                LIMIT 1
            `;

            connection.execute({
                sqlText: query,
                binds: [symbol.toUpperCase()],
                complete: (err, _stmt, rows) => {
                    if (err) {
                        reject(err);
                    } else if (!rows?.[0]) {
                        reject(new Error(`Asset not found for symbol: ${symbol}`));
                    } else {
                        const rawAsset = rows[0] as any;
                        const transformedAsset = transformSnowflakeToApi(rawAsset);
                        resolve(transformedAsset);
                    }
                }
            });
        });
    }

    async findTopByMarketCap(limit: number): Promise<AssetInfo[]> {
        const connection = getConnection();
        
        return new Promise((resolve, reject) => {
            const query = `
                SELECT *
                FROM PUBLIC.ASSETS
                WHERE IS_ACTIVE = TRUE
                ORDER BY MARKET_CAP_RANK ASC NULLS LAST
                LIMIT :1
            `;

            connection.execute({
                sqlText: query,
                binds: [limit],
                complete: (err, _stmt, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        const assets = (rows || []).map(row => {
                            const rawAsset = row as any;
                            return transformSnowflakeToApi(rawAsset);
                        });
                        resolve(assets);
                    }
                }
            });
        });
    }

    async findById(assetId: string): Promise<AssetInfo> {
        const connection = getConnection();
        
        return new Promise((resolve, reject) => {
            const query = `
                SELECT *
                FROM PUBLIC.ASSETS
                WHERE ASSET_ID = :1
                AND IS_ACTIVE = TRUE
            `;

            connection.execute({
                sqlText: query,
                binds: [assetId.toUpperCase()],
                complete: (err, _stmt, rows) => {
                    if (err) {
                        reject(err);
                    } else if (!rows?.[0]) {
                        reject(new Error('Asset not found'));
                    } else {
                        const rawAsset = rows[0] as any;
                        const transformedAsset = transformSnowflakeToApi(rawAsset);
                        resolve(transformedAsset);
                    }
                }
            });
        });
    }

    async findCoingeckoIdBySymbol(symbol: string): Promise<string> {
        const connection = getConnection();
        
        return new Promise((resolve, reject) => {
            const query = `
                SELECT COINGECKO_ID
                FROM PUBLIC.ASSETS
                WHERE SYMBOL = :1
                AND IS_ACTIVE = TRUE
                LIMIT 1
            `;

            console.log('🔍 Querying Snowflake for COINGECKO_ID, symbol:', symbol);
            
            connection.execute({
                sqlText: query,
                binds: [symbol.toUpperCase()],
                complete: (err, _stmt, rows) => {
                    if (err) {
                        console.error('❌ Snowflake Error:', err);
                        reject(err);
                    } else if (!rows?.[0]) {
                        console.warn('⚠️ No asset found for symbol:', symbol);
                        reject(new Error(`Asset not found for symbol: ${symbol}`));
                    } else {
                        const rawAsset = rows[0] as any;
                        console.log('📥 Snowflake response:', {
                            symbol: symbol,
                            coingeckoId: rawAsset.COINGECKO_ID
                        });
                        
                        if (!rawAsset.COINGECKO_ID) {
                            console.warn('⚠️ COINGECKO_ID is null for symbol:', symbol);
                            reject(new Error(`No COINGECKO_ID found for symbol: ${symbol}`));
                        }
                        
                        resolve(rawAsset.COINGECKO_ID);
                    }
                }
            });
        });
    }
}