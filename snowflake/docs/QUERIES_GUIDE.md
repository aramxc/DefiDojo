# Snowflake Queries Guide

## Overview
This guide provides commonly used queries for analyzing data in our Snowflake database. Queries are organized by category and include explanations of their purpose and usage.

## Price Data Queries

### Latest Prices
```sql
-- Get latest prices for all active assets
SELECT 
    a.SYMBOL,
    a.NAME,
    ph.PRICE_USD,
    ph.MARKET_CAP_USD,
    ph.VOLUME_24H_USD,
    ph.TIMESTAMP
FROM PUBLIC.PRICE_HISTORY_VIEW ph
JOIN PUBLIC.ASSETS a ON ph.ASSET_ID = a.ASSET_ID
WHERE a.IS_ACTIVE = TRUE
AND ph.TIMESTAMP >= DATEADD(hour, -1, CURRENT_TIMESTAMP())
ORDER BY a.MARKET_CAP_RANK;

-- Get 24h price changes
SELECT 
    a.SYMBOL,
    current.PRICE_USD as current_price,
    previous.PRICE_USD as previous_price,
    ((current.PRICE_USD - previous.PRICE_USD) / previous.PRICE_USD * 100) as price_change_24h
FROM PUBLIC.ASSETS a
JOIN PUBLIC.PRICE_HISTORY_VIEW current 
    ON a.ASSET_ID = current.ASSET_ID 
    AND current.TIMESTAMP >= DATEADD(hour, -1, CURRENT_TIMESTAMP())
JOIN PUBLIC.PRICE_HISTORY_VIEW previous 
    ON a.ASSET_ID = previous.ASSET_ID 
    AND previous.TIMESTAMP >= DATEADD(hour, -25, CURRENT_TIMESTAMP())
    AND previous.TIMESTAMP <= DATEADD(hour, -24, CURRENT_TIMESTAMP())
WHERE a.IS_ACTIVE = TRUE
ORDER BY ABS(price_change_24h) DESC;
```

### Technical Analysis
```sql
-- Get price history with moving averages
SELECT 
    TIMESTAMP,
    PRICE_USD,
    AVG(PRICE_USD) OVER(ORDER BY TIMESTAMP ROWS 50 PRECEDING) as MA_50,
    AVG(PRICE_USD) OVER(ORDER BY TIMESTAMP ROWS 200 PRECEDING) as MA_200
FROM PUBLIC.PRICE_HISTORY_VIEW
WHERE ASSET_ID = 'BTC'
AND TIMESTAMP >= DATEADD(day, -30, CURRENT_TIMESTAMP())
ORDER BY TIMESTAMP DESC;
```

## Subscription Analytics

### Active Subscriptions
```sql
-- Overview of active subscriptions
SELECT 
    subscription_type,
    COUNT(*) as total_subs,
    COUNT(CASE WHEN days_remaining <= 7 THEN 1 END) as expiring_soon,
    AVG(days_remaining) as avg_days_remaining
FROM USERS.USER_ACCESS_VIEW
WHERE status = 'ACTIVE'
GROUP BY subscription_type
ORDER BY total_subs DESC;

-- Users with expiring subscriptions
SELECT 
    p.email,
    p.username,
    uav.asset_id,
    uav.subscription_type,
    uav.expires_at,
    uav.days_remaining
FROM USERS.USER_ACCESS_VIEW uav
JOIN USERS.PROFILES p ON uav.user_id = p.user_id
WHERE uav.status = 'ACTIVE'
AND uav.days_remaining <= 7
ORDER BY uav.days_remaining;
```

### Revenue Analysis
```sql
-- Monthly revenue trends
SELECT 
    DATE_TRUNC('month', sr.month) as month,
    sr.subscription_type_id,
    sr.total_subscribers,
    sr.active_subscribers,
    sr.total_revenue,
    sr.avg_subscription_price
FROM INTERNAL.SUBSCRIPTION_REVENUE sr
WHERE sr.month >= DATEADD('month', -6, CURRENT_DATE())
ORDER BY sr.month DESC, sr.total_revenue DESC;

-- Customer lifetime value by cohort
SELECT 
    DATE_TRUNC('month', p.created_at) as cohort_month,
    COUNT(DISTINCT p.user_id) as cohort_size,
    SUM(us.payment_amount) as total_revenue,
    AVG(us.payment_amount) as avg_revenue_per_user
FROM USERS.PROFILES p
JOIN USERS.USER_SUBSCRIPTIONS us ON p.user_id = us.user_id
GROUP BY cohort_month
ORDER BY cohort_month DESC;
```

## User Engagement

### Activity Metrics
```sql
-- User engagement overview
SELECT 
    subscription_type,
    COUNT(DISTINCT user_id) as total_users,
    AVG(total_queries) as avg_queries_per_user,
    AVG(active_days) as avg_active_days
FROM INTERNAL.USER_ENGAGEMENT
WHERE last_activity >= DATEADD(day, -30, CURRENT_TIMESTAMP())
GROUP BY subscription_type
ORDER BY avg_queries_per_user DESC;

-- Most active users
SELECT 
    p.username,
    ue.total_queries,
    ue.active_days,
    ue.subscription_type,
    DATE_TRUNC('day', ue.last_activity) as last_active
FROM INTERNAL.USER_ENGAGEMENT ue
JOIN USERS.PROFILES p ON ue.user_id = p.user_id
WHERE ue.last_activity >= DATEADD(day, -30, CURRENT_TIMESTAMP())
ORDER BY ue.total_queries DESC
LIMIT 100;
```

## Notification Management

### Pending Notifications
```sql
-- View pending notifications
SELECT 
    p.email,
    p.username,
    pn.notification_type,
    pn.message,
    pn.created_at,
    uav.days_remaining
FROM USERS.PENDING_NOTIFICATIONS pn
JOIN USERS.PROFILES p ON pn.user_id = p.user_id
JOIN USERS.USER_ACCESS_VIEW uav ON pn.user_id = uav.user_id
ORDER BY pn.created_at DESC;

-- Notification effectiveness
SELECT 
    notification_type,
    COUNT(*) as total_sent,
    AVG(DATEDIFF('minute', created_at, sent_at)) as avg_send_delay,
    COUNT(CASE WHEN status = 'SENT' THEN 1 END) * 100.0 / COUNT(*) as delivery_rate
FROM USERS.SUBSCRIPTION_NOTIFICATIONS
WHERE created_at >= DATEADD(day, -30, CURRENT_TIMESTAMP())
GROUP BY notification_type;
```

## System Health

### Performance Monitoring
```sql
-- Long-running queries
SELECT 
    QUERY_ID,
    USER_NAME,
    WAREHOUSE_NAME,
    EXECUTION_TIME/1000 as execution_seconds,
    QUERY_TEXT
FROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY
WHERE START_TIME >= DATEADD(hour, -24, CURRENT_TIMESTAMP())
AND EXECUTION_TIME > 60000  -- queries longer than 1 minute
ORDER BY EXECUTION_TIME DESC
LIMIT 20;

-- Warehouse utilization
SELECT 
    WAREHOUSE_NAME,
    DATE_TRUNC('hour', START_TIME) as hour,
    COUNT(*) as query_count,
    SUM(CREDITS_USED) as credits_used,
    AVG(EXECUTION_TIME)/1000 as avg_execution_seconds
FROM SNOWFLAKE.ACCOUNT_USAGE.WAREHOUSE_METERING_HISTORY
WHERE START_TIME >= DATEADD(day, -7, CURRENT_TIMESTAMP())
GROUP BY 1, 2
ORDER BY 2 DESC, 3 DESC;
```

## Notes
- Replace placeholders (e.g., 'BTC') with actual values
- Adjust date ranges based on your needs
- Some queries require admin access to INTERNAL schema
- Consider performance impact of long date ranges

## Need Help?
Contact the data team:
- Slack: #data-engineering
- Email: data-team@yourdapp.com