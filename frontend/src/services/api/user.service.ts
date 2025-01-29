import { API_BASE_URL } from '../../config/constants';

// export interface CreateUserData {
//   username: string;
//   email: string;
//   password: string;
//   walletAddress?: string | null;
// }

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
  async checkUsernameAvailability(username: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/check-username/${username}`);
      if (!response.ok) {
        throw new Error('Failed to check username');
      }
      const { available } = await response.json();
      return available;
    } catch (error) {
      console.error('Error checking username:', error);
      throw error;
    }
  }

  async createUser(userData: {
    username: string;
    email: string;
    password: string;
    walletAddress: string | null;
  }): Promise<{ user: UserData }> {
    try {
      // Check username availability before creating user
      const isAvailable = await this.checkUsernameAvailability(userData.username);
      if (!isAvailable) {
        throw new Error('Username is already taken');
      }

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
      console.error('Error creating user:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const userService = new UserService();