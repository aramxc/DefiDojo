import { connectToSnowflake, getConnection, useSchema } from '../config/snowflake.config';

export class UserService {
  // Initialize Snowflake connection when service starts
  static async initialize() {
    try {
      // Connect with USERS schema
      await connectToSnowflake('USERS');
      console.log('UserService: Snowflake connection initialized');
    } catch (error) {
      console.error('Failed to initialize Snowflake connection:', error);
      throw error;
    }
  }

  async createUser(walletAddress: string, username: string) {
    try {
      // Get the existing connection
      const connection = getConnection();
      
      return new Promise((resolve, reject) => {
        connection.execute({
          sqlText: `
            INSERT INTO users (wallet_address, username, created_at)
            VALUES (?, ?, CURRENT_TIMESTAMP())
          `,
          binds: [walletAddress, username],
          complete: (err, stmt, rows) => {
            if (err) {
              reject(err);
            } else {
              resolve(rows);
            }
          }
        });
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUserVotes() {
    try {
      // Switch to PUBLIC schema to access votes table
      await useSchema('PUBLIC');
      
      return new Promise((resolve, reject) => {
        getConnection().execute({
          sqlText: 'SELECT * FROM votes',
          complete: (err, stmt, rows) => {
            if (err) {
              reject(err);
            } else {
              resolve(rows);
            }
          }
        });
      });
    } catch (error) {
      console.error('Error fetching user votes:', error);
      throw error;
    } finally {
      // Switch back to USERS schema
      await useSchema('USERS');
    }
  }
}

// Usage in your application startup
async function startApp() {
  try {
    await UserService.initialize();
    const userService = new UserService();
    
    // Create a new user
    await userService.createUser('0x123...', 'cryptoUser');
    
    // Get votes (this will handle schema switching automatically)
    const votes = await userService.getUserVotes();
    
  } catch (error) {
    console.error('Application startup failed:', error);
  }
}
