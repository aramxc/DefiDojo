export interface UserProfile {
    userId: string;
    username: string;
    walletAddress?: string;  // Optional for email users
    email?: string;         // Optional for wallet users
    createdAt: Date;
  }
  
  export type AuthMethod = 'wallet' | 'email';