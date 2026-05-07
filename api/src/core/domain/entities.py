from dataclasses import dataclass
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"

@dataclass
class User:
    id: Optional[int] = None
    email: str = ""
    username: str = ""
    hashed_password: str = ""
    is_active: bool = True
    is_verified: bool = False
    role: UserRole = UserRole.USER
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

@dataclass
class Project:
    id: Optional[int] = None
    name: str = ""
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

@dataclass
class Document:
    id: Optional[int] = None
    project_id: int = 0
    subject_id: str = ""
    document_id: str = ""
    category: Optional[str] = None
    display_name: Optional[str] = None
    date: Optional[str] = None
    text: Optional[str] = None
    json_document: Optional[Dict[str, Any]] = None  # Original JSON document for annotation
    metadata: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

@dataclass
class Annotation:
    id: Optional[int] = None
    user_id: int = 0
    project_id: int = 0
    document_id: int = 0
    text_span: Dict[str, Any] = None
    relevancy_level_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

@dataclass
class QAPair:
    id: Optional[int] = None
    user_id: int = 0
    project_id: int = 0
    question: str = ""
    answer: str = ""
    suggested_answer: Optional[str] = None
    highlights: Optional[Dict[str, Any]] = None
    llm_metadata: Optional[Dict[str, Any]] = None
    subject_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

@dataclass
class RefreshToken:
    id: Optional[int] = None
    user_id: int = 0
    token: str = ""
    expires_at: datetime = None
    created_at: Optional[datetime] = None
    is_revoked: bool = False

@dataclass
class GlobalSettings:
    id: Optional[int] = None
    user_id: int = 0
    settings: Dict[str, Any] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

@dataclass
class LLMConfig:
    id: Optional[int] = None
    user_id: int = 0
    name: str = ""
    provider: str = ""
    api_key: Optional[str] = None
    api_url: str = ""
    model: str = ""
    temperature: float = 0.3
    max_tokens: int = 1000
    system_prompt: str = "You are a helpful assistant for information retrieval tasks."
    requires_auth: bool = True
    is_default: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

@dataclass
class AutoSaveData:
    id: Optional[int] = None
    user_id: int = 0
    project_id: int = 0
    data_type: str = ""
    data: Dict[str, Any] = None
    file_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

@dataclass
class AianoBlock:
    id: Optional[int] = None
    project_id: int = 0
    user_id: int = 0
    block_type: str = ""
    title: str = ""
    description: Optional[str] = None
    input_sources: Optional[Dict[str, Any]] = None
    block_config: Optional[Dict[str, Any]] = None
    block_value: Optional[str] = None
    is_generated: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

@dataclass
class ProjectSession:
    id: Optional[int] = None
    project_id: int = 0
    user_id: int = 0
    session_name: str = ""
    selected_document_id: Optional[int] = None
    active_highlights: Optional[Dict[str, Any]] = None
    view_state: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

@dataclass
class DocumentHighlight:
    id: Optional[int] = None
    document_id: int = 0
    user_id: int = 0
    project_id: int = 0
    text_span: Dict[str, Any] = None
    relevancy_level_id: Optional[str] = None
    highlight_type: str = "manual"
    highlight_metadata: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

@dataclass
class ProjectTemplate:
    id: Optional[int] = None
    user_id: int = 0
    name: str = ""
    description: Optional[str] = None
    config: Dict[str, Any] = None
    is_public: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

@dataclass
class AnnotationEntry:
    id: Optional[int] = None
    user_id: int = 0
    project_id: int = 0
    document_id: int = 0
    entry_data: Dict[str, Any] = None  # Complete entry data (highlights, aiano_blocks, etc.)
    entry_name: Optional[str] = None
    entry_notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
