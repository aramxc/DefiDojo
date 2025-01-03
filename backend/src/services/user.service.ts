import { connectToSnowflake } from '../config/snowflake.config';
import { UserRepository } from '../repositories/user.repository';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  // Initialize with PUBLIC schema by default
  static async initialize() {
    try {
      await connectToSnowflake('PUBLIC');
      console.log('UserService: Snowflake connection initialized');
    } catch (error) {
      console.error('Failed to initialize Snowflake connection:', error);
      throw error;
    }
  }

  async createUser(userData: {
    username: string;
    email: string;
    password: string;
    walletAddress?: string;
  }) {
    try {
      return await this.userRepository.createUser(userData);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
}
