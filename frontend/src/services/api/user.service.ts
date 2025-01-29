import { API_BASE_URL } from '../../config/constants';

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  walletAddress?: string | null;
}

export interface UserData {
  userId: string;
  username: string;
  email: string;
  walletAddress?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Service for managing user-related operations
 * Handles user creation and data management via Snowflake
 */
export class UserService {
  private baseUrl = `${API_BASE_URL}/users`;

  /**
   * Creates a new user account
   * @param userData User registration data
   * @returns Promise containing created user data
   * @throws Error if user creation fails
   */
  async createUser(userData: CreateUserData): Promise<UserData> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create user');
      }

      return await response.json();
    } catch (error) {
      // Rethrow with more context if needed
      throw error instanceof Error 
        ? error 
        : new Error('User creation failed');
    }
  }
}

// Export a singleton instance
export const userService = new UserService();