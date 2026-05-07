from typing import List, Optional
from sqlalchemy.orm import Session
from ...db.pgsql.schemas import (
    LLMConfigCreate, LLMConfigUpdate, LLMConfigResponse,
    GlobalSettingsResponse, GlobalSettingsUpdate
)
from ...domain.entities import LLMConfig, GlobalSettings
from ...domain.repositories import LLMConfigRepository, GlobalSettingsRepository
from ....infrastructure.repositories.postgresql_repositories import (
    PostgreSQLLLMConfigRepository, PostgreSQLGlobalSettingsRepository
)
from ...exceptions import DatabaseError, NotFoundError


class SettingsService:
    """Service for managing user settings and LLM configurations"""
    
    def __init__(self, db: Session):
        self.db = db
        self.llm_config_repo: LLMConfigRepository = PostgreSQLLLMConfigRepository(db)
        self.global_settings_repo: GlobalSettingsRepository = PostgreSQLGlobalSettingsRepository(db)
    
    # LLM Config methods
    async def create_llm_config(self, user_id: int, config_data: LLMConfigCreate) -> LLMConfigResponse:
        """Create a new LLM configuration for a user"""
        try:
            # Convert schema to entity
            llm_config = LLMConfig(
                user_id=user_id,
                name=config_data.name,
                provider=config_data.provider,
                api_key=config_data.api_key,
                api_url=config_data.api_url,
                model=config_data.model,
                temperature=config_data.temperature,
                max_tokens=config_data.max_tokens,
                system_prompt=config_data.system_prompt,
                requires_auth=config_data.requires_auth,
                is_default=config_data.is_default
            )
            
            # If this is set as default, unset other defaults for this user
            if config_data.is_default:
                await self._unset_other_defaults(user_id)
            
            # Create the config
            created_config = await self.llm_config_repo.create(llm_config)
            
            # Convert entity to response
            return self._llm_config_to_response(created_config)
            
        except Exception as e:
            raise DatabaseError(f"Failed to create LLM config: {str(e)}")
    
    async def get_llm_configs(self, user_id: int) -> List[LLMConfigResponse]:
        """Get all LLM configurations for a user"""
        try:
            configs = await self.llm_config_repo.get_by_user(user_id)
            return [self._llm_config_to_response(config) for config in configs]
        except Exception as e:
            raise DatabaseError(f"Failed to get LLM configs: {str(e)}")
    
    async def get_llm_config(self, config_id: int, user_id: int) -> LLMConfigResponse:
        """Get a specific LLM configuration"""
        try:
            config = await self.llm_config_repo.get_by_id(config_id)
            if not config or config.user_id != user_id:
                raise NotFoundError(f"LLM config with id {config_id} not found")
            return self._llm_config_to_response(config)
        except Exception as e:
            if isinstance(e, NotFoundError):
                raise
            raise DatabaseError(f"Failed to get LLM config: {str(e)}")
    
    async def update_llm_config(self, config_id: int, user_id: int, config_data: LLMConfigUpdate) -> LLMConfigResponse:
        """Update an LLM configuration"""
        try:
            # Get existing config
            existing_config = await self.llm_config_repo.get_by_id(config_id)
            if not existing_config or existing_config.user_id != user_id:
                raise NotFoundError(f"LLM config with id {config_id} not found")
            
            # If this is set as default, unset other defaults for this user
            if config_data.is_default:
                await self._unset_other_defaults(user_id, exclude_id=config_id)
            
            # Update the config
            updated_config = await self.llm_config_repo.update_partial(config_id, config_data.dict(exclude_unset=True))
            return self._llm_config_to_response(updated_config)
            
        except Exception as e:
            if isinstance(e, NotFoundError):
                raise
            raise DatabaseError(f"Failed to update LLM config: {str(e)}")
    
    async def delete_llm_config(self, config_id: int, user_id: int) -> bool:
        """Delete an LLM configuration"""
        try:
            # Check if config exists and belongs to user
            existing_config = await self.llm_config_repo.get_by_id(config_id)
            if not existing_config or existing_config.user_id != user_id:
                raise NotFoundError(f"LLM config with id {config_id} not found")
            
            # Delete the config
            return await self.llm_config_repo.delete(config_id)
            
        except Exception as e:
            if isinstance(e, NotFoundError):
                raise
            raise DatabaseError(f"Failed to delete LLM config: {str(e)}")
    
    async def set_default_llm_config(self, config_id: int, user_id: int) -> LLMConfigResponse:
        """Set an LLM configuration as default"""
        try:
            # Check if config exists and belongs to user
            existing_config = await self.llm_config_repo.get_by_id(config_id)
            if not existing_config or existing_config.user_id != user_id:
                raise NotFoundError(f"LLM config with id {config_id} not found")
            
            # Unset other defaults
            await self._unset_other_defaults(user_id, exclude_id=config_id)
            
            # Set this one as default
            updated_config = await self.llm_config_repo.update_partial(config_id, {"is_default": True})
            return self._llm_config_to_response(updated_config)
            
        except Exception as e:
            if isinstance(e, NotFoundError):
                raise
            raise DatabaseError(f"Failed to set default LLM config: {str(e)}")
    
    # Global Settings methods
    async def get_global_settings(self, user_id: int) -> GlobalSettingsResponse:
        """Get global settings for a user"""
        try:
            settings = await self.global_settings_repo.get_by_user(user_id)
            if not settings:
                # Return default settings if none exist
                return GlobalSettingsResponse(
                    auto_save=True,
                    notifications=True
                )
            
            return GlobalSettingsResponse(
                auto_save=settings.settings.get("auto_save", True),
                notifications=settings.settings.get("notifications", True)
            )
        except Exception as e:
            raise DatabaseError(f"Failed to get global settings: {str(e)}")
    
    async def update_global_settings(self, user_id: int, settings_data: GlobalSettingsUpdate) -> GlobalSettingsResponse:
        """Update global settings for a user"""
        try:
            # Get existing settings or create new ones
            existing_settings = await self.global_settings_repo.get_by_user(user_id)
            
            if existing_settings:
                # Update existing settings
                updated_settings = existing_settings
                if settings_data.auto_save is not None:
                    updated_settings.settings["auto_save"] = settings_data.auto_save
                if settings_data.notifications is not None:
                    updated_settings.settings["notifications"] = settings_data.notifications
            else:
                # Create new settings
                updated_settings = GlobalSettings(
                    user_id=user_id,
                    settings={
                        "auto_save": settings_data.auto_save if settings_data.auto_save is not None else True,
                        "notifications": settings_data.notifications if settings_data.notifications is not None else True
                    }
                )
            
            # Save the settings
            saved_settings = await self.global_settings_repo.create_or_update(updated_settings)
            
            return GlobalSettingsResponse(
                auto_save=saved_settings.settings.get("auto_save", True),
                notifications=saved_settings.settings.get("notifications", True)
            )
            
        except Exception as e:
            raise DatabaseError(f"Failed to update global settings: {str(e)}")
    
    # Helper methods
    async def _unset_other_defaults(self, user_id: int, exclude_id: Optional[int] = None):
        """Unset default flag for all other LLM configs for a user"""
        try:
            configs = await self.llm_config_repo.get_by_user(user_id)
            for config in configs:
                if config.is_default and (exclude_id is None or config.id != exclude_id):
                    await self.llm_config_repo.update_partial(config.id, {"is_default": False})
        except Exception as e:
            raise DatabaseError(f"Failed to unset other defaults: {str(e)}")
    
    def _llm_config_to_response(self, config: LLMConfig) -> LLMConfigResponse:
        """Convert LLMConfig entity to LLMConfigResponse"""
        return LLMConfigResponse(
            id=config.id,
            name=config.name,
            provider=config.provider,
            api_key=config.api_key,
            api_url=config.api_url,
            model=config.model,
            temperature=config.temperature,
            max_tokens=config.max_tokens,
            system_prompt=config.system_prompt,
            requires_auth=config.requires_auth,
            is_default=config.is_default,
            created_at=config.created_at,
            updated_at=config.updated_at
        )
