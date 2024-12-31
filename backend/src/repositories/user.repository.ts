import { getConnection } from '../config/snowflake.config';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

export interface UserProfile {
  userId: string;
  email?: string;
  username: string;
  walletAddress?: string;
  passwordHash?: string;
}

export class UserRepository {
  private connection;

  constructor() {
    this.connection = getConnection();
  }

  async createUser(profile: Partial<UserProfile>): Promise<UserProfile> {
    const userId = uuidv4();
    const passwordHash = profile.passwordHash 
      ? await bcrypt.hash(profile.passwordHash, 10) 
      : null;

    const query = `
      INSERT INTO profiles (
        user_id, email, username, wallet_address, password_hash
      ) VALUES (
        ?, ?, ?, ?, ?
      )
    `;

    return new Promise((resolve, reject) => {
      this.connection.execute({
        sqlText: query,
        binds: [
          userId,
          profile.email || null,
          profile.username,
          profile.walletAddress || null,
          passwordHash
        ],
        complete: (err, _stmt, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              userId,
              ...profile,
              passwordHash: undefined
            });
          }
        }
      });
    });
  }

  async findByWalletAddress(walletAddress: string): Promise<UserProfile | null> {
    const query = `
      SELECT user_id, email, username, wallet_address 
      FROM profiles 
      WHERE wallet_address = ?
    `;

    return new Promise((resolve, reject) => {
      this.connection.execute({
        sqlText: query,
        binds: [walletAddress],
        complete: (err, _stmt, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows[0] || null);
          }
        }
      });
    });
  }

  // Add more repository methods as needed
}