import { getConnection } from '../config/snowflake.config';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

// Add an interface for the user row data
interface UserRow {
  USER_ID: string;
  EMAIL: string;
  USERNAME: string;
  WALLET_ADDRESS: string | null;
  PASSWORD_HASH: string;
  CREATED_AT: string;
  UPDATED_AT: string;
  LAST_LOGIN: string | null;
  IS_EMAIL_VERIFIED: boolean;
}

export class UserRepository {
  async createUser(data: {
    username: string;
    walletAddress?: string;
    email: string;
    password: string;
  }) {
    // Hash the password
    const passwordHash = await bcrypt.hash(data.password, 10);

    const query = `
      INSERT INTO DEFI_DOJO.USERS.PROFILES (
        USER_ID,
        EMAIL,
        USERNAME,
        WALLET_ADDRESS,
        PASSWORD_HASH,
        CREATED_AT,
        UPDATED_AT
      )
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP())
      RETURNING *
    `;

    const binds = [
      uuidv4(),
      data.email,
      data.username,
      data.walletAddress || null,
      passwordHash
    ];

    return new Promise((resolve, reject) => {
      getConnection().execute({
        sqlText: query,
        binds: binds as any, // Type assertion to fix bind type error
        complete: (err: any, _stmt: any, rows: any) => {
          if (err) {
            // Check for unique constraint violations 
            if (err.code?.toString() === '23505') {
              reject(new Error('Username or email already exists'));
            } else {
              reject(err);
            }
          } else if (!rows?.length) {
            reject(new Error('Failed to create user: No rows returned'));
          } else {
            // Cast the row to our UserRow type and destructure
            const user = rows[0] as UserRow;
            const { PASSWORD_HASH, ...userData } = user;
            resolve(userData);
          }
        }
      });
    });
  }
}