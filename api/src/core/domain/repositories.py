from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from .entities import (
    User, Project, Document, Annotation, QAPair, 
    RefreshToken, GlobalSettings, LLMConfig, AutoSaveData,
    AianoBlock, ProjectSession, DocumentHighlight, ProjectTemplate, AnnotationEntry
)

class UserRepository(ABC):
    @abstractmethod
    async def create(self, user: User) -> User:
        pass
    
    @abstractmethod
    async def get_by_id(self, user_id: int) -> Optional[User]:
        pass
    
    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[User]:
        pass
    
    @abstractmethod
    async def get_by_username(self, username: str) -> Optional[User]:
        pass
    
    @abstractmethod
    async def update(self, user: User) -> User:
        pass
    
    @abstractmethod
    async def delete(self, user_id: int) -> bool:
        pass
    
    @abstractmethod
    async def list(self, skip: int = 0, limit: int = 100) -> List[User]:
        pass

class ProjectRepository(ABC):
    @abstractmethod
    async def create(self, project: Project) -> Project:
        pass
    
    @abstractmethod
    async def get_by_id(self, project_id: int) -> Optional[Project]:
        pass
    
    @abstractmethod
    async def get_by_user_id(self, user_id: int) -> List[Project]:
        pass
    
    @abstractmethod
    async def update(self, project: Project) -> Project:
        pass
    
    @abstractmethod
    async def delete(self, project_id: int) -> bool:
        pass
    
    @abstractmethod
    async def add_user_to_project(self, project_id: int, user_id: int) -> bool:
        pass
    
    @abstractmethod
    async def remove_user_from_project(self, project_id: int, user_id: int) -> bool:
        pass
    
    @abstractmethod
    async def user_has_access(self, project_id: int, user_id: int) -> bool:
        pass

class DocumentRepository(ABC):
    @abstractmethod
    async def create(self, document: Document) -> Document:
        pass
    
    @abstractmethod
    async def create_bulk(self, documents: List[Document]) -> List[Document]:
        pass
    
    @abstractmethod
    async def get_by_id(self, document_id: int) -> Optional[Document]:
        pass
    
    @abstractmethod
    async def get_by_project_id(self, project_id: int) -> List[Document]:
        pass
    
    @abstractmethod
    async def update(self, document: Document) -> Document:
        pass
    
    @abstractmethod
    async def delete(self, document_id: int) -> bool:
        pass
    
    @abstractmethod
    async def delete_by_project_id(self, project_id: int) -> int:
        pass
    
    @abstractmethod
    async def get_by_project_and_user(self, project_id: int, user_id: int) -> List[Document]:
        pass

class AnnotationRepository(ABC):
    @abstractmethod
    async def create(self, annotation: Annotation) -> Annotation:
        pass
    
    @abstractmethod
    async def get_by_id(self, annotation_id: int) -> Optional[Annotation]:
        pass
    
    @abstractmethod
    async def get_by_project_id(self, project_id: int, user_id: int) -> List[Annotation]:
        pass
    
    @abstractmethod
    async def get_by_document_id(self, document_id: int, user_id: int) -> List[Annotation]:
        pass
    
    @abstractmethod
    async def update(self, annotation: Annotation) -> Annotation:
        pass
    
    @abstractmethod
    async def delete(self, annotation_id: int) -> bool:
        pass
    
    @abstractmethod
    async def delete_by_project_id(self, project_id: int, user_id: int) -> int:
        pass

class QAPairRepository(ABC):
    @abstractmethod
    async def create(self, qa_pair: QAPair) -> QAPair:
        pass
    
    @abstractmethod
    async def get_by_id(self, qa_pair_id: int) -> Optional[QAPair]:
        pass
    
    @abstractmethod
    async def get_by_project_id(self, project_id: int, user_id: int) -> List[QAPair]:
        pass
    
    @abstractmethod
    async def update(self, qa_pair: QAPair) -> QAPair:
        pass
    
    @abstractmethod
    async def delete(self, qa_pair_id: int) -> bool:
        pass

class RefreshTokenRepository(ABC):
    @abstractmethod
    async def create(self, refresh_token: RefreshToken) -> RefreshToken:
        pass
    
    @abstractmethod
    async def get_by_token(self, token: str) -> Optional[RefreshToken]:
        pass
    
    @abstractmethod
    async def revoke_token(self, token: str) -> bool:
        pass
    
    @abstractmethod
    async def revoke_user_tokens(self, user_id: int) -> bool:
        pass
    
    @abstractmethod
    async def cleanup_expired_tokens(self) -> int:
        pass

class GlobalSettingsRepository(ABC):
    @abstractmethod
    async def get_by_user_id(self, user_id: int) -> Optional[GlobalSettings]:
        pass
    
    @abstractmethod
    async def create_or_update(self, settings: GlobalSettings) -> GlobalSettings:
        pass

class LLMConfigRepository(ABC):
    @abstractmethod
    async def create(self, config: LLMConfig) -> LLMConfig:
        pass
    
    @abstractmethod
    async def get_by_id(self, config_id: int) -> Optional[LLMConfig]:
        pass
    
    @abstractmethod
    async def get_by_user_id(self, user_id: int) -> List[LLMConfig]:
        pass
    
    @abstractmethod
    async def update(self, config: LLMConfig) -> LLMConfig:
        pass
    
    @abstractmethod
    async def delete(self, config_id: int) -> bool:
        pass
    
    @abstractmethod
    async def set_default(self, config_id: int, user_id: int) -> bool:
        pass

class AutoSaveRepository(ABC):
    @abstractmethod
    async def create_or_update(self, auto_save: AutoSaveData) -> AutoSaveData:
        pass
    
    @abstractmethod
    async def get_by_project_and_type(self, project_id: int, data_type: str, user_id: int) -> Optional[AutoSaveData]:
        pass
    
    @abstractmethod
    async def get_by_file_id(self, file_id: str, user_id: int) -> Optional[AutoSaveData]:
        pass
    
    @abstractmethod
    async def delete_old_data(self, days_old: int = 30) -> int:
        pass

class AianoBlockRepository(ABC):
    @abstractmethod
    async def create(self, block: AianoBlock) -> AianoBlock:
        pass
    
    @abstractmethod
    async def get_by_id(self, block_id: int) -> Optional[AianoBlock]:
        pass
    
    @abstractmethod
    async def get_by_project_id(self, project_id: int, user_id: int) -> List[AianoBlock]:
        pass
    
    @abstractmethod
    async def update(self, block: AianoBlock) -> AianoBlock:
        pass
    
    @abstractmethod
    async def delete(self, block_id: int) -> bool:
        pass
    
    @abstractmethod
    async def delete_by_project_id(self, project_id: int) -> int:
        pass

class ProjectSessionRepository(ABC):
    @abstractmethod
    async def create(self, session: ProjectSession) -> ProjectSession:
        pass
    
    @abstractmethod
    async def get_by_id(self, session_id: int) -> Optional[ProjectSession]:
        pass
    
    @abstractmethod
    async def get_by_project_id(self, project_id: int, user_id: int) -> List[ProjectSession]:
        pass
    
    @abstractmethod
    async def get_active_session(self, project_id: int, user_id: int) -> Optional[ProjectSession]:
        pass
    
    @abstractmethod
    async def update(self, session: ProjectSession) -> ProjectSession:
        pass
    
    @abstractmethod
    async def delete(self, session_id: int) -> bool:
        pass
    
    @abstractmethod
    async def delete_by_project_id(self, project_id: int) -> int:
        pass

class DocumentHighlightRepository(ABC):
    @abstractmethod
    async def create(self, highlight: DocumentHighlight) -> DocumentHighlight:
        pass
    
    @abstractmethod
    async def get_by_id(self, highlight_id: int) -> Optional[DocumentHighlight]:
        pass
    
    @abstractmethod
    async def get_by_document_id(self, document_id: int, user_id: int) -> List[DocumentHighlight]:
        pass
    
    @abstractmethod
    async def get_by_project_id(self, project_id: int, user_id: int) -> List[DocumentHighlight]:
        pass
    
    @abstractmethod
    async def update(self, highlight: DocumentHighlight) -> DocumentHighlight:
        pass
    
    @abstractmethod
    async def delete(self, highlight_id: int) -> bool:
        pass
    
    @abstractmethod
    async def delete_by_document_id(self, document_id: int) -> int:
        pass
    
    @abstractmethod
    async def delete_by_project_id(self, project_id: int) -> int:
        pass

class ProjectTemplateRepository(ABC):
    @abstractmethod
    async def create(self, template: ProjectTemplate) -> ProjectTemplate:
        pass
    
    @abstractmethod
    async def get_by_id(self, template_id: int) -> Optional[ProjectTemplate]:
        pass
    
    @abstractmethod
    async def get_by_user_id(self, user_id: int) -> List[ProjectTemplate]:
        pass
    
    @abstractmethod
    async def get_public_templates(self) -> List[ProjectTemplate]:
        pass
    
    @abstractmethod
    async def update(self, template: ProjectTemplate) -> ProjectTemplate:
        pass
    
    @abstractmethod
    async def delete(self, template_id: int) -> bool:
        pass

class AnnotationEntryRepository(ABC):
    @abstractmethod
    async def create(self, entry: AnnotationEntry) -> AnnotationEntry:
        pass
    
    @abstractmethod
    async def get_by_id(self, entry_id: int) -> Optional[AnnotationEntry]:
        pass
    
    @abstractmethod
    async def get_by_project(self, project_id: int, user_id: int) -> List[AnnotationEntry]:
        pass
    
    @abstractmethod
    async def get_by_document(self, document_id: int, user_id: int) -> List[AnnotationEntry]:
        pass
    
    @abstractmethod
    async def update(self, entry: AnnotationEntry) -> AnnotationEntry:
        pass
    
    @abstractmethod
    async def delete(self, entry_id: int) -> bool:
        pass
