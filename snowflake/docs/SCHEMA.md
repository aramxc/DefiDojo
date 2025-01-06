# Snowflake Schema Documentation

## Overview
Our Snowflake implementation consists of several schemas designed to handle user subscriptions, historical price data, and analytics. This document outlines the database structure and relationships, providing a comprehensive guide for new users to understand the current setup.

## Schemas

### PUBLIC Schema
Contains core data accessible to all authenticated users.

#### Tables
1. **ASSETS**
   - **Description**: Master table of supported digital assets
   - **Primary Key**: ASSET_ID
   - **Columns**:
     - `ASSET_ID VARCHAR(10)` - Unique identifier for the asset (PRIMARY KEY)
     - `NAME VARCHAR(100)` - Full name of the asset
     - `SYMBOL VARCHAR(10)` - Trading symbol
     - `COINGECKO_ID VARCHAR(100)` - CoinGecko API identifier
     - `PYTH_PRICE_FEED_ID VARCHAR(100)` - Pyth Network price feed identifier
     - `IS_ACTIVE BOOLEAN` - Whether the asset is currently active (DEFAULT TRUE)
     - `MARKET_CAP_RANK NUMBER(38,0)` - Market capitalization ranking
     - `CREATED_AT TIMESTAMP_NTZ(9)` - Record creation timestamp (DEFAULT CURRENT_TIMESTAMP())
     - `UPDATED_AT TIMESTAMP_NTZ(9)` - Last update timestamp (DEFAULT CURRENT_TIMESTAMP())
   - **Notes**: Central reference table for all supported assets
   - **Relationships**: Referenced by PRICE_HISTORY and other price-related tables

2. **PRICE_HISTORY**
   - **Description**: Consolidated price history from multiple sources
   - **Primary Key**: ID
   - **Indexes**: (ASSET_ID, TIMESTAMP, DATA_SOURCE)
   - **Columns**:
     - `ID NUMBER(38,0)` - Unique identifier (IDENTITY, PRIMARY KEY)
     - `ASSET_ID VARCHAR(10)` - Reference to ASSETS table
     - `TIMESTAMP TIMESTAMP_NTZ(9)` - Time of price record
     - `PRICE_USD NUMBER(18,8)` - Price in USD
     - `MARKET_CAP_USD NUMBER(38,0)` - Market capitalization
     - `VOLUME_24H_USD NUMBER(38,0)` - 24-hour trading volume
     - `HIGH_24H_USD NUMBER(18,8)` - 24-hour high price
     - `LOW_24H_USD NUMBER(18,8)` - 24-hour low price
     - `DATA_SOURCE VARCHAR(50)` - Source of price data (e.g., 'PYTH', 'COINGECKO')
     - `CONFIDENCE_INTERVAL NUMBER(18,8)` - Confidence level of price data
     - `CREATED_AT TIMESTAMP_NTZ(9)` - Record creation timestamp (DEFAULT CURRENT_TIMESTAMP())
   - **Notes**: 
     - Stores raw price data from multiple sources
     - Used as source for PRICE_HISTORY_FREE and PRICE_HISTORY_PREMIUM
     - Includes confidence metrics for price accuracy

3. **PRICE_HISTORY_FREE**
   - **Description**: Stores basic historical price data available to all users
   - **Retention**: 1 year of historical data
   - **Columns**:
     - `ID NUMBER(38,0)` - Unique identifier (IDENTITY, PRIMARY KEY)
     - `ASSET_ID VARCHAR(10)` - Token identifier (e.g., 'BTC', 'ETH')
     - `TIMESTAMP TIMESTAMP_NTZ(9)` - Time of price record
   - **Access**: Available to all authenticated users
   - **Notes**: Limited to last 12 months of data

4. **PRICE_HISTORY_PREMIUM**
   - **Description**: Stores detailed historical data and advanced metrics
   - **Retention**: Full historical data
   - **Columns**:
     - `ID NUMBER(38,0)` - Unique identifier (IDENTITY, PRIMARY KEY)
     - `ASSET_ID VARCHAR(10)` - Token identifier
     - `TIMESTAMP TIMESTAMP_NTZ(9)` - Time of price record
     - `PRICE_USD NUMBER(18,8)` - Price in USD
     - `MARKET_CAP_USD NUMBER(38,0)` - Market capitalization
     - `VOLUME_24H_USD NUMBER(38,0)` - 24-hour trading volume
     - `HIGH_24H_USD NUMBER(18,8)` - 24-hour high price
     - `LOW_24H_USD NUMBER(18,8)` - 24-hour low price
     - `VOLATILITY_24H NUMBER(18,8)` - 24-hour volatility
     - `RSI_14D NUMBER(18,8)` - 14-day Relative Strength Index
     - `MA_50D NUMBER(18,8)` - 50-day Moving Average
     - `ADDITIONAL_METRICS VARIANT` - JSON field for flexible metric storage
     - `CREATED_AT TIMESTAMP_NTZ(9)` - Record creation timestamp
   - **Access**: Available only to premium subscribers
   - **Notes**: Contains advanced analytics and full history

### USERS Schema
Manages user profiles, subscriptions, permissions, and notifications.

#### Tables
1. **PROFILES**
   - **Description**: Core user identity and authentication information
   - **Primary Key**: USER_ID
   - **Columns**:
     - `USER_ID VARCHAR(36)` - Unique identifier (PRIMARY KEY, DEFAULT UUID_STRING())
     - `EMAIL VARCHAR(255)` - User's email address (UNIQUE)
     - `USERNAME VARCHAR(50)` - User's chosen username (UNIQUE)
     - `WALLET_ADDRESS VARCHAR(42)` - Ethereum wallet address (UNIQUE)
     - `PASSWORD_HASH VARCHAR(255)` - Hashed password
     - `CREATED_AT TIMESTAMP_NTZ(9)` - Account creation time (DEFAULT CURRENT_TIMESTAMP())
     - `UPDATED_AT TIMESTAMP_NTZ(9)` - Last profile update (DEFAULT CURRENT_TIMESTAMP())
     - `LAST_LOGIN TIMESTAMP_NTZ(9)` - Most recent login timestamp
     - `IS_EMAIL_VERIFIED BOOLEAN` - Email verification status (DEFAULT FALSE)
   - **Notes**: 
     - Central user identity table
     - Stores authentication and verification data
     - Links traditional auth with web3 wallets
   - **Relationships**:
     - Referenced by USER_SUBSCRIPTIONS
     - Referenced by USER_PERMISSIONS
     - Referenced by SUBSCRIPTION_NOTIFICATIONS

2. **SUBSCRIPTION_TYPES**
   - **Description**: Defines available subscription plans
   - **Primary Key**: TYPE_ID
   - **Columns**:
     - `TYPE_ID VARCHAR(20)` - Unique identifier for subscription type (PRIMARY KEY)
     - `DESCRIPTION VARCHAR(255)` - Detailed description of subscription plan
     - `IS_ACTIVE BOOLEAN` - Whether plan is currently available (DEFAULT TRUE)
     - `CREATED_AT TIMESTAMP_NTZ(9)` - Record creation time (DEFAULT CURRENT_TIMESTAMP())
   - **Notes**:
     - Maintains catalog of subscription options
     - Used for subscription management and billing
   - **Relationships**:
     - Referenced by USER_SUBSCRIPTIONS
     - Used in subscription creation procedures

3. **USER_SUBSCRIPTIONS**
   - **Description**: Tracks all subscription purchases and renewals
   - **Primary Key**: subscription_id
   - **Columns**:
     - `subscription_id NUMBER` - Unique identifier (IDENTITY, PRIMARY KEY)
     - `user_id VARCHAR(36)` - Reference to PROFILES
     - `asset_id VARCHAR(10)` - Token being subscribed to
     - `subscription_type_id VARCHAR(20)` - Reference to SUBSCRIPTION_TYPES
     - `start_date TIMESTAMP_NTZ` - Subscription start
     - `end_date TIMESTAMP_NTZ` - Subscription end
     - `payment_amount DECIMAL(18,2)` - Amount paid
     - `payment_currency VARCHAR(3)` - Currency of payment
     - `created_at TIMESTAMP_NTZ` - Record creation time
   - **Notes**: 
     - Maintains payment history
     - Tracks subscription periods
     - Links users to their subscribed assets

4. **USER_PERMISSIONS**
   - **Description**: Manages access control for premium features
   - **Columns**:
     - `permission_id NUMBER` - Unique identifier (IDENTITY, PRIMARY KEY)
     - `user_id VARCHAR(36)` - Reference to PROFILES
     - `asset_id VARCHAR(10)` - Token access is granted for
     - `permission_level VARCHAR(20)` - Level of access
     - `granted_at TIMESTAMP_NTZ` - When access was granted
     - `expires_at TIMESTAMP_NTZ` - When access expires
     - `subscription_id NUMBER` - Reference to USER_SUBSCRIPTIONS
   - **Notes**: Controls data access based on subscriptions

5. **SUBSCRIPTION_NOTIFICATIONS**
   - **Description**: Manages user notifications for subscription events
   - **Columns**:
     - `notification_id NUMBER` - Unique identifier (IDENTITY, PRIMARY KEY)
     - `user_id VARCHAR(36)` - Reference to PROFILES
     - `asset_id VARCHAR(10)` - Related token
     - `notification_type VARCHAR(50)` - Type of notification
     - `message VARCHAR(1000)` - Notification content
     - `created_at TIMESTAMP_NTZ` - When notification was created
     - `sent_at TIMESTAMP_NTZ` - When notification was sent
     - `status VARCHAR(20)` - Status (PENDING, SENT, etc.)
   - **Notes**: Handles subscription-related communications

### INTERNAL Schema
Contains views and tables for business metrics and analytics.

## Views

### PUBLIC Schema Views

1. **PRICE_HISTORY_VIEW**
   - **Description**: Consolidated view of price history data
   - **Purpose**: Provides unified access to price data based on user's permission level
   - **Access**: Filtered based on user's subscription status
   - **Source Tables**: 
     - PUBLIC.PRICE_HISTORY
     - PUBLIC.PRICE_HISTORY_FREE
     - PUBLIC.PRICE_HISTORY_PREMIUM
   - **Notes**: 
     - Automatically filters data based on user access level
     - Free users see limited historical data
     - Premium users see full history for subscribed assets

### INTERNAL Schema Views

1. **RENEWAL_METRICS_VIEW**
   - **Description**: Subscription renewal analysis
   - **Purpose**: Track and analyze subscription renewal patterns
   - **Key Metrics**:
     - Renewal rates by subscription type
     - Average renewals per user
     - Customer lifetime value
     - Subscription retention rates
   - **Access**: Admin only
   - **Updates**: Daily

2. **SUBSCRIPTION_HEALTH_VIEW**
   - **Description**: Overall subscription system health monitoring
   - **Purpose**: Monitor active subscriptions and identify trends
   - **Key Metrics**:
     - Total active users
     - Active subscription count
     - Expiring subscriptions
     - Expired subscriptions
     - Active rate percentage
     - Average days remaining
   - **Access**: Admin only
   - **Updates**: Real-time

3. **SUBSCRIPTION_REVENUE_VIEW**
   - **Description**: Revenue analytics and tracking
   - **Purpose**: Monitor and analyze revenue streams
   - **Key Metrics**:
     - Monthly revenue by subscription type
     - Revenue by asset
     - Total and active subscribers
     - Average subscription price
     - Last 30 days revenue
     - New subscriber count
   - **Access**: Admin only
   - **Updates**: Daily

4. **USER_ENGAGEMENT_VIEW**
   - **Description**: User activity and engagement metrics
   - **Purpose**: Track user interaction with the platform
   - **Key Metrics**:
     - Query counts per user
     - Active days
     - First and last activity
     - Engagement by subscription type
   - **Source Tables**:
     - USERS.USER_ACCESS_VIEW
     - USERS.ACCESS_MONITORING
   - **Access**: Admin only
   - **Updates**: Real-time

### USERS Schema Views

1. **USER_ACCESS_VIEW**
   - **Description**: Central view for permission management
   - **Purpose**: Simplify access control checks
   - **Key Fields**:
     - User identification (ID, email, username)
     - Asset permissions
     - Subscription status
     - Access expiration tracking
   - **Source Tables**:
     - USERS.PROFILES
     - USERS.USER_PERMISSIONS
     - USERS.USER_SUBSCRIPTIONS
   - **Notes**: Primary method for checking user access rights

2. **PENDING_NOTIFICATIONS_VIEW**
   - **Description**: View for managing notification delivery
   - **Purpose**: Track and process pending notifications
   - **Key Fields**:
     - Notification details
     - User contact information
     - Subscription status
     - Days remaining
   - **Source Tables**:
     - USERS.SUBSCRIPTION_NOTIFICATIONS
     - USERS.PROFILES
     - USERS.USER_ACCESS_VIEW
   - **Updates**: Real-time

## View Usage Best Practices

1. **Access Control**
   - Always use USER_ACCESS_VIEW for permission checks
   - Never bypass view-level security with direct table access
   - Implement row-level security where needed

2. **Performance**
   - Monitor view query performance
   - Create materialized views for heavy analytics
   - Implement appropriate filters

3. **Maintenance**
   - Regular validation of view logic
   - Monitor view dependencies
   - Update view definitions as schema changes

4. **Security**
   - Use secure views for sensitive data
   - Implement proper role-based access
   - Audit view usage regularly

## Access Patterns
1. **Free Users**:
   - Access to PRICE_HISTORY_FREE (1 year)
   - Basic views and functions
   - Limited API calls

2. **Premium Users**:
   - Access to PRICE_HISTORY_PREMIUM for subscribed tokens
   - Advanced analytics and metrics
   - Full historical data
   - Unlimited API calls

3. **Admin Users**:
   - Full access to all schemas
   - Access to INTERNAL views
   - System administration capabilities

## Best Practices
1. Always use USER_ACCESS_VIEW for permission checks
2. Implement proper error handling in procedures
3. Use secure views for sensitive data
4. Monitor query performance
5. Regular maintenance of notification tables

## Support
- Slack: #data-engineering
- Email: data-team@yourdapp.com
- Wiki: [Internal Documentation Link]
 