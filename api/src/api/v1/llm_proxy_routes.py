from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import Annotated, Dict, Any
import logging
import httpx
from src.api.v1.dependencies import get_current_user
from src.core.domain.entities import User
from src.core.models.settings.service import SettingsService
from src.core.db.pgsql.config import get_db
from src.infrastructure.repositories.postgresql_repositories import (
    PostgreSQLLLMConfigRepository, PostgreSQLGlobalSettingsRepository
)

logger = logging.getLogger("app")
externals_logger = logging.getLogger("externals")
error_logger = logging.getLogger()  # Root logger goes to error.log

router = APIRouter(prefix="/llm", tags=["llm-proxy"])

def get_settings_service(db: Session = Depends(get_db)) -> SettingsService:
    """Get settings service with database session"""
    return SettingsService(db)

@router.post("/chat/completions")
async def proxy_llm_request(
    request: Request,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[SettingsService, Depends(get_settings_service)]
):
    """Proxy LLM requests to external APIs and log them"""
    try:
        # Get request body
        body = await request.json()
        
        # Extract LLM config from request headers or use default
        config_id = request.headers.get("X-LLM-Config-Id")
        config = None
        
        if config_id:
            try:
                config_response = await service.get_llm_config(int(config_id), current_user.id)
                config = config_response
            except Exception:
                pass
        
        # Get API URL and model from config
        if not config:
            raise HTTPException(
                status_code=400, 
                detail="A valid LLM Configuration (X-LLM-Config-Id) is required to proxy requests."
            )
        
        api_url = config.api_url
        model = config.model
        
        # Prepare headers
        headers: Dict[str, str] = {
            "Content-Type": "application/json",
        }
        
        # Add authorization from config
        if config.requires_auth and config.api_key:
            headers["Authorization"] = f"Bearer {config.api_key}"
        else:
            raise HTTPException(
                status_code=401,
                detail="The selected LLM configuration lacks authentication details."
            )
        
        # Remove internal fields from body
        proxy_body = {k: v for k, v in body.items() if k not in ["api_url", "api_key"]}
        
        # Log the request
        logger.info(
            f"🤖 LLM Request - User: {current_user.id}, Model: {model}, "
            f"Provider: {config.provider if config else 'unknown'}, "
            f"URL: {api_url}"
        )
        externals_logger.info(
            f"LLM Request - User: {current_user.id}, Model: {model}, "
            f"Provider: {config.provider if config else 'unknown'}, "
            f"URL: {api_url}"
        )
        
        # Make the request to external LLM API
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{api_url}/chat/completions",
                json=proxy_body,
                headers=headers
            )
            
            response_data = response.json() if response.headers.get("content-type", "").startswith("application/json") else {"text": response.text}
            
            # Log the response
            if response.status_code == 200:
                tokens = response_data.get('usage', {}).get('total_tokens', 'unknown')
                logger.info(
                    f"✅ LLM Response - User: {current_user.id}, Model: {model}, "
                    f"Tokens: {tokens}"
                )
                externals_logger.info(
                    f"LLM Response - User: {current_user.id}, Model: {model}, "
                    f"Status: {response.status_code}, Tokens: {tokens}"
                )
            else:
                logger.warning(
                    f"⚠️ LLM Error - User: {current_user.id}, Model: {model}, "
                    f"Status: {response.status_code}"
                )
                externals_logger.warning(
                    f"LLM Error - User: {current_user.id}, Model: {model}, "
                    f"Status: {response.status_code}, Error: {response_data}"
                )
            
            # Return the response
            return response_data
            
    except httpx.TimeoutException:
        error_logger.error(f"LLM request timeout for user {current_user.id}", exc_info=True)
        raise HTTPException(status_code=504, detail="The external LLM provider timed out.")
    except Exception as e:
        error_logger.error(f"LLM proxy error for user {current_user.id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred while proxying the LLM request.")

