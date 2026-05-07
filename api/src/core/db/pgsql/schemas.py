from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Authentication Schemas
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[int] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str

# Project Schemas
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None

class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Document Schemas
class DocumentBase(BaseModel):
    subject_id: str
    document_id: str
    category: Optional[str] = None
    display_name: Optional[str] = None
    date: Optional[str] = None
    text: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class DocumentCreate(DocumentBase):
    project_id: int

class DocumentUpdate(BaseModel):
    subject_id: Optional[str] = None
    document_id: Optional[str] = None
    category: Optional[str] = None
    display_name: Optional[str] = None
    date: Optional[str] = None
    text: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class DocumentResponse(DocumentBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Annotation Schemas
class AnnotationBase(BaseModel):
    text_span: Dict[str, Any]
    relevancy_level_id: Optional[str] = None

class AnnotationCreate(AnnotationBase):
    project_id: int
    document_id: int

class AnnotationUpdate(BaseModel):
    text_span: Optional[Dict[str, Any]] = None
    relevancy_level_id: Optional[str] = None

class AnnotationResponse(AnnotationBase):
    id: int
    user_id: int
    project_id: int
    document_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Q&A Pair Schemas
class QAPairBase(BaseModel):
    question: str
    answer: str
    suggested_answer: Optional[str] = None
    highlights: Optional[Dict[str, Any]] = None
    llm_metadata: Optional[Dict[str, Any]] = None
    subject_id: Optional[str] = None

class QAPairCreate(QAPairBase):
    project_id: int

class QAPairUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    suggested_answer: Optional[str] = None
    highlights: Optional[Dict[str, Any]] = None
    llm_metadata: Optional[Dict[str, Any]] = None
    subject_id: Optional[str] = None

class QAPairResponse(QAPairBase):
    id: int
    user_id: int
    project_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Auto-save Schemas
class AutoSaveData(BaseModel):
    project_id: int
    data_type: str  # 'annotation', 'qa_pair', 'project_config', 'session'
    data: Dict[str, Any]
    file_id: Optional[str] = None
    timestamp: datetime

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

class GlobalSettingsUpdate(BaseModel):
    llm_configs: Optional[List[Dict[str, Any]]] = None
    default_llm_config_id: Optional[str] = None
    auto_save: Optional[bool] = None
    notifications: Optional[bool] = None

# LLM Config Schemas
class LLMConfigCreate(BaseModel):
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

class LLMConfigUpdate(BaseModel):
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
    api_key: Optional[str] = None
    api_url: str
    model: str
    temperature: float
    max_tokens: int
    system_prompt: str
    requires_auth: bool
    is_default: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True