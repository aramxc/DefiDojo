/**
 * Utility functions for formatting and data transformation
 * Organized by category for easy maintenance and discovery
 */

// ======================================
// Wallet Address & Blockchain Related Functions
// ======================================

/**
 * Truncates an Ethereum address to a shorter format
 * Example: 0x1234...5678
 * @param address - The Ethereum address to truncate
 * @param startLength - Number of characters to show at start (default: 6)
 * @param endLength - Number of characters to show at end (default: 4)
 * @returns Truncated address string or empty string if address is undefined
 */
export const truncateAddress = (
  address: string | undefined,
  startLength: number = 6,
  endLength: number = 4
): string => {
  if (!address) return '';
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

// ======================================
// Number & Currency Formatting Functions
// ======================================

/**
 * Formats a value based on its magnitude (B, M, K)
 */
export const formatValue = (value: number | null | undefined, type: 'price' | 'marketCap' | 'volume' | 'compact' | 'number'): string => {
  if (!value && value !== 0) return 'N/A';
  
  try {
    if (type === 'price') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: value < 1 ? 4 : 2,
        maximumFractionDigits: value < 1 ? 6 : 2
      }).format(value);
    }

    const prefix = ['marketCap', 'volume'].includes(type) ? '$' : '';
    
    if (value >= 1e12) return `${prefix}${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `${prefix}${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${prefix}${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${prefix}${(value / 1e3).toFixed(2)}K`;
    
    return `${prefix}${value.toLocaleString()}`;
  } catch {
    return 'N/A';
  }
};

/**
 * Formats a percentage with proper decimals
 */
export const formatPercentage = (value: number | null | undefined): string => {
  if (!value && value !== 0) return 'N/A';
  return `${value.toFixed(2)}%`;
};

/**
 * Formats a change value as a percentage with sign
 */
export const formatChange = (value: number | null | undefined): string => {
  if (!value && value !== 0) return 'N/A';
  const prefix = value >= 0 ? '+' : '';
  return `${prefix}${value.toFixed(2)}%`;
};

/**
 * Formats a currency value with proper symbol and decimals
 * @param value - Number to format
 * @returns Formatted currency string or 'N/A' if value is undefined or null
 */
export const formatCurrency = (value: number | null | undefined): string => {
  if (!value && value !== 0) return 'N/A';
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/**
 * Formats Y-axis values based on data type
 */
export const formatYAxisValue = (value: number, type: 'price' | 'marketCap' | 'volume'): string => {
  if (!value && value !== 0) return '0';

  switch (type) {
    case 'price':
      return formatValue(value, 'price');
    case 'marketCap':
    case 'volume':
      return formatValue(value, type);
    default:
      return value.toString();
  }
};

// ======================================
// Time & Date Formatting Functions
// ======================================

/**
 * Formats a timestamp based on timeframe
 * @param timestamp - Unix timestamp
 * @param timeframe - Chart timeframe
 * @param timezone - User's timezone
 */
export const formatTimestamp = (
    timestamp: number, 
    timeframe: string, 
    timezone: string
): string => {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        month: 'short',
        day: 'numeric'
    };

    switch (timeframe) {
        case '1D': 
            return date.toLocaleTimeString([], { 
                hour: '2-digit',
                minute: '2-digit'
            });
        case '7D': 
            return date.toLocaleDateString([], { 
                month: 'short',
                day: 'numeric'
            });
        default: 
            return date.toLocaleDateString([], { 
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
    }
};

