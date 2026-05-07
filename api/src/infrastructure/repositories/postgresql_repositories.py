from typing import List, Optional
import logging
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from src.core.domain.entities import (
    User, Project, Document, Annotation, QAPair, 
    RefreshToken, GlobalSettings, LLMConfig, AutoSaveData,
    AianoBlock, ProjectSession, DocumentHighlight, ProjectTemplate, AnnotationEntry
)
from src.core.domain.repositories import (
    UserRepository, ProjectRepository, DocumentRepository, AnnotationRepository,
    QAPairRepository, RefreshTokenRepository, GlobalSettingsRepository,
    LLMConfigRepository, AutoSaveRepository, AianoBlockRepository,
    ProjectSessionRepository, DocumentHighlightRepository, ProjectTemplateRepository, AnnotationEntryRepository
)
from src.core.db.pgsql.models import (
    User as UserModel, Project as ProjectModel, Document as DocumentModel,
    Annotation as AnnotationModel, QAPair as QAPairModel, RefreshToken as RefreshTokenModel,
    GlobalSettings as GlobalSettingsModel, LLMConfig as LLMConfigModel,
    AutoSaveData as AutoSaveDataModel, AianoBlock as AianoBlockModel,
    ProjectSession as ProjectSessionModel, DocumentHighlight as DocumentHighlightModel,
    ProjectTemplate as ProjectTemplateModel, AnnotationEntry as AnnotationEntryModel
)
from src.core.exceptions import DatabaseError

db_logger = logging.getLogger("db")
error_logger = logging.getLogger()  # Root logger goes to error.log

class PostgreSQLUserRepository(UserRepository):
    def __init__(self, db: Session):
        self.db = db

    async def create(self, user: User) -> User:
        try:
            db_user = UserModel(
                email=user.email,
                username=user.username,
                hashed_password=user.hashed_password,
                is_active=user.is_active,
                is_verified=user.is_verified
            )
            self.db.add(db_user)
            self.db.commit()
            self.db.refresh(db_user)
            db_logger.info(f"Created user: ID={db_user.id}, email={db_user.email}")
            return self._to_entity(db_user)
        except IntegrityError as e:
            self.db.rollback()
            error_msg = str(e.orig) if hasattr(e, 'orig') else str(e)
            error_logger.error(f"Database integrity error creating user: {error_msg}", exc_info=True)
            raise DatabaseError(f"Failed to create user: User may already exist. {error_msg}")
        except Exception as e:
            self.db.rollback()
            error_logger.error(f"Error creating user: {str(e)}", exc_info=True)
            raise DatabaseError(f"Failed to create user: {str(e)}")

    async def get_by_id(self, user_id: int) -> Optional[User]:
        try:
            db_user = self.db.query(UserModel).filter(UserModel.id == user_id).first()
            return self._to_entity(db_user) if db_user else None
        except Exception as e:
            raise DatabaseError(f"Failed to get user by id: {str(e)}")

    async def get_by_email(self, email: str) -> Optional[User]:
        try:
            db_user = self.db.query(UserModel).filter(UserModel.email == email).first()
            return self._to_entity(db_user) if db_user else None
        except Exception as e:
            raise DatabaseError(f"Failed to get user by email: {str(e)}")

    async def get_by_username(self, username: str) -> Optional[User]:
        try:
            db_user = self.db.query(UserModel).filter(UserModel.username == username).first()
            return self._to_entity(db_user) if db_user else None
        except Exception as e:
            raise DatabaseError(f"Failed to get user by username: {str(e)}")

    async def update(self, user: User) -> User:
        try:
            db_user = self.db.query(UserModel).filter(UserModel.id == user.id).first()
            if not db_user:
                raise DatabaseError("User not found")
            
            db_user.email = user.email
            db_user.username = user.username
            db_user.hashed_password = user.hashed_password
            db_user.is_active = user.is_active
            db_user.is_verified = user.is_verified
            
            self.db.commit()
            self.db.refresh(db_user)
            return self._to_entity(db_user)
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to update user: {str(e)}")

    async def delete(self, user_id: int) -> bool:
        try:
            db_user = self.db.query(UserModel).filter(UserModel.id == user_id).first()
            if not db_user:
                return False
            
            self.db.delete(db_user)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to delete user: {str(e)}")

    async def list(self, skip: int = 0, limit: int = 100) -> List[User]:
        try:
            db_users = self.db.query(UserModel).offset(skip).limit(limit).all()
            return [self._to_entity(db_user) for db_user in db_users]
        except Exception as e:
            raise DatabaseError(f"Failed to list users: {str(e)}")

    def _to_entity(self, db_user: UserModel) -> User:
        return User(
            id=db_user.id,
            email=db_user.email,
            username=db_user.username,
            hashed_password=db_user.hashed_password,
            is_active=db_user.is_active,
            is_verified=db_user.is_verified,
            created_at=db_user.created_at,
            updated_at=db_user.updated_at
        )

class PostgreSQLProjectRepository(ProjectRepository):
    def __init__(self, db: Session):
        self.db = db

    async def create(self, project: Project) -> Project:
        try:
            db_project = ProjectModel(
                name=project.name,
                description=project.description,
                config=project.config
            )
            self.db.add(db_project)
            self.db.commit()
            self.db.refresh(db_project)
            db_logger.info(f"Created project: ID={db_project.id}, name={db_project.name}")
            return self._to_entity(db_project)
        except IntegrityError as e:
            self.db.rollback()
            error_msg = str(e.orig) if hasattr(e, 'orig') else str(e)
            error_logger.error(f"Database integrity error creating project: {error_msg}", exc_info=True)
            raise DatabaseError(f"Failed to create project: Project may already exist. {error_msg}")
        except Exception as e:
            self.db.rollback()
            error_logger.error(f"Error creating project: {str(e)}", exc_info=True)
            raise DatabaseError(f"Failed to create project: {str(e)}")

    async def get_by_id(self, project_id: int) -> Optional[Project]:
        try:
            db_project = self.db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
            return self._to_entity(db_project) if db_project else None
        except Exception as e:
            raise DatabaseError(f"Failed to get project by id: {str(e)}")

    async def get_by_user_id(self, user_id: int) -> List[Project]:
        try:
            db_projects = self.db.query(ProjectModel).join(
                ProjectModel.users
            ).filter(UserModel.id == user_id).all()
            return [self._to_entity(db_project) for db_project in db_projects]
        except Exception as e:
            raise DatabaseError(f"Failed to get projects by user id: {str(e)}")

    async def update(self, project: Project) -> Project:
        try:
            db_project = self.db.query(ProjectModel).filter(ProjectModel.id == project.id).first()
            if not db_project:
                raise DatabaseError("Project not found")
            
            db_project.name = project.name
            db_project.description = project.description
            db_project.config = project.config
            
            self.db.commit()
            self.db.refresh(db_project)
            return self._to_entity(db_project)
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to update project: {str(e)}")

    async def delete(self, project_id: int) -> bool:
        try:
            db_project = self.db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
            if not db_project:
                return False
            
            self.db.delete(db_project)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to delete project: {str(e)}")

    async def add_user_to_project(self, project_id: int, user_id: int) -> bool:
        try:
            db_project = self.db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
            db_user = self.db.query(UserModel).filter(UserModel.id == user_id).first()
            
            if not db_project or not db_user:
                return False
            
            if db_user not in db_project.users:
                db_project.users.append(db_user)
                self.db.commit()
            
            return True
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to add user to project: {str(e)}")

    async def remove_user_from_project(self, project_id: int, user_id: int) -> bool:
        try:
            db_project = self.db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
            db_user = self.db.query(UserModel).filter(UserModel.id == user_id).first()
            
            if not db_project or not db_user:
                return False
            
            if db_user in db_project.users:
                db_project.users.remove(db_user)
                self.db.commit()
            
            return True
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to remove user from project: {str(e)}")

    async def user_has_access(self, project_id: int, user_id: int) -> bool:
        try:
            db_project = self.db.query(ProjectModel).join(
                ProjectModel.users
            ).filter(
                ProjectModel.id == project_id,
                UserModel.id == user_id
            ).first()
            return db_project is not None
        except Exception as e:
            raise DatabaseError(f"Failed to check user access: {str(e)}")

    def _to_entity(self, db_project: ProjectModel) -> Project:
        return Project(
            id=db_project.id,
            name=db_project.name,
            description=db_project.description,
            config=db_project.config,
            created_at=db_project.created_at,
            updated_at=db_project.updated_at
        )

# Similar implementations for other repositories...
# (DocumentRepository, AnnotationRepository, QAPairRepository, etc.)
# I'll create a few more key ones to show the pattern

class PostgreSQLRefreshTokenRepository(RefreshTokenRepository):
    def __init__(self, db: Session):
        self.db = db

    async def create(self, refresh_token: RefreshToken) -> RefreshToken:
        try:
            db_token = RefreshTokenModel(
                user_id=refresh_token.user_id,
                token=refresh_token.token,
                expires_at=refresh_token.expires_at
            )
            self.db.add(db_token)
            self.db.commit()
            self.db.refresh(db_token)
            return self._to_entity(db_token)
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to create refresh token: {str(e)}")

    async def get_by_token(self, token: str) -> Optional[RefreshToken]:
        try:
            db_token = self.db.query(RefreshTokenModel).filter(RefreshTokenModel.token == token).first()
            return self._to_entity(db_token) if db_token else None
        except Exception as e:
            raise DatabaseError(f"Failed to get refresh token: {str(e)}")

    async def revoke_token(self, token: str) -> bool:
        try:
            db_token = self.db.query(RefreshTokenModel).filter(RefreshTokenModel.token == token).first()
            if not db_token:
                return False
            
            db_token.is_revoked = True
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to revoke token: {str(e)}")

    async def revoke_user_tokens(self, user_id: int) -> bool:
        try:
            self.db.query(RefreshTokenModel).filter(
                RefreshTokenModel.user_id == user_id
            ).update({"is_revoked": True})
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to revoke user tokens: {str(e)}")

    async def cleanup_expired_tokens(self) -> int:
        try:
            from datetime import datetime
            expired_tokens = self.db.query(RefreshTokenModel).filter(
                RefreshTokenModel.expires_at < datetime.utcnow()
            ).all()
            count = len(expired_tokens)
            for token in expired_tokens:
                self.db.delete(token)
            self.db.commit()
            return count
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to cleanup expired tokens: {str(e)}")

    def _to_entity(self, db_token: RefreshTokenModel) -> RefreshToken:
        return RefreshToken(
            id=db_token.id,
            user_id=db_token.user_id,
            token=db_token.token,
            expires_at=db_token.expires_at,
            created_at=db_token.created_at,
            is_revoked=db_token.is_revoked
        )


class PostgreSQLDocumentRepository(DocumentRepository):
    """PostgreSQL implementation of DocumentRepository"""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def create(self, document: Document) -> Document:
        try:
            db_document = DocumentModel(
                project_id=document.project_id,
                subject_id=document.subject_id,
                document_id=document.document_id,
                category=document.category,
                display_name=document.display_name,
                date=document.date,
                text=document.text,
                json_document=document.json_document,
                document_metadata=document.metadata
            )
            self.db.add(db_document)
            self.db.commit()
            self.db.refresh(db_document)
            db_logger.info(f"Created document: ID={db_document.id}, project_id={db_document.project_id}, document_id={db_document.document_id}")
            return self._to_entity(db_document)
        except IntegrityError as e:
            self.db.rollback()
            error_msg = str(e.orig) if hasattr(e, 'orig') else str(e)
            error_logger.error(f"Database integrity error creating document: {error_msg}", exc_info=True)
            raise DatabaseError(f"Failed to create document: Document may already exist. {error_msg}")
        except Exception as e:
            self.db.rollback()
            error_logger.error(f"Error creating document: {str(e)}", exc_info=True)
            raise DatabaseError(f"Failed to create document: {str(e)}")
    
    async def create_bulk(self, documents: List[Document]) -> List[Document]:
        """Create multiple documents in a single transaction (bulk insert)"""
        try:
            if not documents:
                return []
            
            db_documents = [
                DocumentModel(
                    project_id=doc.project_id,
                    subject_id=doc.subject_id,
                    document_id=doc.document_id,
                    category=doc.category,
                    display_name=doc.display_name,
                    date=doc.date,
                    text=doc.text,
                    json_document=doc.json_document,
                    document_metadata=doc.metadata
                )
                for doc in documents
            ]
            
            # Bulk insert all documents in a single transaction
            self.db.bulk_save_objects(db_documents, return_defaults=True)
            self.db.commit()
            
            db_logger.info(f"Bulk created {len(db_documents)} documents for project_id={documents[0].project_id}")
            
            # Refresh all documents to get generated IDs and timestamps
            # Note: bulk_save_objects with return_defaults=True should populate IDs
            # but we need to query them back to get all fields including timestamps
            inserted_ids = [doc.id for doc in db_documents if doc.id]
            if inserted_ids:
                refreshed_docs = self.db.query(DocumentModel).filter(DocumentModel.id.in_(inserted_ids)).all()
                return [self._to_entity(doc) for doc in refreshed_docs]
            else:
                # Fallback: query by project_id and document_id
                result = []
                for doc in documents:
                    db_doc = self.db.query(DocumentModel).filter(
                        DocumentModel.project_id == doc.project_id,
                        DocumentModel.document_id == doc.document_id
                    ).first()
                    if db_doc:
                        result.append(self._to_entity(db_doc))
                return result
                
        except IntegrityError as e:
            self.db.rollback()
            error_msg = str(e.orig) if hasattr(e, 'orig') else str(e)
            error_logger.error(f"Database integrity error creating documents in bulk: {error_msg}", exc_info=True)
            raise DatabaseError(f"Failed to create documents in bulk: Some documents may already exist. {error_msg}")
        except Exception as e:
            self.db.rollback()
            error_logger.error(f"Error creating documents in bulk: {str(e)}", exc_info=True)
            raise DatabaseError(f"Failed to create documents in bulk: {str(e)}")
    
    async def get_by_id(self, document_id: int) -> Optional[Document]:
        try:
            db_document = self.db.query(DocumentModel).filter(DocumentModel.id == document_id).first()
            return self._to_entity(db_document) if db_document else None
        except Exception as e:
            raise DatabaseError(f"Failed to get document: {str(e)}")
    
    async def get_by_project_id(self, project_id: int) -> List[Document]:
        try:
            db_documents = self.db.query(DocumentModel).filter(DocumentModel.project_id == project_id).all()
            return [self._to_entity(doc) for doc in db_documents]
        except Exception as e:
            raise DatabaseError(f"Failed to get documents by project: {str(e)}")
    
    async def get_by_project_and_user(self, project_id: int, user_id: int) -> List[Document]:
        try:
            # First check if user has access to the project
            project = self.db.query(ProjectModel).join(ProjectModel.users).filter(
                ProjectModel.id == project_id,
                UserModel.id == user_id
            ).first()
            
            if not project:
                return []
            
            db_documents = self.db.query(DocumentModel).filter(DocumentModel.project_id == project_id).all()
            return [self._to_entity(doc) for doc in db_documents]
        except Exception as e:
            raise DatabaseError(f"Failed to get documents by project and user: {str(e)}")
    
    async def update(self, document: Document) -> Document:
        try:
            db_document = self.db.query(DocumentModel).filter(DocumentModel.id == document.id).first()
            if not db_document:
                raise DocumentNotFoundError(f"Document with id {document.id} not found")
            
            db_document.category = document.category
            db_document.display_name = document.display_name
            db_document.date = document.date
            db_document.text = document.text
            db_document.document_metadata = document.metadata
            
            self.db.commit()
            self.db.refresh(db_document)
            return self._to_entity(db_document)
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to update document: {str(e)}")
    
    async def delete(self, document_id: int) -> bool:
        try:
            db_document = self.db.query(DocumentModel).filter(DocumentModel.id == document_id).first()
            if not db_document:
                return False
            
            self.db.delete(db_document)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to delete document: {str(e)}")
    
    def _to_entity(self, db_document: DocumentModel) -> Document:
        return Document(
            id=db_document.id,
            project_id=db_document.project_id,
            subject_id=db_document.subject_id,
            document_id=db_document.document_id,
            category=db_document.category,
            display_name=db_document.display_name,
            date=db_document.date,
            text=db_document.text,
            json_document=db_document.json_document,
            metadata=db_document.document_metadata,
            created_at=db_document.created_at,
            updated_at=db_document.updated_at
        )
    
    async def delete_by_project_id(self, project_id: int) -> int:
        """Delete all documents for a project"""
        try:
            deleted_count = self.db.query(DocumentModel).filter(
                DocumentModel.project_id == project_id
            ).delete()
            self.db.commit()
            return deleted_count
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to delete documents by project: {str(e)}")


class PostgreSQLAnnotationRepository(AnnotationRepository):
    """PostgreSQL implementation of AnnotationRepository"""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def create(self, annotation: Annotation) -> Annotation:
        try:
            db_annotation = AnnotationModel(
                document_id=annotation.document_id,
                text=annotation.text,
                start=annotation.start,
                end=annotation.end,
                relevancy_level_id=annotation.relevancy_level_id,
                bounding_rect=annotation.bounding_rect
            )
            self.db.add(db_annotation)
            self.db.commit()
            self.db.refresh(db_annotation)
            return self._to_entity(db_annotation)
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to create annotation: {str(e)}")
    
    async def get_by_id(self, annotation_id: int) -> Optional[Annotation]:
        try:
            db_annotation = self.db.query(AnnotationModel).filter(AnnotationModel.id == annotation_id).first()
            return self._to_entity(db_annotation) if db_annotation else None
        except Exception as e:
            raise DatabaseError(f"Failed to get annotation: {str(e)}")
    
    async def get_by_document(self, document_id: int) -> List[Annotation]:
        try:
            db_annotations = self.db.query(AnnotationModel).filter(AnnotationModel.document_id == document_id).all()
            return [self._to_entity(ann) for ann in db_annotations]
        except Exception as e:
            raise DatabaseError(f"Failed to get annotations by document: {str(e)}")
    
    async def get_by_document_id(self, document_id: int, user_id: int) -> List[Annotation]:
        try:
            # First check if user has access to the document's project
            document = self.db.query(DocumentModel).join(DocumentModel.project).join(ProjectModel.users).filter(
                DocumentModel.id == document_id,
                UserModel.id == user_id
            ).first()
            
            if not document:
                return []
            
            db_annotations = self.db.query(AnnotationModel).filter(AnnotationModel.document_id == document_id).all()
            return [self._to_entity(ann) for ann in db_annotations]
        except Exception as e:
            raise DatabaseError(f"Failed to get annotations by document and user: {str(e)}")
    
    async def get_by_project_id(self, project_id: int, user_id: int) -> List[Annotation]:
        try:
            # First check if user has access to the project
            project = self.db.query(ProjectModel).join(ProjectModel.users).filter(
                ProjectModel.id == project_id,
                UserModel.id == user_id
            ).first()
            
            if not project:
                return []
            
            # Get all annotations for documents in this project
            db_annotations = self.db.query(AnnotationModel).join(DocumentModel).filter(
                DocumentModel.project_id == project_id
            ).all()
            return [self._to_entity(ann) for ann in db_annotations]
        except Exception as e:
            raise DatabaseError(f"Failed to get annotations by project and user: {str(e)}")
    
    async def update(self, annotation: Annotation) -> Annotation:
        try:
            db_annotation = self.db.query(AnnotationModel).filter(AnnotationModel.id == annotation.id).first()
            if not db_annotation:
                raise AnnotationNotFoundError(f"Annotation with id {annotation.id} not found")
            
            db_annotation.text = annotation.text
            db_annotation.start = annotation.start
            db_annotation.end = annotation.end
            db_annotation.relevancy_level_id = annotation.relevancy_level_id
            db_annotation.bounding_rect = annotation.bounding_rect
            
            self.db.commit()
            self.db.refresh(db_annotation)
            return self._to_entity(db_annotation)
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to update annotation: {str(e)}")
    
    async def delete(self, annotation_id: int) -> bool:
        try:
            db_annotation = self.db.query(AnnotationModel).filter(AnnotationModel.id == annotation_id).first()
            if not db_annotation:
                return False
            
            self.db.delete(db_annotation)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to delete annotation: {str(e)}")
    
    def _to_entity(self, db_annotation: AnnotationModel) -> Annotation:
        return Annotation(
            id=db_annotation.id,
            document_id=db_annotation.document_id,
            text=db_annotation.text,
            start=db_annotation.start,
            end=db_annotation.end,
            relevancy_level_id=db_annotation.relevancy_level_id,
            bounding_rect=db_annotation.bounding_rect,
            created_at=db_annotation.created_at,
            updated_at=db_annotation.updated_at
        )
    
    async def delete_by_project_id(self, project_id: int, user_id: int) -> int:
        """Delete all annotations for a project"""
        try:
            # First get all document IDs for the project
            document_ids = self.db.query(DocumentModel.id).filter(
                DocumentModel.project_id == project_id
            ).subquery()
            
            # Then delete annotations for those documents
            deleted_count = self.db.query(AnnotationModel).filter(
                AnnotationModel.document_id.in_(document_ids),
                AnnotationModel.user_id == user_id
            ).delete(synchronize_session=False)
            self.db.commit()
            return deleted_count
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to delete annotations by project: {str(e)}")


class PostgreSQLQAPairRepository(QAPairRepository):
    """PostgreSQL implementation of QAPairRepository"""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def create(self, qa_pair: QAPair) -> QAPair:
        try:
            db_qa_pair = QAPairModel(
                document_id=qa_pair.document_id,
                question=qa_pair.question,
                answer=qa_pair.answer,
                suggested_answer=qa_pair.suggested_answer,
                highlights=qa_pair.highlights,
                llm_metadata=qa_pair.llm_metadata,
                subject_id=qa_pair.subject_id
            )
            self.db.add(db_qa_pair)
            self.db.commit()
            self.db.refresh(db_qa_pair)
            return self._to_entity(db_qa_pair)
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to create Q&A pair: {str(e)}")
    
    async def get_by_id(self, qa_pair_id: int) -> Optional[QAPair]:
        try:
            db_qa_pair = self.db.query(QAPairModel).filter(QAPairModel.id == qa_pair_id).first()
            return self._to_entity(db_qa_pair) if db_qa_pair else None
        except Exception as e:
            raise DatabaseError(f"Failed to get Q&A pair: {str(e)}")
    
    async def get_by_document(self, document_id: int) -> List[QAPair]:
        try:
            db_qa_pairs = self.db.query(QAPairModel).filter(QAPairModel.document_id == document_id).all()
            return [self._to_entity(qa) for qa in db_qa_pairs]
        except Exception as e:
            raise DatabaseError(f"Failed to get Q&A pairs by document: {str(e)}")
    
    async def get_by_project_id(self, project_id: int, user_id: int) -> List[QAPair]:
        try:
            # First check if user has access to the project
            project = self.db.query(ProjectModel).join(ProjectModel.users).filter(
                ProjectModel.id == project_id,
                UserModel.id == user_id
            ).first()
            
            if not project:
                return []
            
            # Get all Q&A pairs for documents in this project
            db_qa_pairs = self.db.query(QAPairModel).join(DocumentModel).filter(
                DocumentModel.project_id == project_id
            ).all()
            return [self._to_entity(qa) for qa in db_qa_pairs]
        except Exception as e:
            raise DatabaseError(f"Failed to get Q&A pairs by project and user: {str(e)}")
    
    async def update(self, qa_pair: QAPair) -> QAPair:
        try:
            db_qa_pair = self.db.query(QAPairModel).filter(QAPairModel.id == qa_pair.id).first()
            if not db_qa_pair:
                raise QAPairNotFoundError(f"Q&A pair with id {qa_pair.id} not found")
            
            db_qa_pair.question = qa_pair.question
            db_qa_pair.answer = qa_pair.answer
            db_qa_pair.suggested_answer = qa_pair.suggested_answer
            db_qa_pair.highlights = qa_pair.highlights
            db_qa_pair.llm_metadata = qa_pair.llm_metadata
            db_qa_pair.subject_id = qa_pair.subject_id
            
            self.db.commit()
            self.db.refresh(db_qa_pair)
            return self._to_entity(db_qa_pair)
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to update Q&A pair: {str(e)}")
    
    async def delete(self, qa_pair_id: int) -> bool:
        try:
            db_qa_pair = self.db.query(QAPairModel).filter(QAPairModel.id == qa_pair_id).first()
            if not db_qa_pair:
                return False
            
            self.db.delete(db_qa_pair)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to delete Q&A pair: {str(e)}")
    
    def _to_entity(self, db_qa_pair: QAPairModel) -> QAPair:
        return QAPair(
            id=db_qa_pair.id,
            document_id=db_qa_pair.document_id,
            question=db_qa_pair.question,
            answer=db_qa_pair.answer,
            suggested_answer=db_qa_pair.suggested_answer,
            highlights=db_qa_pair.highlights,
            llm_metadata=db_qa_pair.llm_metadata,
            subject_id=db_qa_pair.subject_id,
            created_at=db_qa_pair.created_at,
            updated_at=db_qa_pair.updated_at
        )


class PostgreSQLAutoSaveRepository(AutoSaveRepository):
    """PostgreSQL implementation of AutoSaveRepository"""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def create(self, auto_save_data: AutoSaveData) -> AutoSaveData:
        try:
            db_auto_save = AutoSaveDataModel(
                user_id=auto_save_data.user_id,
                project_id=auto_save_data.project_id,
                data=auto_save_data.data
            )
            self.db.add(db_auto_save)
            self.db.commit()
            self.db.refresh(db_auto_save)
            return self._to_entity(db_auto_save)
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to create auto-save data: {str(e)}")
    
    async def get_by_user_and_project(self, user_id: int, project_id: int) -> Optional[AutoSaveData]:
        try:
            db_auto_save = self.db.query(AutoSaveDataModel).filter(
                AutoSaveDataModel.user_id == user_id,
                AutoSaveDataModel.project_id == project_id
            ).first()
            return self._to_entity(db_auto_save) if db_auto_save else None
        except Exception as e:
            raise DatabaseError(f"Failed to get auto-save data: {str(e)}")
    
    async def update(self, auto_save_data: AutoSaveData) -> AutoSaveData:
        try:
            db_auto_save = self.db.query(AutoSaveDataModel).filter(
                AutoSaveDataModel.user_id == auto_save_data.user_id,
                AutoSaveDataModel.project_id == auto_save_data.project_id
            ).first()
            
            if not db_auto_save:
                return await self.create(auto_save_data)
            
            db_auto_save.data = auto_save_data.data
            self.db.commit()
            self.db.refresh(db_auto_save)
            return self._to_entity(db_auto_save)
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to update auto-save data: {str(e)}")
    
    async def create_or_update(self, auto_save: AutoSaveData) -> AutoSaveData:
        try:
            db_auto_save = self.db.query(AutoSaveDataModel).filter(
                AutoSaveDataModel.user_id == auto_save.user_id,
                AutoSaveDataModel.project_id == auto_save.project_id
            ).first()
            
            if not db_auto_save:
                return await self.create(auto_save)
            else:
                return await self.update(auto_save)
        except Exception as e:
            raise DatabaseError(f"Failed to create or update auto-save data: {str(e)}")
    
    async def get_by_project_and_type(self, project_id: int, data_type: str, user_id: int) -> Optional[AutoSaveData]:
        try:
            db_auto_save = self.db.query(AutoSaveDataModel).filter(
                AutoSaveDataModel.user_id == user_id,
                AutoSaveDataModel.project_id == project_id
            ).first()
            
            if not db_auto_save:
                return None
            
            # Check if the data contains the specified type
            if isinstance(db_auto_save.data, dict) and data_type in db_auto_save.data:
                return self._to_entity(db_auto_save)
            return None
        except Exception as e:
            raise DatabaseError(f"Failed to get auto-save data by project and type: {str(e)}")
    
    async def get_by_file_id(self, file_id: str, user_id: int) -> Optional[AutoSaveData]:
        try:
            # Search for auto-save data that contains the file_id in its data
            db_auto_save = self.db.query(AutoSaveDataModel).filter(
                AutoSaveDataModel.user_id == user_id,
                AutoSaveDataModel.data.contains({"file_id": file_id})
            ).first()
            return self._to_entity(db_auto_save) if db_auto_save else None
        except Exception as e:
            raise DatabaseError(f"Failed to get auto-save data by file ID: {str(e)}")
    
    async def delete_old_data(self, days_old: int = 30) -> int:
        try:
            from datetime import datetime, timedelta
            cutoff_date = datetime.utcnow() - timedelta(days=days_old)
            
            old_data = self.db.query(AutoSaveDataModel).filter(
                AutoSaveDataModel.created_at < cutoff_date
            ).all()
            
            count = len(old_data)
            for data in old_data:
                self.db.delete(data)
            
            self.db.commit()
            return count
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to delete old auto-save data: {str(e)}")
    
    async def delete(self, user_id: int, project_id: int) -> bool:
        try:
            db_auto_save = self.db.query(AutoSaveDataModel).filter(
                AutoSaveDataModel.user_id == user_id,
                AutoSaveDataModel.project_id == project_id
            ).first()
            
            if not db_auto_save:
                return False
            
            self.db.delete(db_auto_save)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to delete auto-save data: {str(e)}")
    
    def _to_entity(self, db_auto_save: AutoSaveDataModel) -> AutoSaveData:
        return AutoSaveData(
            id=db_auto_save.id,
            user_id=db_auto_save.user_id,
            project_id=db_auto_save.project_id,
            data=db_auto_save.data,
            created_at=db_auto_save.created_at,
            updated_at=db_auto_save.updated_at
        )


class PostgreSQLGlobalSettingsRepository(GlobalSettingsRepository):
    """PostgreSQL implementation of GlobalSettingsRepository"""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def get_by_user(self, user_id: int) -> Optional[GlobalSettings]:
        try:
            db_settings = self.db.query(GlobalSettingsModel).filter(GlobalSettingsModel.user_id == user_id).first()
            return self._to_entity(db_settings) if db_settings else None
        except Exception as e:
            raise DatabaseError(f"Failed to get global settings: {str(e)}")
    
    async def get_by_user_id(self, user_id: int) -> Optional[GlobalSettings]:
        return await self.get_by_user(user_id)
    
    async def create_or_update(self, settings: GlobalSettings) -> GlobalSettings:
        try:
            db_settings = self.db.query(GlobalSettingsModel).filter(GlobalSettingsModel.user_id == settings.user_id).first()
            
            if not db_settings:
                db_settings = GlobalSettingsModel(
                    user_id=settings.user_id,
                    settings=settings.settings
                )
                self.db.add(db_settings)
            else:
                db_settings.settings = settings.settings
            
            self.db.commit()
            self.db.refresh(db_settings)
            return self._to_entity(db_settings)
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to create/update global settings: {str(e)}")
    
    def _to_entity(self, db_settings: GlobalSettingsModel) -> GlobalSettings:
        return GlobalSettings(
            id=db_settings.id,
            user_id=db_settings.user_id,
            settings=db_settings.settings,
            created_at=db_settings.created_at,
            updated_at=db_settings.updated_at
        )


class PostgreSQLLLMConfigRepository(LLMConfigRepository):
    """PostgreSQL implementation of LLMConfigRepository"""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def create(self, llm_config: LLMConfig) -> LLMConfig:
        try:
            db_config = LLMConfigModel(
                user_id=llm_config.user_id,
                name=llm_config.name,
                provider=llm_config.provider,
                api_key=llm_config.api_key,
                api_url=llm_config.api_url,
                model=llm_config.model,
                temperature=llm_config.temperature,
                max_tokens=llm_config.max_tokens,
                system_prompt=llm_config.system_prompt,
                requires_auth=llm_config.requires_auth,
                is_default=llm_config.is_default
            )
            self.db.add(db_config)
            self.db.commit()
            self.db.refresh(db_config)
            return self._to_entity(db_config)
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to create LLM config: {str(e)}")
    
    async def get_by_id(self, config_id: int) -> Optional[LLMConfig]:
        try:
            db_config = self.db.query(LLMConfigModel).filter(LLMConfigModel.id == config_id).first()
            return self._to_entity(db_config) if db_config else None
        except Exception as e:
            raise DatabaseError(f"Failed to get LLM config: {str(e)}")
    
    async def get_by_user(self, user_id: int) -> List[LLMConfig]:
        try:
            db_configs = self.db.query(LLMConfigModel).filter(LLMConfigModel.user_id == user_id).all()
            return [self._to_entity(config) for config in db_configs]
        except Exception as e:
            raise DatabaseError(f"Failed to get LLM configs by user: {str(e)}")
    
    async def get_by_user_id(self, user_id: int) -> List[LLMConfig]:
        return await self.get_by_user(user_id)
    
    async def get_default(self, user_id: int) -> Optional[LLMConfig]:
        try:
            db_config = self.db.query(LLMConfigModel).filter(
                LLMConfigModel.user_id == user_id,
                LLMConfigModel.is_default == True
            ).first()
            return self._to_entity(db_config) if db_config else None
        except Exception as e:
            raise DatabaseError(f"Failed to get default LLM config: {str(e)}")
    
    async def update(self, llm_config: LLMConfig) -> LLMConfig:
        try:
            db_config = self.db.query(LLMConfigModel).filter(LLMConfigModel.id == llm_config.id).first()
            if not db_config:
                raise DatabaseError(f"LLM config with id {llm_config.id} not found")
            
            db_config.name = llm_config.name
            db_config.provider = llm_config.provider
            db_config.api_key = llm_config.api_key
            db_config.api_url = llm_config.api_url
            db_config.model = llm_config.model
            db_config.temperature = llm_config.temperature
            db_config.max_tokens = llm_config.max_tokens
            db_config.system_prompt = llm_config.system_prompt
            db_config.requires_auth = llm_config.requires_auth
            db_config.is_default = llm_config.is_default
            
            self.db.commit()
            self.db.refresh(db_config)
            return self._to_entity(db_config)
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to update LLM config: {str(e)}")
    
    async def update_partial(self, config_id: int, updates: dict) -> LLMConfig:
        """Update specific fields of an LLM config"""
        try:
            db_config = self.db.query(LLMConfigModel).filter(LLMConfigModel.id == config_id).first()
            if not db_config:
                raise DatabaseError(f"LLM config with id {config_id} not found")
            
            # Update only the provided fields
            for field, value in updates.items():
                if hasattr(db_config, field):
                    setattr(db_config, field, value)
            
            self.db.commit()
            self.db.refresh(db_config)
            return self._to_entity(db_config)
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to update LLM config: {str(e)}")
    
    async def delete(self, config_id: int) -> bool:
        try:
            db_config = self.db.query(LLMConfigModel).filter(LLMConfigModel.id == config_id).first()
            if not db_config:
                return False
            
            self.db.delete(db_config)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to delete LLM config: {str(e)}")
    
    async def set_default(self, config_id: int, user_id: int) -> bool:
        try:
            # First, unset all other configs as default for this user
            self.db.query(LLMConfigModel).filter(
                LLMConfigModel.user_id == user_id,
                LLMConfigModel.is_default == True
            ).update({"is_default": False})
            
            # Set the specified config as default
            db_config = self.db.query(LLMConfigModel).filter(
                LLMConfigModel.id == config_id,
                LLMConfigModel.user_id == user_id
            ).first()
            
            if not db_config:
                return False
            
            db_config.is_default = True
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to set default LLM config: {str(e)}")
    
    def _to_entity(self, db_config: LLMConfigModel) -> LLMConfig:
        return LLMConfig(
            id=db_config.id,
            user_id=db_config.user_id,
            name=db_config.name,
            provider=db_config.provider,
            api_key=db_config.api_key,
            api_url=db_config.api_url,
            model=db_config.model,
            temperature=db_config.temperature,
            max_tokens=db_config.max_tokens,
            system_prompt=db_config.system_prompt,
            requires_auth=db_config.requires_auth,
            is_default=db_config.is_default,
            created_at=db_config.created_at,
            updated_at=db_config.updated_at
        )

class PostgreSQLAianoBlockRepository(AianoBlockRepository):
    def __init__(self, db: Session):
        self.db = db

    async def create(self, block: AianoBlock) -> AianoBlock:
        try:
            db_block = AianoBlockModel(
                project_id=block.project_id,
                user_id=block.user_id,
                block_type=block.block_type,
                title=block.title,
                description=block.description,
                input_sources=block.input_sources,
                block_config=block.block_config,
                block_value=block.block_value,
                is_generated=block.is_generated
            )
            self.db.add(db_block)
            self.db.commit()
            self.db.refresh(db_block)
            return self._to_entity(db_block)
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to create AIANO block: {str(e)}")

    async def get_by_id(self, block_id: int) -> Optional[AianoBlock]:
        try:
            db_block = self.db.query(AianoBlockModel).filter(AianoBlockModel.id == block_id).first()
            return self._to_entity(db_block) if db_block else None
        except Exception as e:
            raise DatabaseError(f"Failed to get AIANO block by id: {str(e)}")

    async def get_by_project_id(self, project_id: int, user_id: int) -> List[AianoBlock]:
        try:
            db_blocks = self.db.query(AianoBlockModel).filter(
                AianoBlockModel.project_id == project_id,
                AianoBlockModel.user_id == user_id
            ).all()
            return [self._to_entity(block) for block in db_blocks]
        except Exception as e:
            raise DatabaseError(f"Failed to get AIANO blocks by project: {str(e)}")

    async def update(self, block: AianoBlock) -> AianoBlock:
        try:
            db_block = self.db.query(AianoBlockModel).filter(AianoBlockModel.id == block.id).first()
            if not db_block:
                raise DatabaseError("AIANO block not found")
            
            db_block.title = block.title
            db_block.description = block.description
            db_block.input_sources = block.input_sources
            db_block.block_config = block.block_config
            db_block.block_value = block.block_value
            db_block.is_generated = block.is_generated
            
            self.db.commit()
            self.db.refresh(db_block)
            return self._to_entity(db_block)
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to update AIANO block: {str(e)}")

    async def delete(self, block_id: int) -> bool:
        try:
            db_block = self.db.query(AianoBlockModel).filter(AianoBlockModel.id == block_id).first()
            if not db_block:
                return False
            
            self.db.delete(db_block)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to delete AIANO block: {str(e)}")

    async def delete_by_project_id(self, project_id: int) -> int:
        try:
            deleted_count = self.db.query(AianoBlockModel).filter(
                AianoBlockModel.project_id == project_id
            ).delete()
            self.db.commit()
            return deleted_count
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to delete AIANO blocks by project: {str(e)}")

    def _to_entity(self, db_block: AianoBlockModel) -> AianoBlock:
        return AianoBlock(
            id=db_block.id,
            project_id=db_block.project_id,
            user_id=db_block.user_id,
            block_type=db_block.block_type,
            title=db_block.title,
            description=db_block.description,
            input_sources=db_block.input_sources,
            block_config=db_block.block_config,
            block_value=db_block.block_value,
            is_generated=db_block.is_generated,
            created_at=db_block.created_at,
            updated_at=db_block.updated_at
        )

class PostgreSQLProjectSessionRepository(ProjectSessionRepository):
    def __init__(self, db: Session):
        self.db = db

    async def create(self, session: ProjectSession) -> ProjectSession:
        try:
            db_session = ProjectSessionModel(
                project_id=session.project_id,
                user_id=session.user_id,
                session_name=session.session_name,
                selected_document_id=session.selected_document_id,
                active_highlights=session.active_highlights,
                view_state=session.view_state
            )
            self.db.add(db_session)
            self.db.commit()
            self.db.refresh(db_session)
            return self._to_entity(db_session)
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to create project session: {str(e)}")

    async def get_by_id(self, session_id: int) -> Optional[ProjectSession]:
        try:
            db_session = self.db.query(ProjectSessionModel).filter(ProjectSessionModel.id == session_id).first()
            return self._to_entity(db_session) if db_session else None
        except Exception as e:
            raise DatabaseError(f"Failed to get project session by id: {str(e)}")

    async def get_by_project_id(self, project_id: int, user_id: int) -> List[ProjectSession]:
        try:
            db_sessions = self.db.query(ProjectSessionModel).filter(
                ProjectSessionModel.project_id == project_id,
                ProjectSessionModel.user_id == user_id
            ).all()
            return [self._to_entity(session) for session in db_sessions]
        except Exception as e:
            raise DatabaseError(f"Failed to get project sessions by project: {str(e)}")

    async def get_active_session(self, project_id: int, user_id: int) -> Optional[ProjectSession]:
        try:
            db_session = self.db.query(ProjectSessionModel).filter(
                ProjectSessionModel.project_id == project_id,
                ProjectSessionModel.user_id == user_id
            ).order_by(ProjectSessionModel.updated_at.desc()).first()
            return self._to_entity(db_session) if db_session else None
        except Exception as e:
            raise DatabaseError(f"Failed to get active project session: {str(e)}")

    async def update(self, session: ProjectSession) -> ProjectSession:
        try:
            db_session = self.db.query(ProjectSessionModel).filter(ProjectSessionModel.id == session.id).first()
            if not db_session:
                raise DatabaseError("Project session not found")
            
            db_session.session_name = session.session_name
            db_session.selected_document_id = session.selected_document_id
            db_session.active_highlights = session.active_highlights
            db_session.view_state = session.view_state
            
            self.db.commit()
            self.db.refresh(db_session)
            return self._to_entity(db_session)
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to update project session: {str(e)}")

    async def delete(self, session_id: int) -> bool:
        try:
            db_session = self.db.query(ProjectSessionModel).filter(ProjectSessionModel.id == session_id).first()
            if not db_session:
                return False
            
            self.db.delete(db_session)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to delete project session: {str(e)}")

    async def delete_by_project_id(self, project_id: int) -> int:
        try:
            deleted_count = self.db.query(ProjectSessionModel).filter(
                ProjectSessionModel.project_id == project_id
            ).delete()
            self.db.commit()
            return deleted_count
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to delete project sessions by project: {str(e)}")

    def _to_entity(self, db_session: ProjectSessionModel) -> ProjectSession:
        return ProjectSession(
            id=db_session.id,
            project_id=db_session.project_id,
            user_id=db_session.user_id,
            session_name=db_session.session_name,
            selected_document_id=db_session.selected_document_id,
            active_highlights=db_session.active_highlights,
            view_state=db_session.view_state,
            created_at=db_session.created_at,
            updated_at=db_session.updated_at
        )

class PostgreSQLDocumentHighlightRepository(DocumentHighlightRepository):
    def __init__(self, db: Session):
        self.db = db

    async def create(self, highlight: DocumentHighlight) -> DocumentHighlight:
        try:
            db_highlight = DocumentHighlightModel(
                document_id=highlight.document_id,
                user_id=highlight.user_id,
                project_id=highlight.project_id,
                text_span=highlight.text_span,
                relevancy_level_id=highlight.relevancy_level_id,
                highlight_type=highlight.highlight_type,
                highlight_metadata=highlight.highlight_metadata
            )
            self.db.add(db_highlight)
            self.db.commit()
            self.db.refresh(db_highlight)
            return self._to_entity(db_highlight)
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to create document highlight: {str(e)}")

    async def get_by_id(self, highlight_id: int) -> Optional[DocumentHighlight]:
        try:
            db_highlight = self.db.query(DocumentHighlightModel).filter(DocumentHighlightModel.id == highlight_id).first()
            return self._to_entity(db_highlight) if db_highlight else None
        except Exception as e:
            raise DatabaseError(f"Failed to get document highlight by id: {str(e)}")

    async def get_by_document_id(self, document_id: int, user_id: int) -> List[DocumentHighlight]:
        try:
            db_highlights = self.db.query(DocumentHighlightModel).filter(
                DocumentHighlightModel.document_id == document_id,
                DocumentHighlightModel.user_id == user_id
            ).all()
            return [self._to_entity(highlight) for highlight in db_highlights]
        except Exception as e:
            raise DatabaseError(f"Failed to get document highlights by document: {str(e)}")

    async def get_by_project_id(self, project_id: int, user_id: int) -> List[DocumentHighlight]:
        try:
            db_highlights = self.db.query(DocumentHighlightModel).filter(
                DocumentHighlightModel.project_id == project_id,
                DocumentHighlightModel.user_id == user_id
            ).all()
            return [self._to_entity(highlight) for highlight in db_highlights]
        except Exception as e:
            raise DatabaseError(f"Failed to get document highlights by project: {str(e)}")

    async def update(self, highlight: DocumentHighlight) -> DocumentHighlight:
        try:
            db_highlight = self.db.query(DocumentHighlightModel).filter(DocumentHighlightModel.id == highlight.id).first()
            if not db_highlight:
                raise DatabaseError("Document highlight not found")
            
            db_highlight.text_span = highlight.text_span
            db_highlight.relevancy_level_id = highlight.relevancy_level_id
            db_highlight.highlight_type = highlight.highlight_type
            db_highlight.highlight_metadata = highlight.highlight_metadata
            
            self.db.commit()
            self.db.refresh(db_highlight)
            return self._to_entity(db_highlight)
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to update document highlight: {str(e)}")

    async def delete(self, highlight_id: int) -> bool:
        try:
            db_highlight = self.db.query(DocumentHighlightModel).filter(DocumentHighlightModel.id == highlight_id).first()
            if not db_highlight:
                return False
            
            self.db.delete(db_highlight)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to delete document highlight: {str(e)}")

    async def delete_by_document_id(self, document_id: int) -> int:
        try:
            deleted_count = self.db.query(DocumentHighlightModel).filter(
                DocumentHighlightModel.document_id == document_id
            ).delete()
            self.db.commit()
            return deleted_count
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to delete document highlights by document: {str(e)}")

    async def delete_by_project_id(self, project_id: int) -> int:
        try:
            deleted_count = self.db.query(DocumentHighlightModel).filter(
                DocumentHighlightModel.project_id == project_id
            ).delete()
            self.db.commit()
            return deleted_count
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to delete document highlights by project: {str(e)}")

    def _to_entity(self, db_highlight: DocumentHighlightModel) -> DocumentHighlight:
        return DocumentHighlight(
            id=db_highlight.id,
            document_id=db_highlight.document_id,
            user_id=db_highlight.user_id,
            project_id=db_highlight.project_id,
            text_span=db_highlight.text_span,
            relevancy_level_id=db_highlight.relevancy_level_id,
            highlight_type=db_highlight.highlight_type,
            highlight_metadata=db_highlight.highlight_metadata,
            created_at=db_highlight.created_at,
            updated_at=db_highlight.updated_at
        )

class PostgreSQLProjectTemplateRepository(ProjectTemplateRepository):
    def __init__(self, db: Session):
        self.db = db

    async def create(self, template: ProjectTemplate) -> ProjectTemplate:
        try:
            db_template = ProjectTemplateModel(
                user_id=template.user_id,
                name=template.name,
                description=template.description,
                config=template.config,
                is_public=template.is_public
            )
            self.db.add(db_template)
            self.db.commit()
            self.db.refresh(db_template)
            return self._to_entity(db_template)
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to create project template: {str(e)}")

    async def get_by_id(self, template_id: int) -> Optional[ProjectTemplate]:
        try:
            db_template = self.db.query(ProjectTemplateModel).filter(ProjectTemplateModel.id == template_id).first()
            return self._to_entity(db_template) if db_template else None
        except Exception as e:
            raise DatabaseError(f"Failed to get project template by id: {str(e)}")

    async def get_by_user_id(self, user_id: int) -> List[ProjectTemplate]:
        try:
            db_templates = self.db.query(ProjectTemplateModel).filter(
                ProjectTemplateModel.user_id == user_id
            ).all()
            return [self._to_entity(template) for template in db_templates]
        except Exception as e:
            raise DatabaseError(f"Failed to get project templates by user: {str(e)}")

    async def get_public_templates(self) -> List[ProjectTemplate]:
        try:
            db_templates = self.db.query(ProjectTemplateModel).filter(
                ProjectTemplateModel.is_public == True
            ).all()
            return [self._to_entity(template) for template in db_templates]
        except Exception as e:
            raise DatabaseError(f"Failed to get public project templates: {str(e)}")

    async def update(self, template: ProjectTemplate) -> ProjectTemplate:
        try:
            db_template = self.db.query(ProjectTemplateModel).filter(ProjectTemplateModel.id == template.id).first()
            if not db_template:
                raise DatabaseError("Project template not found")
            
            db_template.name = template.name
            db_template.description = template.description
            db_template.config = template.config
            db_template.is_public = template.is_public
            
            self.db.commit()
            self.db.refresh(db_template)
            return self._to_entity(db_template)
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to update project template: {str(e)}")

    async def delete(self, template_id: int) -> bool:
        try:
            db_template = self.db.query(ProjectTemplateModel).filter(ProjectTemplateModel.id == template_id).first()
            if not db_template:
                return False
            
            self.db.delete(db_template)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to delete project template: {str(e)}")

    def _to_entity(self, db_template: ProjectTemplateModel) -> ProjectTemplate:
        return ProjectTemplate(
            id=db_template.id,
            user_id=db_template.user_id,
            name=db_template.name,
            description=db_template.description,
            config=db_template.config,
            is_public=db_template.is_public,
            created_at=db_template.created_at,
            updated_at=db_template.updated_at
        )

class PostgreSQLAnnotationEntryRepository(AnnotationEntryRepository):
    """PostgreSQL implementation of AnnotationEntryRepository"""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def create(self, entry: AnnotationEntry) -> AnnotationEntry:
        try:
            db_entry = AnnotationEntryModel(
                user_id=entry.user_id,
                project_id=entry.project_id,
                document_id=entry.document_id,
                entry_data=entry.entry_data,
                entry_name=entry.entry_name,
                entry_notes=entry.entry_notes
            )
            self.db.add(db_entry)
            self.db.commit()
            self.db.refresh(db_entry)
            db_logger.info(f"Created annotation entry: ID={db_entry.id}, project_id={db_entry.project_id}, document_id={db_entry.document_id}, user_id={db_entry.user_id}")
            return self._to_entity(db_entry)
        except IntegrityError as e:
            self.db.rollback()
            error_msg = str(e.orig) if hasattr(e, 'orig') else str(e)
            error_logger.error(f"Database integrity error creating annotation entry: {error_msg}", exc_info=True)
            raise DatabaseError(f"Failed to create annotation entry: Entry may already exist. {error_msg}")
        except Exception as e:
            self.db.rollback()
            error_logger.error(f"Error creating annotation entry: {str(e)}", exc_info=True)
            raise DatabaseError(f"Failed to create annotation entry: {str(e)}")
    
    async def get_by_id(self, entry_id: int) -> Optional[AnnotationEntry]:
        try:
            db_entry = self.db.query(AnnotationEntryModel).filter(AnnotationEntryModel.id == entry_id).first()
            return self._to_entity(db_entry) if db_entry else None
        except Exception as e:
            raise DatabaseError(f"Failed to get annotation entry: {str(e)}")
    
    async def get_by_project(self, project_id: int, user_id: int) -> List[AnnotationEntry]:
        try:
            db_entries = self.db.query(AnnotationEntryModel).filter(
                AnnotationEntryModel.project_id == project_id,
                AnnotationEntryModel.user_id == user_id
            ).order_by(AnnotationEntryModel.created_at.desc()).all()
            return [self._to_entity(entry) for entry in db_entries]
        except Exception as e:
            raise DatabaseError(f"Failed to get annotation entries by project: {str(e)}")
    
    async def get_by_document(self, document_id: int, user_id: int) -> List[AnnotationEntry]:
        try:
            db_entries = self.db.query(AnnotationEntryModel).filter(
                AnnotationEntryModel.document_id == document_id,
                AnnotationEntryModel.user_id == user_id
            ).order_by(AnnotationEntryModel.created_at.desc()).all()
            return [self._to_entity(entry) for entry in db_entries]
        except Exception as e:
            raise DatabaseError(f"Failed to get annotation entries by document: {str(e)}")
    
    async def update(self, entry: AnnotationEntry) -> AnnotationEntry:
        try:
            db_entry = self.db.query(AnnotationEntryModel).filter(AnnotationEntryModel.id == entry.id).first()
            if not db_entry:
                raise DatabaseError("Annotation entry not found")
            
            db_entry.entry_data = entry.entry_data
            db_entry.entry_name = entry.entry_name
            db_entry.entry_notes = entry.entry_notes
            
            self.db.commit()
            self.db.refresh(db_entry)
            return self._to_entity(db_entry)
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to update annotation entry: {str(e)}")
    
    async def delete(self, entry_id: int) -> bool:
        try:
            db_entry = self.db.query(AnnotationEntryModel).filter(AnnotationEntryModel.id == entry_id).first()
            if not db_entry:
                return False
            
            self.db.delete(db_entry)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to delete annotation entry: {str(e)}")
    
    async def delete_by_project_id(self, project_id: int) -> int:
        """Delete all annotation entries for a project"""
        try:
            deleted_count = self.db.query(AnnotationEntryModel).filter(
                AnnotationEntryModel.project_id == project_id
            ).delete()
            self.db.commit()
            return deleted_count
        except Exception as e:
            self.db.rollback()
            raise DatabaseError(f"Failed to delete annotation entries by project: {str(e)}")
    
    def _to_entity(self, db_entry: AnnotationEntryModel) -> AnnotationEntry:
        if not db_entry:
            return None
        
        return AnnotationEntry(
            id=db_entry.id,
            user_id=db_entry.user_id,
            project_id=db_entry.project_id,
            document_id=db_entry.document_id,
            entry_data=db_entry.entry_data,
            entry_name=db_entry.entry_name,
            entry_notes=db_entry.entry_notes,
            created_at=db_entry.created_at,
            updated_at=db_entry.updated_at
        )
