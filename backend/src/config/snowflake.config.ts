import snowflake from 'snowflake-sdk';
import { config } from 'dotenv';

// Load environment variables
config();

// Validate Snowflake credentials
const validateSnowflakeCredentials = () => {
    const required = [
        'SNOWFLAKE_ACCOUNT',
        'SNOWFLAKE_USERNAME',
        'SNOWFLAKE_PASSWORD',
        'SNOWFLAKE_DATABASE',
        'SNOWFLAKE_WAREHOUSE'
    ];

    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        console.error('Missing Snowflake credentials:', {
            missing,
            available: {
                hasAccount: !!process.env.SNOWFLAKE_ACCOUNT,
                hasUsername: !!process.env.SNOWFLAKE_USERNAME,
                hasPassword: !!process.env.SNOWFLAKE_PASSWORD,
                hasDatabase: !!process.env.SNOWFLAKE_DATABASE,
                hasWarehouse: !!process.env.SNOWFLAKE_WAREHOUSE
            }
        });
        throw new Error(`Missing required Snowflake credentials: ${missing.join(', ')}`);
    }
};

let connection: snowflake.Connection;

const createSnowflakeConnection = (schema: 'PUBLIC' | 'USERS' = 'PUBLIC') => {
    validateSnowflakeCredentials();
    
    console.log('Creating Snowflake connection with:', {
        account: process.env.SNOWFLAKE_ACCOUNT,
        username: process.env.SNOWFLAKE_USERNAME,
        database: process.env.SNOWFLAKE_DATABASE,
        schema,
        warehouse: process.env.SNOWFLAKE_WAREHOUSE
    });

    return snowflake.createConnection({
        account: process.env.SNOWFLAKE_ACCOUNT!,
        username: process.env.SNOWFLAKE_USERNAME!,
        password: process.env.SNOWFLAKE_PASSWORD!,
        database: process.env.SNOWFLAKE_DATABASE!,
        schema,
        warehouse: process.env.SNOWFLAKE_WAREHOUSE!
    });
};

export const connectToSnowflake = (schema: 'PUBLIC' | 'USERS' = 'PUBLIC'): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            connection = createSnowflakeConnection(schema);
            
            connection.connect((err) => {
                if (err) {
                    console.error('Error connecting to Snowflake:', {
                        message: err.message,
                        code: err.code,
                        state: err.sqlState
                    });
                    reject(err);
                    return;
                }

                console.log('Connected to Snowflake successfully');
                resolve();
            });
        } catch (error) {
            console.error('Error creating Snowflake connection:', error);
            reject(error);
        }
    });
};

export const getConnection = () => {
    if (!connection) {
        throw new Error('Snowflake connection not initialized. Call connectToSnowflake first.');
    }
    return connection;
};

// Utility function to switch schemas on an existing connection
export const useSchema = (schema: 'PUBLIC' | 'USERS'): Promise<void> => {
  return new Promise((resolve, reject) => {
    getConnection().execute({
      sqlText: `USE SCHEMA ${schema}`,
      complete: (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    });
  });
};

// Utility function to ensure warehouse is set
export const ensureWarehouse = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    getConnection().execute({
      sqlText: `USE WAREHOUSE ${process.env.SNOWFLAKE_WAREHOUSE}`,
      complete: (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    });
  });
};