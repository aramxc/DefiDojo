import os
from dataclasses import dataclass


@dataclass
class EnvVars:
    """Dataclass to store environment variables with proper typing"""
    coingecko_pro_api_key: str
    snowflake_account: str
    snowflake_username: str
    snowflake_password: str
    snowflake_database: str
    snowflake_warehouse: str


def standard_env_vars() -> EnvVars:
    """
    Retrieves and validates required environment variables.
    Raises ValueError if any required variables are missing.

    Returns:
        EnvVars: Dataclass containing all environment variables
    """
    required_vars = {
        'coingecko_pro_api_key': os.getenv('COINGECKO_PRO_API_KEY'),
        'snowflake_account': os.getenv('SNOWFLAKE_ACCOUNT'),
        'snowflake_username': os.getenv('SNOWFLAKE_USERNAME'),
        'snowflake_password': os.getenv('SNOWFLAKE_PASSWORD'),
        'snowflake_database': os.getenv('SNOWFLAKE_DATABASE'),
        'snowflake_warehouse': os.getenv('SNOWFLAKE_WAREHOUSE'),
    }

    # Check for missing variables
    missing_vars = [
        key for key, value in required_vars.items()
        if value is None
    ]

    if missing_vars:
        missing_vars_str = ', '.join(missing_vars)
        raise ValueError(
            f"Missing required environment variables: {missing_vars_str}"
        )

    # Return dataclass instance with all variables
    return EnvVars(**required_vars)
