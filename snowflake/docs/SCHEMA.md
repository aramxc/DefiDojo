# Snowflake Schema Documentation

## Overview
Our Snowflake implementation consists of several schemas designed to handle user subscriptions, historical price data, and analytics. This document outlines the database structure and relationships, providing a comprehensive guide for new users to understand the current setup.

## Schemas

### PUBLIC Schema
Contains core data accessible to all authenticated users.

#### Tables

1. **PRICE_HISTORY_FREE**
   - **Description**: Stores historical price data for free users.
   - **Columns**:
     - `id`: Unique identifier for each record.
     - `symbol`: The asset symbol (e.g., BTC, ETH).
     - `timestamp`: The date and time of the recorded price.
     - `price`: The price of the asset at the given timestamp.
     - `volume`: The trading volume of the asset.
     - `market_cap`: The market capitalization of the asset.
   - **Primary Key**: `id`

2. **USER_SUBSCRIPTIONS**
   - **Description**: Manages user subscription details.
   - **Columns**:
     - `user_id`: Unique identifier for each user.
     - `subscription_type`: Type of subscription (e.g., free, premium).
     - `start_date`: Subscription start date.
     - `end_date`: Subscription end date.
   - **Primary Key**: `user_id`

3. **ANALYTICS**
   - **Description**: Contains data for analytics and reporting.
   - **Columns**:
     - `report_id`: Unique identifier for each report.
     - `user_id`: Identifier linking to the user.
     - `report_data`: JSON data containing analytics information.
     - `created_at`: Timestamp when the report was generated.
   - **Primary Key**: `report_id`

## Relationships
- The `USER_SUBSCRIPTIONS` table is linked to the `ANALYTICS` table via the `user_id` column, allowing for user-specific analytics.
 