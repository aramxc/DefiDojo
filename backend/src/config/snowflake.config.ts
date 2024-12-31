import snowflake from 'snowflake-sdk';
import { config } from 'dotenv';

config();

const connection = snowflake.createConnection({
  account: process.env.SNOWFLAKE_ACCOUNT!,
  username: process.env.SNOWFLAKE_USERNAME!,
  password: process.env.SNOWFLAKE_PASSWORD!,
  database: 'web3_academy',
  schema: 'users',
  warehouse: process.env.SNOWFLAKE_WAREHOUSE!
});

export const connectToSnowflake = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    connection.connect((err, conn) => {
      if (err) {
        reject(err);
      } else {
        console.log('Successfully connected to Snowflake');
        resolve();
      }
    });
  });
};

export const getConnection = () => connection;