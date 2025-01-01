import snowflake from 'snowflake-sdk';
import { config } from 'dotenv';

config();

const requiredEnvVars = [
  'SNOWFLAKE_ACCOUNT',
  'SNOWFLAKE_USERNAME',
  'SNOWFLAKE_PASSWORD',
  'SNOWFLAKE_DATABASE',
  'SNOWFLAKE_WAREHOUSE'
] as const;

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

// Create a connection factory function
const createSnowflakeConnection = (schema: 'PUBLIC' | 'USERS' = 'PUBLIC') => {
  return snowflake.createConnection({
    account: process.env.SNOWFLAKE_ACCOUNT!,
    username: process.env.SNOWFLAKE_USERNAME!,
    password: process.env.SNOWFLAKE_PASSWORD!,
    database: process.env.SNOWFLAKE_DATABASE!,
    schema,
    warehouse: process.env.SNOWFLAKE_WAREHOUSE!,
    clientSessionKeepAlive: true,
    authenticator: 'SNOWFLAKE'
  });
};

let connection: snowflake.Connection;

export const connectToSnowflake = (schema: 'PUBLIC' | 'USERS' = 'PUBLIC'): Promise<void> => {
  connection = createSnowflakeConnection(schema);
  
  return new Promise((resolve, reject) => {
    connection.connect((err, conn) => {
      if (err) {
        reject(err);
      } else {
        console.log(`Successfully connected to Snowflake using schema: ${schema}`);
        resolve();
      }
    });
  });
};

export const getConnection = () => {
  if (!connection) {
    throw new Error('Snowflake connection not initialized. Call connectToSnowflake first.');
  }
  return connection;
};

// Add a utility to switch schemas on an existing connection
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