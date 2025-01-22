import { API_BASE_URL } from '../../config/constants';
import { AssetInfo } from '@defidojo/shared-types';

export class InfoService {
    private baseUrl = `${API_BASE_URL}/info`;

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

            const data = await response.json();
            return data;
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

    async getAssetInfoById(assetId: string): Promise<AssetInfo> {
        try {
            const response = await fetch(`${this.baseUrl}/id/${assetId}`);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch coin info');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching coin info:', error);
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