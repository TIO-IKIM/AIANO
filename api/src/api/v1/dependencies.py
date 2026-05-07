from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Annotated
from sqlalchemy.orm import Session

from src.core.db.pgsql.config import get_db
from src.core.services.auth_service import AuthService
from src.core.services.annotation_service import AnnotationService
from src.core.exceptions import AuthenticationError, UserNotFoundError, AuthorizationError
from src.infrastructure.repositories.postgresql_repositories import (
    PostgreSQLUserRepository, PostgreSQLProjectRepository,
    PostgreSQLRefreshTokenRepository, PostgreSQLDocumentRepository,
    PostgreSQLAnnotationRepository, PostgreSQLQAPairRepository,
    PostgreSQLAutoSaveRepository, PostgreSQLGlobalSettingsRepository,
    PostgreSQLLLMConfigRepository, PostgreSQLAianoBlockRepository,
    PostgreSQLProjectSessionRepository, PostgreSQLDocumentHighlightRepository,
    PostgreSQLAnnotationEntryRepository
)
from src.core.domain.repositories import (
    UserRepository, ProjectRepository, RefreshTokenRepository,
    DocumentRepository, AnnotationRepository, QAPairRepository,
    AutoSaveRepository, GlobalSettingsRepository, LLMConfigRepository,
    AianoBlockRepository, ProjectSessionRepository, DocumentHighlightRepository,
    AnnotationEntryRepository
)

security = HTTPBearer()

# Repository dependencies
def get_user_repository(db: Session = Depends(get_db)) -> UserRepository:
    """Get user repository with database session"""
    return PostgreSQLUserRepository(db)

def get_refresh_token_repository(db: Session = Depends(get_db)) -> RefreshTokenRepository:
    """Get refresh token repository with database session"""
    return PostgreSQLRefreshTokenRepository(db)

def get_project_repository(db: Session = Depends(get_db)) -> ProjectRepository:
    """Get project repository with database session"""
    return PostgreSQLProjectRepository(db)

def get_document_repository(db: Session = Depends(get_db)) -> DocumentRepository:
    """Get document repository with database session"""
    return PostgreSQLDocumentRepository(db)

def get_annotation_repository(db: Session = Depends(get_db)) -> AnnotationRepository:
    """Get annotation repository with database session"""
    return PostgreSQLAnnotationRepository(db)

def get_qa_pair_repository(db: Session = Depends(get_db)) -> QAPairRepository:
    """Get QA pair repository with database session"""
    return PostgreSQLQAPairRepository(db)

def get_auto_save_repository(db: Session = Depends(get_db)) -> AutoSaveRepository:
    """Get auto save repository with database session"""
    return PostgreSQLAutoSaveRepository(db)

def get_global_settings_repository(db: Session = Depends(get_db)) -> GlobalSettingsRepository:
    """Get global settings repository with database session"""
    return PostgreSQLGlobalSettingsRepository(db)

def get_llm_config_repository(db: Session = Depends(get_db)) -> LLMConfigRepository:
    """Get LLM config repository with database session"""
    return PostgreSQLLLMConfigRepository(db)

def get_aiano_block_repository(db: Session = Depends(get_db)) -> AianoBlockRepository:
    """Get AIANO block repository with database session"""
    return PostgreSQLAianoBlockRepository(db)

def get_project_session_repository(db: Session = Depends(get_db)) -> ProjectSessionRepository:
    """Get project session repository with database session"""
    return PostgreSQLProjectSessionRepository(db)

def get_document_highlight_repository(db: Session = Depends(get_db)) -> DocumentHighlightRepository:
    """Get document highlight repository with database session"""
    return PostgreSQLDocumentHighlightRepository(db)

def get_annotation_entry_repository(db: Session = Depends(get_db)) -> AnnotationEntryRepository:
    """Get annotation entry repository with database session"""
    return PostgreSQLAnnotationEntryRepository(db)

# Service dependencies
async def get_auth_service(
    user_repo: Annotated[UserRepository, Depends(get_user_repository)],
    token_repo: Annotated[RefreshTokenRepository, Depends(get_refresh_token_repository)]
) -> AuthService:
    """Get the authentication service from FastAPI DI"""
    return AuthService(user_repo, token_repo)

async def get_annotation_service(
    project_repo: Annotated[ProjectRepository, Depends(get_project_repository)],
    document_repo: Annotated[DocumentRepository, Depends(get_document_repository)],
    annotation_repo: Annotated[AnnotationRepository, Depends(get_annotation_repository)],
    qa_pair_repo: Annotated[QAPairRepository, Depends(get_qa_pair_repository)],
    auto_save_repo: Annotated[AutoSaveRepository, Depends(get_auto_save_repository)],
    aiano_block_repo: Annotated[AianoBlockRepository, Depends(get_aiano_block_repository)],
    project_session_repo: Annotated[ProjectSessionRepository, Depends(get_project_session_repository)],
    document_highlight_repo: Annotated[DocumentHighlightRepository, Depends(get_document_highlight_repository)],
    annotation_entry_repo: Annotated[AnnotationEntryRepository, Depends(get_annotation_entry_repository)]
) -> AnnotationService:
    """Get the annotation service from FastAPI DI"""
    return AnnotationService(
        project_repo,
        document_repo,
        annotation_repo,
        qa_pair_repo,
        auto_save_repo,
        aiano_block_repo,
        project_session_repo,
        document_highlight_repo,
        annotation_entry_repo
    )

async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    auth_service: Annotated[AuthService, Depends(get_auth_service)]
):
    """Get the current authenticated user"""
    try:
        return await auth_service.get_current_user(credentials.credentials)
    except AuthenticationError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except UserNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_optional_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    auth_service: Annotated[AuthService, Depends(get_auth_service)]
):
    """Get the current authenticated user, but don't raise an error if not authenticated"""
    try:
        return await auth_service.get_current_user(credentials.credentials)
    except (AuthenticationError, UserNotFoundError):
        return None
