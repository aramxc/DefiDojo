import { API_BASE_URL } from '../../config/constants';
import { AssetInfo } from '@defidojo/shared-types';

/**
 * Service for handling asset information related API calls.
 * Provides methods to fetch asset details, IDs, and market data from the backend.
 */
export class InfoService {
    public baseUrl = `${API_BASE_URL}/info`;

    /**
     * Fetches basic asset information including the CoinGecko ID for a given trading symbol
     * @param symbol Trading symbol (e.g., 'BTC')
     * @returns Promise containing asset basic info including coingeckoId
     * @throws Error if no coingeckoId is found or if the request fails
     */
    async getAssetIdBySymbol(symbol: string): Promise<AssetInfo> {
        try {
            console.log('📡 InfoService: Fetching asset ID for symbol:', symbol);
            const response = await fetch(
                `${this.baseUrl}/symbol/${symbol}?realTime=false`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('✅ InfoService: Received data:', data);
            
            // Check for either coingeckoId or id
            if (!data?.coingeckoId && !data?.id) {
                console.warn('⚠️ InfoService: No ID found in response:', data);
                throw new Error(`No coingeckoId found for symbol: ${symbol}`);
            }
            
            return {
                ...data,
                // Ensure we have a coingeckoId, fallback to id if needed
                coingeckoId: data.coingeckoId || data.id
            };
        } catch (error) {
            console.error('❌ InfoService: Error in getAssetIdBySymbol:', error);
            throw error;
        }
    }

    /**
     * Fetches detailed asset information by symbol with optional real-time data
     * @param symbol Trading symbol (e.g., 'BTC')
     * @param getRealTimeData Whether to fetch real-time market data
     * @returns Promise containing complete asset information
     */
    async getAssetInfoBySymbol(symbol: string, getRealTimeData: boolean = false): Promise<AssetInfo> {
        try {
            console.log('Fetching asset info:', {
                url: `${this.baseUrl}/${symbol}?realTime=${getRealTimeData}`,
                symbol,
                getRealTimeData
            });

            const response = await fetch(
                `${this.baseUrl}/${symbol}?realTime=${getRealTimeData}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching asset info:', error);
            throw error;
        }
    }

    /**
     * Fetches a list of top assets by market cap
     * @param limit Maximum number of assets to return (default: 100)
     * @returns Promise containing array of asset information
     */
    async getTopAssetsInfo(limit: number = 100): Promise<AssetInfo[]> {
        try {
            const response = await fetch(`${this.baseUrl}/top/${limit}`);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch top coins');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching top coins:', error);
            throw error;
        }
    }

    /**
     * Fetches detailed asset information by CoinGecko ID with optional real-time data
     * @param coingeckoId CoinGecko ID of the asset
     * @param getRealTimeData Whether to fetch real-time market data
     * @returns Promise containing complete asset information
     * @throws Error if the coingeckoId is missing or if the request fails
     */
    async getAssetInfoById(coingeckoId: string, getRealTimeData: boolean = false): Promise<AssetInfo> {
        try {
            if (!coingeckoId) {
                throw new Error('Asset ID is required');
            }

            console.log('📡 InfoService: Fetching asset info for ID:', {
                coingeckoId,
                getRealTimeData,
                url: `${this.baseUrl}/id/${coingeckoId}?realTime=${getRealTimeData}`
            });

            const response = await fetch(
                `${this.baseUrl}/id/${coingeckoId}?realTime=${getRealTimeData}`
            );

            console.log('📥 InfoService: Raw response:', response);

            if (!response.ok) {
                console.error('❌ InfoService: Failed response:', response.status, response.statusText);
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch asset info');
            }

            const data = await response.json();
            console.log('✅ InfoService: Parsed asset info:', data);
            return data;
        } catch (error) {
            console.error('❌ InfoService: Error in getAssetInfoById:', error);
            throw error;
        }
    }

    /**
     * Fetches market data for a specific asset
     * @param coingeckoId CoinGecko ID of the asset
     * @returns Promise containing market data
     */
    async getMarketData(coingeckoId: string): Promise<any> {
        const response = await fetch(`${this.baseUrl}/market/${coingeckoId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch market data');
        }
        return response.json();
    }
}

export const infoService = new InfoService();