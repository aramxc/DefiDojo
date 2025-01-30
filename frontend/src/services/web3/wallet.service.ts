import { toast } from 'react-toastify';

/**
 * Service to handle all Ethereum wallet (MetaMask) interactions
 * Provides methods for connecting, disconnecting, and managing wallet events
 */
export class WalletService {
  /**
   * Request wallet connection from MetaMask.
   * This will trigger the MetaMask popup if user needs to connect.
   * @returns Promise<string | null> - Returns wallet address if connected, null if not
   * @throws Error if MetaMask is not installed or user rejects connection
   */
  static async requestConnection(): Promise<string | null> {
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to connect');
      }

      // Request account access from MetaMask
      // This triggers MetaMask popup
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      // Return the first account address or null
      return accounts?.[0] || null;
    } catch (error: any) {
      // Handle user rejection specifically (MetaMask error code 4001)
      if (error?.code === 4001) {
        throw new Error('User rejected wallet connection');
      }
      throw error;
    }
  }

  /**
   * Disconnect the wallet by clearing permissions and local storage.
   * Note: MetaMask doesn't have a true "disconnect" method, so we clear permissions
   */
  static async disconnectWallet(): Promise<void> {
    if (!window.ethereum?.request) return;

    try {
      // Clear wallet permissions
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      });
      
      // Clear connected accounts
      await window.ethereum.request({
        method: 'eth_accounts'
      });
      
      // Remove stored wallet address
      localStorage.removeItem('walletAddress');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  }

  /**
   * Setup event listeners for wallet state changes
   * @param onAccountsChanged - Callback function when user changes accounts
   */
  static setupWalletListeners(onAccountsChanged: (accounts: string[]) => void): void {
    if (!window.ethereum) return;

    // Listen for account changes (user switches accounts in MetaMask)
    window.ethereum.on('accountsChanged', onAccountsChanged);
    
    // Listen for chain changes (user switches networks)
    // Reload the page to ensure everything is in sync
    window.ethereum.on('chainChanged', () => window.location.reload());
  }

  /**
   * Clean up event listeners to prevent memory leaks
   */
  static removeWalletListeners(): void {
    if (!window.ethereum?.removeListener) return;

    // Remove all wallet event listeners
    window.ethereum.removeListener('accountsChanged', () => {});
    window.ethereum.removeListener('chainChanged', () => {});
  }
}