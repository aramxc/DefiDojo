import { useState, useEffect } from 'react';
import { infoService, CoinInfo } from '../services/api/info.service';

export interface AssetStats {
  assetInfo: {
    name: string;
    symbol: string;
    description: string;
    countryOrigin: string;
    homepageUrl: string;
    whitepaperUrl: string;
    subredditUrl: string;
    imageUrl: string;
  };
  marketOverview: {
    marketCap: string;
    totalSupply: string;
    circulatingSupply: string;
    maxSupply: string | null;
    volumeChange?: number;
    marketCapChange?: number;
  };
  networkActivity: {
    
  };
  developmentMetrics: {
    githubActivity: string;
    contributors: string;
    issues: string;
    change?: number;
    forks: string;
    stars: string;
    pullRequests: string;
    totalIssues: string;
    closedIssues: string;
  };
  networkMetrics: {
    blockTime: string;
    hashAlgorithm: string;
    genesisDate: string;
  };
  marketSentiment: {
    bidAskSpread: string;
    description: string;
    countryOrigin: string;
  };
}

export const useFetchAssetInfo = (symbol: string) => {
  const [stats, setStats] = useState<AssetStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssetInfo = async () => {
      if (!symbol) return;

      try {
        setLoading(true);
        const info: CoinInfo = await infoService.getAssetInfoBySymbol(symbol);
        
        // Format the data to match updated AssetStats interface
        const formattedStats: AssetStats = {
          assetInfo: {
            name: info.NAME,
            symbol: info.SYMBOL,
            description: info.DESCRIPTION || 'N/A',
            countryOrigin: info.COUNTRY_ORIGIN || 'N/A',
            homepageUrl: info.HOMEPAGE_URL || 'N/A',
            whitepaperUrl: info.WHITEPAPER_URL || 'N/A',
            subredditUrl: info.SUBREDDIT_URL || 'N/A',
            imageUrl: info.IMAGE_URL || 'N/A'
          },
          marketOverview: {
            marketCap: info.MARKET_CAP_RANK ? `#${info.MARKET_CAP_RANK}` : 'N/A',
            totalSupply: info.TOTAL_SUPPLY ? 
              `${(info.TOTAL_SUPPLY / 1e6).toFixed(2)}M` : 'N/A',
            circulatingSupply: info.CIRCULATING_SUPPLY ? 
              `${(info.CIRCULATING_SUPPLY / 1e6).toFixed(2)}M` : 'N/A',
            maxSupply: info.MAX_SUPPLY ? 
              `${(info.MAX_SUPPLY / 1e6).toFixed(2)}M` : null,
            volumeChange: undefined,
            marketCapChange: undefined
          },
          networkActivity: {
            // Empty object as per your interface
          },
          developmentMetrics: {
            githubActivity: info.GITHUB_TOTAL_ISSUES?.toString() || 'N/A',
            contributors: info.GITHUB_PULL_REQUEST_CONTRIBUTORS?.toString() || 'N/A',
            issues: info.GITHUB_CLOSED_ISSUES?.toString() || 'N/A',
            change: info.GITHUB_PULL_REQUESTS_MERGED && info.GITHUB_CLOSED_ISSUES && info.GITHUB_TOTAL_ISSUES ? 
              (info.GITHUB_CLOSED_ISSUES / info.GITHUB_TOTAL_ISSUES * 100) : undefined,
            forks: info.GITHUB_FORKS?.toString() || 'N/A',
            stars: info.GITHUB_STARS?.toString() || 'N/A',
            pullRequests: info.GITHUB_PULL_REQUESTS_MERGED?.toString() || 'N/A',
            totalIssues: info.GITHUB_TOTAL_ISSUES?.toString() || 'N/A',
            closedIssues: info.GITHUB_CLOSED_ISSUES?.toString() || 'N/A'
          },
          networkMetrics: {
            blockTime: info.BLOCK_TIME_IN_MINUTES ? 
              `${info.BLOCK_TIME_IN_MINUTES} min` : 'N/A',
            hashAlgorithm: info.HASHING_ALGORITHM || 'N/A',
            genesisDate: info.GENESIS_DATE || 'N/A'
          },
          marketSentiment: {
            bidAskSpread: info.BID_ASK_SPREAD_PERCENTAGE ? 
              `${info.BID_ASK_SPREAD_PERCENTAGE.toFixed(2)}%` : 'N/A',
            description: info.DESCRIPTION?.slice(0, 100) + '...' || 'N/A',
            countryOrigin: info.COUNTRY_ORIGIN || 'N/A'
          }
        };

        setStats(formattedStats);
        setError(null);
      } catch (err) {
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