import { getConnection, useSchema } from '../config/snowflake.config';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { ensureWarehouse } from '../config/snowflake.config';

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
    const userId = uuidv4();

    // Ensure we're using the USERS schema
    await useSchema('USERS');

    // Insert Query to create user
    const insertQuery = `
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
    `;

    const insertBinds = [
      userId,
      data.email,
      data.username,
      data.walletAddress || null,
      passwordHash
    ];

    // Select Query to get the newly created user
    const selectQuery = `
      SELECT 
        USER_ID,
        EMAIL,
        USERNAME,
        WALLET_ADDRESS,
        CREATED_AT,
        UPDATED_AT
      FROM DEFI_DOJO.USERS.PROFILES 
      WHERE USER_ID = ?
    `;

    // Ensure warehouse is set before executing queries
    await ensureWarehouse();

    return new Promise((resolve, reject) => {
      // Execute INSERT
      getConnection().execute({
        sqlText: insertQuery,
        binds: insertBinds as any,
        complete: (err: any) => {
          if (err) {
            console.error('Snowflake INSERT error:', err);
            if (err.message?.toLowerCase().includes('unique') || 
                err.message?.toLowerCase().includes('duplicate')) {
              reject(new Error('Username or email already exists'));
            } else {
              reject(new Error('Failed to create user'));
            }
            return;
          }

          // If INSERT successful, execute SELECT
          getConnection().execute({
            sqlText: selectQuery,
            binds: [userId],
            // callback function to handle the result of the query execution:
            complete: (err: any, _stmt: any, rows: any) => {
              if (err) {
                console.error('Snowflake SELECT error:', err);
                reject(new Error('Failed to retrieve user data'));
                return;
              }
              
              if (!rows?.length) {
                console.error('No rows returned for userId:', userId);
                reject(new Error('User created but not found'));
                return;
              }

              const user = rows[0] as UserRow;
              resolve(user);
            }
          });
        }
      });
    });
  }
}