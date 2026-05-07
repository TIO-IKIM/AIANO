from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Annotated
from ...db.pgsql.config import get_db
from ...db.pgsql.models import User
from ...db.pgsql.schemas import (
    GlobalSettingsResponse, GlobalSettingsUpdate,
    LLMConfigCreate, LLMConfigResponse, LLMConfigUpdate
)
from ....api.v1.dependencies import get_current_user
from .service import SettingsService
from ....infrastructure.repositories.postgresql_repositories import (
    PostgreSQLLLMConfigRepository, PostgreSQLGlobalSettingsRepository
)

router = APIRouter(prefix="/settings", tags=["settings"])

# Dependency to get SettingsService
def get_settings_service(db: Session = Depends(get_db)) -> SettingsService:
    """Get settings service with database session"""
    return SettingsService(db)

# Global Settings endpoints
@router.get("/global", response_model=GlobalSettingsResponse)
async def get_global_settings(
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[SettingsService, Depends(get_settings_service)]
):
    """Get global settings for the current user"""
    return await service.get_global_settings(current_user.id)

@router.put("/global", response_model=GlobalSettingsResponse)
async def update_global_settings(
    settings_data: GlobalSettingsUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[SettingsService, Depends(get_settings_service)]
):
    """Update global settings for the current user"""
    return await service.update_global_settings(current_user.id, settings_data)

# LLM Config endpoints
@router.post("/llm-configs", response_model=LLMConfigResponse)
async def create_llm_config(
    config_data: LLMConfigCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[SettingsService, Depends(get_settings_service)]
):
    """Create a new LLM configuration"""
    return await service.create_llm_config(current_user.id, config_data)

@router.get("/llm-configs", response_model=List[LLMConfigResponse])
async def get_llm_configs(
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[SettingsService, Depends(get_settings_service)]
):
    """Get all LLM configurations for the current user"""
    return await service.get_llm_configs(current_user.id)

@router.get("/llm-configs/{config_id}", response_model=LLMConfigResponse)
async def get_llm_config(
    config_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[SettingsService, Depends(get_settings_service)]
):
    """Get a specific LLM configuration"""
    return await service.get_llm_config(config_id, current_user.id)

@router.put("/llm-configs/{config_id}", response_model=LLMConfigResponse)
async def update_llm_config(
    config_id: int,
    config_data: LLMConfigUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[SettingsService, Depends(get_settings_service)]
):
    """Update an LLM configuration"""
    return await service.update_llm_config(config_id, current_user.id, config_data)

@router.delete("/llm-configs/{config_id}")
async def delete_llm_config(
    config_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[SettingsService, Depends(get_settings_service)]
):
    """Delete an LLM configuration"""
    await service.delete_llm_config(config_id, current_user.id)
    return {"message": "LLM configuration deleted successfully"}

@router.post("/llm-configs/{config_id}/set-default")
async def set_default_llm_config(
    config_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[SettingsService, Depends(get_settings_service)]
):
    """Set an LLM configuration as default"""
    await service.set_default_llm_config(config_id, current_user.id)
    return {"message": "Default LLM configuration updated successfully"}
