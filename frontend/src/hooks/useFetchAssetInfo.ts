import { useState, useEffect } from 'react';
import { infoService, CoinInfo } from '../services/api/info.service';

export interface AssetStats {
  marketOverview: {
    marketCap: string;
    volume: string;
    supply: string;
    change?: number;
  };
  networkActivity: {
    githubActivity: string;
    contributors: string;
    issues: string;
    change?: number;
  };
  developmentMetrics: {
    forks: string;
    stars: string;
    pullRequests: string;
    change?: number;
  };
}

export const useFetchAssetInfo = (symbol: string) => {
  const [stats, setStats] = useState<AssetStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Hook received symbol:', symbol);
    
    const fetchAssetInfo = async () => {
      if (!symbol) return;

      try {
        console.log('Starting fetch for symbol:', symbol);
        setLoading(true);
        const info: CoinInfo = await infoService.getAssetInfoBySymbol(symbol);
        console.log('Received info:', info);
        
        // Format the data for StatCards
        const formattedStats: AssetStats = {
          marketOverview: {
            marketCap: info.MARKET_CAP_RANK ? `#${info.MARKET_CAP_RANK}` : 'N/A',
            volume: info.CIRCULATING_SUPPLY ? 
              `${(info.CIRCULATING_SUPPLY / 1e9).toFixed(2)}B` : 'N/A',
            supply: info.MAX_SUPPLY ? 
              `${(info.MAX_SUPPLY / 1e6).toFixed(2)}M` : 'N/A',
            change: 0
          },
          networkActivity: {
            githubActivity: info.GITHUB_TOTAL_ISSUES?.toString() || 'N/A',
            contributors: info.GITHUB_PULL_REQUEST_CONTRIBUTORS?.toString() || 'N/A',
            issues: info.GITHUB_CLOSED_ISSUES?.toString() || 'N/A',
            change: info.GITHUB_PULL_REQUESTS_MERGED ? 5.2 : 0
          },
          developmentMetrics: {
            forks: info.GITHUB_FORKS?.toString() || 'N/A',
            stars: info.GITHUB_STARS?.toString() || 'N/A',
            pullRequests: info.GITHUB_PULL_REQUESTS_MERGED?.toString() || 'N/A',
            change: info.GITHUB_FORKS ? 3.7 : 0
          }
        };

        setStats(formattedStats);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch asset info');
      } finally {
        setLoading(false);
      }
    };

    fetchAssetInfo();
  }, [symbol]);

  return { 
    stats, 
    loading, 
    error,
    hasData: !!stats
  };
};