# Snowflake Queries Guide

## Overview
This guide provides a set of useful queries to interact with the Snowflake database, focusing on retrieving and analyzing data from the existing schemas. It is designed to help new users quickly get up to speed with the database operations.

## Queries

### Retrieve Historical Price Data
To get historical price data for a specific asset:

```sql
SELECT symbol, timestamp, price, volume, market_cap
FROM PUBLIC.PRICE_HISTORY_FREE
WHERE symbol = '<ASSET_SYMBOL>'
ORDER BY timestamp DESC;
```


### Retrieve User Subscription Details
To get subscription details for a specific user:

```sql
SELECT user_id, subscription_type, start_date, end_date
FROM PUBLIC.USER_SUBSCRIPTIONS
WHERE user_id = '<USER_ID>';
```

### Generate Analytics Report
To generate a report for a specific user:

```sql
SELECT report_id, report_data, created_at
FROM PUBLIC.ANALYTICS
WHERE user_id = '<USER_ID>'
ORDER BY created_at DESC;
```

### View All Active Subscriptions
To view all users with active subscriptions:

```sql
SELECT user_id, subscription_type, start_date, end_date
FROM PUBLIC.USER_SUBSCRIPTIONS
WHERE end_date > CURRENT_DATE();
```

### Analyze Price Trends
To analyze price trends for a specific asset over the last month:

```sql
SELECT symbol, AVG(price) AS average_price, MAX(price) AS max_price, MIN(price) AS min_price
FROM PUBLIC.PRICE_HISTORY_FREE
WHERE symbol = '<ASSET_SYMBOL>' AND timestamp >= DATEADD(month, -1, CURRENT_DATE())
GROUP BY symbol;
```

## Notes
- Replace `<ASSET_SYMBOL>` and `<USER_ID>` with the actual asset symbol and user ID you are querying for.
- Ensure you have the necessary permissions to access the data in these tables.