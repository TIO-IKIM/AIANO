import os
import sys
import logging
from pythonjsonlogger import jsonlogger


def setup_logging():
    """Configure environment-aware logging"""
    log_level = os.getenv("LOG_LEVEL", "INFO")
    environment = os.getenv("ENVIRONMENT", "development")
    
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(log_level)
    
    if environment == "production":
        # JSON format for production
        formatter = jsonlogger.JsonFormatter(
            fmt='%(asctime)s %(levelname)s %(name)s %(module)s %(funcName)s %(message)s',
            rename_fields={'levelname': 'level', 'asctime': 'timestamp'},
            datefmt='%Y-%m-%dT%H:%M:%SZ'  # Add Z for UTC
        )
    else:
        # Human-readable format for development
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
    
    handler.setFormatter(formatter)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    root_logger.handlers.clear()
    root_logger.addHandler(handler)
    
    # Suppress noisy third-party loggers
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("asyncio").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)  # Add if using SQLAlchemy
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)  # Reduce Uvicorn access logs
