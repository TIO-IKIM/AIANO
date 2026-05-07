from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, ForeignKey, Table, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .config import Base

# Association table for many-to-many relationship between users and projects
user_projects = Table(
    'user_projects',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('project_id', Integer, ForeignKey('projects.id'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    projects = relationship("Project", secondary=user_projects, back_populates="users")
    annotations = relationship("Annotation", back_populates="user")
    qa_pairs = relationship("QAPair", back_populates="user")
    aiano_blocks = relationship("AianoBlock", back_populates="user")
    sessions = relationship("ProjectSession", back_populates="user")
    highlights = relationship("DocumentHighlight", back_populates="user")
    templates = relationship("ProjectTemplate", back_populates="user")

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    # Store complete project configuration as JSON (matches UI ProjectConfig)
    config = Column(JSON)  # Contains dataset, labels, relevancyLevels, aianoBlocks, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    users = relationship("User", secondary=user_projects, back_populates="projects")
    documents = relationship("Document", back_populates="project")
    annotations = relationship("Annotation", back_populates="project")
    qa_pairs = relationship("QAPair", back_populates="project")
    aiano_blocks = relationship("AianoBlock", back_populates="project")
    sessions = relationship("ProjectSession", back_populates="project")
    highlights = relationship("DocumentHighlight", back_populates="project")

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    subject_id = Column(String, nullable=False)
    document_id = Column(String, nullable=False)
    category = Column(String)
    display_name = Column(String)
    date = Column(String)
    text = Column(Text)
    json_document = Column(JSON)  # Store the original JSON document for annotation
    document_metadata = Column(JSON)  # Store additional document metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="documents")
    annotations = relationship("Annotation", back_populates="document")
    highlights = relationship("DocumentHighlight", back_populates="document")
    sessions = relationship("ProjectSession", back_populates="selected_document")

class Annotation(Base):
    __tablename__ = "annotations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    text_span = Column(JSON)  # Store TextSpan data as JSON
    relevancy_level_id = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="annotations")
    project = relationship("Project", back_populates="annotations")
    document = relationship("Document", back_populates="annotations")

class QAPair(Base):
    __tablename__ = "qa_pairs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    suggested_answer = Column(Text)
    highlights = Column(JSON)  # Store highlights data as JSON
    llm_metadata = Column(JSON)  # Store LLM metadata as JSON
    subject_id = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="qa_pairs")
    project = relationship("Project", back_populates="qa_pairs")

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_revoked = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User")

class GlobalSettings(Base):
    __tablename__ = "global_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    settings = Column(JSON, nullable=False)  # Store complete GlobalSettings as JSON
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")

class AutoSaveData(Base):
    __tablename__ = "auto_save_data"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    data_type = Column(String, nullable=False)  # 'annotation', 'qa_pair', 'project_config', 'session'
    data = Column(JSON, nullable=False)  # Store the actual data
    file_id = Column(String)  # For file-specific auto-save
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    project = relationship("Project")

class LLMConfig(Base):
    __tablename__ = "llm_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    provider = Column(String, nullable=False)
    api_key = Column(String)  # Encrypted in production
    api_url = Column(String, nullable=False)
    model = Column(String, nullable=False)
    temperature = Column(Float, default=0.3)
    max_tokens = Column(Integer, default=1000)
    system_prompt = Column(Text)
    requires_auth = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")

class AianoBlock(Base):
    __tablename__ = "aiano_blocks"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    block_type = Column(String, nullable=False)  # 'extraction', 'qa', 'summary', etc.
    title = Column(String, nullable=False)
    description = Column(Text)
    input_sources = Column(JSON)  # Array of input source configurations
    block_config = Column(JSON)  # Block-specific configuration
    block_value = Column(Text)  # Current value/content of the block
    is_generated = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    project = relationship("Project")
    user = relationship("User")

class ProjectSession(Base):
    __tablename__ = "project_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_name = Column(String, nullable=False)
    selected_document_id = Column(Integer, ForeignKey("documents.id"))
    active_highlights = Column(JSON)  # Array of highlight IDs
    view_state = Column(JSON)  # UI state (panels, filters, etc.)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    project = relationship("Project")
    user = relationship("User")
    selected_document = relationship("Document")

class DocumentHighlight(Base):
    __tablename__ = "document_highlights"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    text_span = Column(JSON, nullable=False)  # {start, end, text, id}
    relevancy_level_id = Column(String)
    highlight_type = Column(String, default="manual")  # 'manual', 'search', 'ai_generated'
    highlight_metadata = Column(JSON)  # Additional highlight metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    document = relationship("Document")
    user = relationship("User")
    project = relationship("Project")

class ProjectTemplate(Base):
    __tablename__ = "project_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    config = Column(JSON, nullable=False)  # Complete project configuration
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")

class AnnotationEntry(Base):
    __tablename__ = "annotation_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    
    # Store complete entry data as JSON
    entry_data = Column(JSON, nullable=False)  # Contains highlights, aiano_blocks, metadata, etc.
    
    # Entry metadata
    entry_name = Column(String)  # Optional name for the entry
    entry_notes = Column(Text)   # Optional notes
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    project = relationship("Project")
    document = relationship("Document")
