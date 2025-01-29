import { API_BASE_URL } from '../../config/constants';
import { AssetInfo } from '@defidojo/shared-types';

/**
 * Service for handling asset information related API calls
 */
export class InfoService {
    public baseUrl = `${API_BASE_URL}/info`;

    /**
     * Fetches the CoinGecko ID for a given trading symbol
     * @param symbol Trading symbol (e.g., 'BTC')
     * @returns Promise containing asset basic info including coingeckoId
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

    async getMarketData(coingeckoId: string): Promise<any> {
        const response = await fetch(`${this.baseUrl}/market/${coingeckoId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch market data');
        }
        return response.json();
    }
}

// Export a singleton instance
export const infoService = new InfoService();

// // SWR hook for data fetching with caching
// export function useAssetInfo(symbol: string) {
//     const { data, error, isLoading } = useSWR(
//         symbol ? `/api/info/${symbol}` : null,
//         () => infoService.getAssetInfoBySymbol(symbol)
//     );

//     return {
//         assetInfo: data,
//         isLoading,
//         error
//     };
// }