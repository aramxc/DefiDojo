# Crypto Data Collection Pipeline

## Overview
This Airflow implementation manages the collection and storage of cryptocurrency price data across multiple timeframes. The system is designed to work within CoinGecko's free API tier limits while maintaining comprehensive historical and recent price data.

## Data Architecture

### Tables

1. **PRICE_HISTORY_COMPLETE**
   - Daily granularity
   - Historical data beyond 1 year
   - Updated daily
   - Primary source for long-term analysis
   - Backfilled from CoinGecko Pro API on January 8, 2025

2. **PRICE_HISTORY_HOURLY**
   ```sql
   CREATE TABLE PRICE_HISTORY_HOURLY (
       ASSET_ID STRING,
       TIMESTAMP TIMESTAMP,
       PRICE_USD FLOAT,
       MARKET_CAP_USD FLOAT,
       VOLUME_24H_USD FLOAT,
       CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
       PRIMARY KEY (ASSET_ID, TIMESTAMP),
       TTL 365 DAYS
   );
   ```

3. **PRICE_HISTORY_INTRADAY**
   ```sql
   CREATE TABLE PRICE_HISTORY_INTRADAY (
       ASSET_ID STRING,
       TIMESTAMP TIMESTAMP,
       PRICE_USD FLOAT,
       MARKET_CAP_USD FLOAT,
       VOLUME_24H_USD FLOAT,
       CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
       PRIMARY KEY (ASSET_ID, TIMESTAMP),
       TTL 24 HOURS
   );
   ```

## DAGs

### 1. intraday_collection_dag.py
Collects 5-minute granularity data for the last 24 hours

```python
from airflow import DAG
from airflow.operators.python_operator import PythonOperator
from datetime import datetime, timedelta
default_args = {
'owner': 'airflow',
'depends_on_past': False,
'start_date': datetime(2024, 3, 19),
'email_on_failure': True,
'email_on_retry': False,
'retries': 1,
'retry_delay': timedelta(minutes=5),
}
dag = DAG(
'intraday_collection',
default_args=default_args,
description='Collect 5-minute crypto price data',
schedule_interval='/5 ',
catchup=False
)