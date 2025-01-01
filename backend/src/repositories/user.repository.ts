import { getConnection } from '../config/snowflake.config';
import { v4 as uuidv4 } from 'uuid';
import { UserProfile, AuthMethod } from '@shared/types/user.types'

export class UserRepository {
  async createUser(data: {
    username: string;
    walletAddress?: string;
    email?: string;
    authMethod: AuthMethod;
  }): Promise<UserProfile> {
    const userId = uuidv4();
    const query = `
      INSERT INTO users (
        user_id, 
        username, 
        wallet_address, 
        email, 
        auth_method,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP())
      RETURNING *
    `;

    const binds: any[] = [
      userId,
      data.username,
      data.walletAddress || null,
      data.email || null,
      data.authMethod
    ];

    return new Promise((resolve, reject) => {
      getConnection().execute({
        sqlText: query,
        binds,
        complete: (err, _stmt, rows) => {
          if (err) {
            reject(err);
          } else if (!rows?.length) {
            reject(new Error('Failed to create user: No rows returned'));
          } else {
            resolve(rows[0] as UserProfile);
          }
        }
      });
    });
  }

  async findByIdentifier(identifier: string): Promise<UserProfile | null> {
    const query = `
      SELECT * FROM users 
      WHERE wallet_address = ? 
      OR email = ?
    `;

    return new Promise((resolve, reject) => {
      getConnection().execute({
        sqlText: query,
        binds: [identifier, identifier],
        complete: (err, _stmt, rows) => {
          if (err) {
            reject(err);
          } else if (!rows?.length) {
            resolve(null);
          } else {
            resolve(rows[0] as UserProfile);
          }
        }
      });
    });
  }
}