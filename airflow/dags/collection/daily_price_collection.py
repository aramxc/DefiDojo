from airflow.decorators import dag, task
from airflow.utils.dates import days_ago
from airflow.exceptions import AirflowException
from datetime import datetime, timedelta
import logging
from typing import Dict, List
import snowflake.connector
import redis
import requests
from tenacity import retry, stop_after_attempt, wait_exponential
from utils.environment import standard_env_vars

__doc__ = """
Crypto Daily Price Collection DAG

This DAG performs the following operations:
1. Collects daily price data for top 200 cryptocurrencies
2. Verifies data completeness
3. Monitors API usage
4. Updates Snowflake PRICE_HISTORY_COMPLETE table

Schedule: Daily at 1 AM UTC
Timeout: 2 hours
Retries: 3
"""

log = logging.getLogger(__name__)

env = standard_env_vars()

class APILimitError(AirflowException):
    """Raised when API limit is reached"""
    pass

@dag(
    default_args={
        'owner': 'airflow',
        'depends_on_past': False,
        'email_on_failure': True,
        'email_on_retry': False,
        'retries': 3,
        'retry_delay': timedelta(minutes=5),
        'execution_timeout': timedelta(hours=2),
    },
    schedule_interval='0 1 * * *',  # 1 AM UTC daily
    start_date=days_ago(1),
    catchup=False,
    tags=['crypto', 'daily', 'price'],
    doc_md=__doc__
)
def crypto_daily_collection():

    @task()
    def check_api_limits() -> bool:
        """
        Verify we have sufficient API calls remaining.
        Raises APILimitError if limits are too low.
        """
        try:
            response = requests.get(
                'https://pro-api.coingecko.com/api/v3/ping',
                headers={'X-Cg-Pro-Api-Key': env.coingecko_pro_api_key}
            )
            remaining = int(response.headers.get('X-Ratelimit-Remaining', 0))
            
            if remaining < 1000:  # Safe threshold
                raise APILimitError(f"Only {remaining} API calls remaining")
            
            logger.info(f"API calls remaining: {remaining}")
            return True
        except Exception as e:
            logger.error(f"API limit check failed: {str(e)}")
            raise

    @task()
    def fetch_active_assets() -> List[Dict]:
        """
        Fetch list of top 200 assets from Snowflake.
        Returns: List of dicts with asset details
        """
        try:
            conn = snowflake.connector.connect(
                user=env.snowflake_username,
                password=env.snowflake_password,
                account=env.snowflake_account,
                database=env.snowflake_database,
                warehouse=env.snowflake_warehouse
            )
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT ASSET_ID, COINGECKO_ID 
                FROM PUBLIC.ASSETS 
                WHERE IS_ACTIVE = true
                AND COINGECKO_ID IS NOT NULL
                ORDER BY MARKET_CAP_RANK ASC
                LIMIT 200
            """)
            
            assets = [
                {'asset_id': row[0], 'coingecko_id': row[1]} 
                for row in cursor.fetchall()
            ]
            
            if not assets:
                raise AirflowException("No active assets found")
                
            return assets
        except Exception as e:
            logger.error(f"Asset fetch failed: {str(e)}")
            raise

    @task()
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=10)
    )
    def collect_daily_data(assets: List[Dict]) -> Dict:
        """
        Collect yesterday's daily data for all assets.
        Implements retry logic and batch processing.
        """
        yesterday = datetime.now() - timedelta(days=1)
        yesterday = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
        
        results = {
            'success': [],
            'failed': [],
            'skipped': [],
            'timestamp': yesterday.isoformat()
        }
        
        # Process in batches of 30 to respect rate limits
        batch_size = 30
        for i in range(0, len(assets), batch_size):
            batch = assets[i:i + batch_size]
            
            for asset in batch:
                try:
                    # Collect data from CoinGecko
                    response = requests.get(
                        f'https://pro-api.coingecko.com/api/v3/coins/{asset["coingecko_id"]}/history',
                        params={'date': yesterday.strftime('%d-%m-%Y')},
                        headers={'X-Cg-Pro-Api-Key': env.coingecko_pro_api_key}
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        results['success'].append({
                            'asset_id': asset['asset_id'],
                            'price': data['market_data']['current_price']['usd'],
                            'market_cap': data['market_data']['market_cap']['usd'],
                            'volume': data['market_data']['total_volume']['usd']
                        })
                    else:
                        results['failed'].append(asset['asset_id'])
                        logger.error(f"Failed to collect data for {asset['asset_id']}: {response.status_code}")
                        
                except Exception as e:
                    logger.error(f"Failed to collect data for {asset['asset_id']}: {str(e)}")
                    results['failed'].append(asset['asset_id'])
            
            # Sleep between batches
            time.sleep(2)
        
        return results

    @task()
    def store_daily_data(results: Dict) -> Dict:
        """
        Store collected data in Snowflake.
        Implements transaction handling and verification.
        """
        try:
            conn = snowflake.connector.connect(
                user=env.snowflake_username,
                password=env.snowflake_password,
                account=env.snowflake_account,
                database=env.snowflake_database,
                warehouse=env.snowflake_warehouse
            )
            cursor = conn.cursor()
            
            for record in results['success']:
                cursor.execute("""
                    INSERT INTO PRICE_HISTORY_COMPLETE (
                        ASSET_ID, TIMESTAMP, PRICE_USD, 
                        MARKET_CAP_USD, VOLUME_24H_USD
                    ) VALUES (%s, %s, %s, %s, %s)
                """, (
                    record['asset_id'],
                    results['timestamp'],
                    record['price'],
                    record['market_cap'],
                    record['volume']
                ))
            
            conn.commit()
            return results
            
        except Exception as e:
            conn.rollback()
            logger.error(f"Failed to store data: {str(e)}")
            raise

    @task()
    def verify_daily_data(results: Dict) -> None:
        """
        Verify data completeness and quality.
        Raises AirflowException if verification fails.
        """
        try:
            conn = snowflake.connector.connect(
                user=env.snowflake_username,
                password=env.snowflake_password,
                account=env.snowflake_account,
                database=env.snowflake_database,
                warehouse=env.snowflake_warehouse
            )
            cursor = conn.cursor()
            
            # Verify all successful inserts
            cursor.execute("""
                SELECT COUNT(DISTINCT ASSET_ID)
                FROM PRICE_HISTORY_COMPLETE
                WHERE TIMESTAMP = %s
            """, (results['timestamp'],))
            
            count = cursor.fetchone()[0]
            expected = len(results['success'])
            
            if count != expected:
                raise AirflowException(
                    f"Data verification failed. Expected {expected} records, found {count}"
                )
            
            # Log results
            logger.info(f"""
                Daily Collection Results:
                - Successful: {len(results['success'])}
                - Failed: {len(results['failed'])}
                - Skipped: {len(results['skipped'])}
                - Verification: PASSED
            """)
            
        except Exception as e:
            logger.error(f"Verification failed: {str(e)}")
            raise

    # Define task dependencies
    api_check = check_api_limits()
    assets = fetch_active_assets()
    results = collect_daily_data(assets)
    stored = store_daily_data(results)
    verify_daily_data(stored)

# Instantiate the DAG
dag = crypto_daily_collection()