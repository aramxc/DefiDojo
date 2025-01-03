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

export class UserService {
  private baseUrl = `${API_BASE_URL}/users`;

  async createUser(userData: CreateUserData): Promise<UserData> {
    try {
      console.log('Creating user with data:', { ...userData, password: '[REDACTED]' });
      
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

      const data = await response.json();
      console.log('User created successfully:', { ...data, password: '[REDACTED]' });
      
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const userService = new UserService();