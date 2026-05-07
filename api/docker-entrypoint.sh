#!/bin/bash
set -e

echo "Waiting for database to be ready..."

# Wait for PostgreSQL to be ready using Python (via uv to access virtual environment)
uv run python << 'PYTHON_SCRIPT'
import sys
import time
import os
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError

# Get environment variables
postgres_user = os.getenv('POSTGRES_USER', 'postgres')
postgres_password = os.getenv('POSTGRES_PASSWORD', 'password')
postgres_host = os.getenv('POSTGRES_HOST', 'postgres')
postgres_port = os.getenv('POSTGRES_PORT', '5432')
postgres_db = os.getenv('POSTGRES_DB', 'aiano')

database_url = f"postgresql://{postgres_user}:{postgres_password}@{postgres_host}:{postgres_port}/{postgres_db}"

max_retries = 30
retry_count = 0

while retry_count < max_retries:
    try:
        engine = create_engine(database_url, connect_args={"connect_timeout": 2})
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("PostgreSQL is up - proceeding with migrations")
        sys.exit(0)
    except OperationalError:
        retry_count += 1
        if retry_count < max_retries:
            print(f"PostgreSQL is unavailable - sleeping (attempt {retry_count}/{max_retries})")
            time.sleep(2)
        else:
            print("Failed to connect to PostgreSQL after maximum retries")
            sys.exit(1)
PYTHON_SCRIPT

echo "Running Alembic migrations..."
uv run alembic upgrade head

echo "Migrations completed. Seeding initial data..."
uv run python seed_data.py

echo "Seed data completed. Starting server..."

# Start the application
exec "$@"
