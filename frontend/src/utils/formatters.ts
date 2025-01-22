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
  return `${address.slice(0, startLength)}...${endLength === 0 ? '' : address.slice(-endLength)}`;
};

export const formatPercentage = (value: any): string => {
  if (isNaN(value)) return 'N/A';
  return `${value.toFixed(2)}%`;
};

export const formatCurrency = (value: any): string => {
    if (value == null) return 'N/A';
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

// ======================================
// Chart & Number Formatting Functions
// ======================================

/**
 * Formats a value based on its magnitude (B, M, K)
 * @param value - Number to format
 * @param type - Type of value ('price' | 'marketCap' | 'volume')
 */
export const formatYAxisValue = (value: number, type: 'price' | 'marketCap' | 'volume'): string => {
    if (value === 0) return '0';
    
    if (type === 'marketCap') {
        if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
        if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
        if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    } else if (type === 'volume') {
        if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
        if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
        if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    }
    
    return value >= 1e3 ? `$${value.toLocaleString()}` : `$${value.toFixed(2)}`;
};

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
        day: 'numeric',
        weekday: 'short'
    };

    switch (timeframe) {
        case '1D': 
            return date.toLocaleTimeString([], { 
                ...options, 
                month: undefined, 
                day: undefined, 
                weekday: undefined 
            });
        case '7D': 
            return date.toLocaleDateString([], { 
                ...options, 
                hour: undefined, 
                minute: undefined 
            });
        default: 
            return date.toLocaleDateString([], { 
                ...options, 
                hour: undefined, 
                minute: undefined, 
                weekday: undefined 
            });
    }
};

/**
 * Formats a value with appropriate currency symbol and decimals
 * @param value - Number to format
 * @param type - Type of value ('price' | 'marketCap' | 'volume')
 */
export const formatValue = (
    value: number | null | undefined, 
    type: 'price' | 'marketCap' | 'volume'
): string => {
    if (value == null) return 'N/A';
    if (type === 'marketCap') return `$${(value / 1e9).toFixed(2)}B`;
    if (type === 'volume') return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
};

/**
 * Formats a change value as a percentage with two decimal places and a % sign
 * @param change - Change value
 */
export const formatChange = (change: number | undefined): string => {
  return `${(change ?? 0).toFixed(2)}%`;
};