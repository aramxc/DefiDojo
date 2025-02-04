/**
 * Utility functions for formatting and data transformation
 * Organized by category for easy maintenance and discovery
 */

import { differenceInDays, differenceInMonths, differenceInYears } from 'date-fns';

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
 * Formats a value based on its magnitude (Thousands, Millions, Billions, Trillions)
 */
export const formatValue = (
  value: number | null | undefined, 
  type: 'price' | 'marketCap' | 'volume' | 'compact' | 'number'
): string => {
  if (!value && value !== 0) return 'N/A';
  
  try {
    if (type === 'price') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: value < 1 ? 3 : 2,
        maximumFractionDigits: value < 1 ? 4 : 2
      }).format(value);
    }

    const prefix = ['price', 'marketCap', 'volume'].includes(type) ? '$' : '';
    
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
 * Formats a percentage with proper decimals and commas if value is greater than 100
 */
export const formatPercentage = (value: number | string | null | undefined): string => {
  if (!value && value !== 0) return 'N/A';
  if (typeof value === 'string') value = parseFloat(value);
            
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
 * Formats a time difference in a human-readable format (e.g., "2 years ago")
 * @param timestamp - Unix timestamp (in milliseconds) or ISO date string
 * @returns Formatted time difference string
 */
export const formatTimeDifference = (timestamp: number | string | null | undefined): string => {
  if (!timestamp) return 'N/A';
  
  const date = new Date(timestamp);
  if (date.toString() === 'Invalid Date') return 'N/A';
  
  try {
    const now = new Date();
    const years = differenceInYears(now, date);
    const months = differenceInMonths(now, date);
    const days = differenceInDays(now, date);

    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } catch {
    return 'N/A';
  }
};

/**
 * Formats a timestamp based on timeframe or custom date range with validation
 * @param timestamp - Unix timestamp (in milliseconds) or ISO date string
 * @param timeframe - Chart timeframe or date format
 * @param timezone - User's timezone
 * @param customDateRange - Optional date range for custom view
 * @returns Formatted date string or 'N/A' if invalid
 */
export const formatTimestamp = (
    timestamp: number | string | null | undefined,
    timeframe: string,
    timezone: string,
    customDateRange?: { from: Date | null; to: Date | null }
): string => {
    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp);
    if (date.toString() === 'Invalid Date') return 'N/A';

    try {
        const durationInDays = timeframe === 'custom' && customDateRange?.from && customDateRange?.to
            ? Math.ceil((customDateRange.to.getTime() - customDateRange.from.getTime()) / (1000 * 60 * 60 * 24))
            : null;

        switch (true) {
            case timeframe === '1D' || (durationInDays && durationInDays <= 1):
                return date.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    timeZone: timezone 
                });
                
            case timeframe === '7D' || (durationInDays && durationInDays <= 7):
                return date.toLocaleDateString([], { 
                    month: 'short', 
                    day: 'numeric',
                    timeZone: timezone
                });
                
            case timeframe === 'MMM DD, YYYY':
                return date.toLocaleDateString([], { 
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    timeZone: timezone
                });
                
            default:
                return date.toLocaleDateString([], { 
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    timeZone: timezone
                });
        }
    } catch {
        return 'N/A';
    }
};

