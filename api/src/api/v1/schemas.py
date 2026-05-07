from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# Authentication Schemas
class UserCreateRequest(BaseModel):
    email: EmailStr
    username: str
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshTokenRequest(BaseModel):
    refresh_token: str

# Project Schemas
class ProjectCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None

class ProjectUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

# Document Schemas
class DocumentCreateRequest(BaseModel):
    project_id: int
    subject_id: str
    document_id: str
    category: Optional[str] = None
    display_name: Optional[str] = None
    date: Optional[str] = None
    text: Optional[str] = None
    json_document: Optional[Dict[str, Any]] = None  # Original JSON document for annotation
    metadata: Optional[Dict[str, Any]] = None

class DocumentUpdateRequest(BaseModel):
    subject_id: Optional[str] = None
    document_id: Optional[str] = None
    category: Optional[str] = None
    display_name: Optional[str] = None
    date: Optional[str] = None
    text: Optional[str] = None
    json_document: Optional[Dict[str, Any]] = None  # Original JSON document for annotation
    metadata: Optional[Dict[str, Any]] = None

class DocumentResponse(BaseModel):
    id: int
    project_id: int
    subject_id: str
    document_id: str
    category: Optional[str] = None
    display_name: Optional[str] = None
    date: Optional[str] = None
    text: Optional[str] = None
    json_document: Optional[Dict[str, Any]] = None  # Original JSON document for annotation
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

# Annotation Schemas
class AnnotationCreateRequest(BaseModel):
    project_id: int
    document_id: int
    text_span: Dict[str, Any]
    relevancy_level_id: Optional[str] = None

class AnnotationUpdateRequest(BaseModel):
    text_span: Optional[Dict[str, Any]] = None
    relevancy_level_id: Optional[str] = None

class AnnotationResponse(BaseModel):
    id: int
    user_id: int
    project_id: int
    document_id: int
    text_span: Dict[str, Any]
    relevancy_level_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

# Q&A Pair Schemas
class QAPairCreateRequest(BaseModel):
    project_id: int
    question: str
    answer: str
    suggested_answer: Optional[str] = None
    highlights: Optional[Dict[str, Any]] = None
    llm_metadata: Optional[Dict[str, Any]] = None
    subject_id: Optional[str] = None

class QAPairUpdateRequest(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    suggested_answer: Optional[str] = None
    highlights: Optional[Dict[str, Any]] = None
    llm_metadata: Optional[Dict[str, Any]] = None
    subject_id: Optional[str] = None

class QAPairResponse(BaseModel):
    id: int
    user_id: int
    project_id: int
    question: str
    answer: str
    suggested_answer: Optional[str] = None
    highlights: Optional[Dict[str, Any]] = None
    llm_metadata: Optional[Dict[str, Any]] = None
    subject_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

# Auto-save Schemas
class AutoSaveRequest(BaseModel):
    project_id: int
    data_type: str
    data: Dict[str, Any]
    file_id: Optional[str] = None

class AutoSaveResponse(BaseModel):
    success: bool
    message: str
    timestamp: datetime

# Global Settings Schemas
class GlobalSettingsResponse(BaseModel):
    llm_configs: List[Dict[str, Any]]
    default_llm_config_id: Optional[str] = None
    auto_save: bool = True
    notifications: bool = True

class GlobalSettingsUpdateRequest(BaseModel):
    llm_configs: Optional[List[Dict[str, Any]]] = None
    default_llm_config_id: Optional[str] = None
    auto_save: Optional[bool] = None
    notifications: Optional[bool] = None

# LLM Config Schemas
class LLMConfigCreateRequest(BaseModel):
    name: str
    provider: str
    api_key: Optional[str] = None
    api_url: str
    model: str
    temperature: float = 0.3
    max_tokens: int = 1000
    system_prompt: str = "You are a helpful assistant for information retrieval tasks."
    requires_auth: bool = True
    is_default: bool = False

class LLMConfigUpdateRequest(BaseModel):
    name: Optional[str] = None
    provider: Optional[str] = None
    api_key: Optional[str] = None
    api_url: Optional[str] = None
    model: Optional[str] = None
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    system_prompt: Optional[str] = None
    requires_auth: Optional[bool] = None
    is_default: Optional[bool] = None

class LLMConfigResponse(BaseModel):
    id: int
    name: str
    provider: str
    api_url: str
    model: str
    temperature: float
    max_tokens: int
    system_prompt: str
    requires_auth: bool
    is_default: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

# Project Schemas
class ProjectCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None

class ProjectUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

# Document Schemas
class DocumentCreateRequest(BaseModel):
    subject_id: str
    document_id: str
    category: Optional[str] = None
    display_name: Optional[str] = None
    date: Optional[str] = None
    text: Optional[str] = None
    json_document: Optional[Dict[str, Any]] = None  # Original JSON document for annotation
    metadata: Optional[Dict[str, Any]] = None

class DocumentUpdateRequest(BaseModel):
    category: Optional[str] = None
    display_name: Optional[str] = None
    date: Optional[str] = None
    text: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class DocumentResponse(BaseModel):
    id: int
    project_id: int
    subject_id: str
    document_id: str
    category: Optional[str] = None
    display_name: Optional[str] = None
    date: Optional[str] = None
    text: Optional[str] = None
    json_document: Optional[Dict[str, Any]] = None  # Original JSON document for annotation
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

# Annotation Schemas
class AnnotationCreateRequest(BaseModel):
    document_id: int
    text: str
    start: int
    end: int
    relevancy_level_id: Optional[int] = None
    bounding_rect: Optional[Dict[str, Any]] = None

class AnnotationUpdateRequest(BaseModel):
    text: Optional[str] = None
    start: Optional[int] = None
    end: Optional[int] = None
    relevancy_level_id: Optional[int] = None
    bounding_rect: Optional[Dict[str, Any]] = None

class AnnotationResponse(BaseModel):
    id: int
    document_id: int
    text: str
    start: int
    end: int
    relevancy_level_id: Optional[int] = None
    bounding_rect: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

# Q&A Pair Schemas
class QAPairCreateRequest(BaseModel):
    document_id: int
    question: str
    answer: Optional[str] = None
    suggested_answer: Optional[str] = None
    highlights: Optional[Dict[str, Any]] = None
    llm_metadata: Optional[Dict[str, Any]] = None
    subject_id: Optional[str] = None

class QAPairUpdateRequest(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    suggested_answer: Optional[str] = None
    highlights: Optional[Dict[str, Any]] = None
    llm_metadata: Optional[Dict[str, Any]] = None
    subject_id: Optional[str] = None

class QAPairResponse(BaseModel):
    id: int
    document_id: int
    question: str
    answer: Optional[str] = None
    suggested_answer: Optional[str] = None
    highlights: Optional[Dict[str, Any]] = None
    llm_metadata: Optional[Dict[str, Any]] = None
    subject_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

# Auto-save Schemas
class AutoSaveDataRequest(BaseModel):
    data: Dict[str, Any]

class AutoSaveDataResponse(BaseModel):
    id: int
    user_id: int
    project_id: int
    data: Dict[str, Any]
    created_at: datetime
    updated_at: Optional[datetime] = None

# AIANO Block Schemas
class AianoBlockCreateRequest(BaseModel):
    project_id: int
    block_type: str
    title: str
    description: Optional[str] = None
    input_sources: Optional[Dict[str, Any]] = None
    block_config: Optional[Dict[str, Any]] = None
    block_value: Optional[str] = None

class AianoBlockUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    input_sources: Optional[Dict[str, Any]] = None
    block_config: Optional[Dict[str, Any]] = None
    block_value: Optional[str] = None
    is_generated: Optional[bool] = None

class AianoBlockResponse(BaseModel):
    id: int
    project_id: int
    user_id: int
    block_type: str
    title: str
    description: Optional[str] = None
    input_sources: Optional[Dict[str, Any]] = None
    block_config: Optional[Dict[str, Any]] = None
    block_value: Optional[str] = None
    is_generated: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

# Project Session Schemas
class ProjectSessionCreateRequest(BaseModel):
    project_id: int
    session_name: str
    selected_document_id: Optional[int] = None
    active_highlights: Optional[Dict[str, Any]] = None
    view_state: Optional[Dict[str, Any]] = None

class ProjectSessionUpdateRequest(BaseModel):
    session_name: Optional[str] = None
    selected_document_id: Optional[int] = None
    active_highlights: Optional[Dict[str, Any]] = None
    view_state: Optional[Dict[str, Any]] = None

class ProjectSessionResponse(BaseModel):
    id: int
    project_id: int
    user_id: int
    session_name: str
    selected_document_id: Optional[int] = None
    active_highlights: Optional[Dict[str, Any]] = None
    view_state: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

# Document Highlight Schemas
class DocumentHighlightCreateRequest(BaseModel):
    document_id: int
    project_id: int
    text_span: Dict[str, Any]
    relevancy_level_id: Optional[str] = None
    highlight_type: str = "manual"
    highlight_metadata: Optional[Dict[str, Any]] = None

class DocumentHighlightUpdateRequest(BaseModel):
    text_span: Optional[Dict[str, Any]] = None
    relevancy_level_id: Optional[str] = None
    highlight_type: Optional[str] = None
    highlight_metadata: Optional[Dict[str, Any]] = None

class DocumentHighlightResponse(BaseModel):
    id: int
    document_id: int
    user_id: int
    project_id: int
    text_span: Dict[str, Any]
    relevancy_level_id: Optional[str] = None
    highlight_type: str
    highlight_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

# Complete Project State Schemas
class CompleteProjectStateRequest(BaseModel):
    project_config: Dict[str, Any]
    documents: List[DocumentCreateRequest]
    aiano_blocks: List[AianoBlockCreateRequest]
    highlights: List[DocumentHighlightCreateRequest]
    annotation_entries: Optional[List['AnnotationEntryCreateRequest']] = None
    session: Optional[ProjectSessionCreateRequest] = None

class CompleteProjectStateResponse(BaseModel):
    project: ProjectResponse
    documents: List[DocumentResponse]
    aiano_blocks: List[AianoBlockResponse]
    highlights: List[DocumentHighlightResponse]
    session: Optional[ProjectSessionResponse] = None

# Bulk Operations Schemas
class ProjectExportRequest(BaseModel):
    include_documents: bool = True
    include_annotations: bool = True
    include_highlights: bool = True
    include_aiano_blocks: bool = True
    include_session: bool = True

class ProjectExportResponse(BaseModel):
    project: ProjectResponse
    documents: Optional[List[DocumentResponse]] = None
    annotations: Optional[List[AnnotationResponse]] = None
    annotation_entries: Optional[List['AnnotationEntryResponse']] = None
    highlights: Optional[List[DocumentHighlightResponse]] = None
    aiano_blocks: Optional[List[AianoBlockResponse]] = None
    session: Optional[ProjectSessionResponse] = None
    export_timestamp: datetime

class ProjectImportRequest(BaseModel):
    project_data: CompleteProjectStateRequest
    overwrite_existing: bool = False

class ProjectImportResponse(BaseModel):
    project: ProjectResponse
    imported_items: Dict[str, int]  # Count of imported items by type
    warnings: List[str] = []
    import_timestamp: datetime

# Error Schemas
class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None
    timestamp: datetime

class ValidationErrorResponse(BaseModel):
    detail: List[Dict[str, Any]]
    error_code: str = "VALIDATION_ERROR"
    timestamp: datetime

# Annotation Entry Schemas
class AnnotationEntryCreateRequest(BaseModel):
    project_id: int
    document_id: int
    entry_data: Dict[str, Any]
    entry_name: Optional[str] = None
    entry_notes: Optional[str] = None

class AnnotationEntryUpdateRequest(BaseModel):
    entry_data: Optional[Dict[str, Any]] = None
    entry_name: Optional[str] = None
    entry_notes: Optional[str] = None

class AnnotationEntryResponse(BaseModel):
    id: int
    user_id: int
    project_id: int
    document_id: int
    entry_data: Dict[str, Any]
    entry_name: Optional[str] = None
    entry_notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
