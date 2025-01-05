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
