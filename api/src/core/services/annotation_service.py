from typing import List, Optional, Dict, Any
from datetime import datetime
import logging
from src.core.domain.entities import (
    Project, Document, Annotation, QAPair, AutoSaveData,
    AianoBlock, ProjectSession, DocumentHighlight, AnnotationEntry
)
from src.core.domain.repositories import (
    ProjectRepository, DocumentRepository, AnnotationRepository, 
    QAPairRepository, AutoSaveRepository, AianoBlockRepository,
    ProjectSessionRepository, DocumentHighlightRepository, AnnotationEntryRepository
)
from src.core.exceptions import (
    ProjectNotFoundError, DocumentNotFoundError, 
    AnnotationNotFoundError, QAPairNotFoundError, AuthorizationError, ConflictError
)
from src.api.v1.schemas import (
    ProjectCreateRequest, ProjectUpdateRequest, ProjectResponse,
    DocumentCreateRequest, DocumentUpdateRequest,
    AianoBlockCreateRequest, AianoBlockUpdateRequest,
    ProjectSessionCreateRequest, ProjectSessionUpdateRequest,
    DocumentHighlightCreateRequest, DocumentHighlightUpdateRequest,
    CompleteProjectStateResponse, ProjectExportRequest, ProjectExportResponse,
    ProjectImportRequest, ProjectImportResponse,
    AnnotationEntryCreateRequest, AnnotationEntryUpdateRequest
)

logger = logging.getLogger("app")

class AnnotationService:
    def __init__(
        self,
        project_repository: ProjectRepository,
        document_repository: DocumentRepository,
        annotation_repository: AnnotationRepository,
        qa_pair_repository: QAPairRepository,
        auto_save_repository: AutoSaveRepository,
        aiano_block_repository: AianoBlockRepository,
        project_session_repository: ProjectSessionRepository,
        document_highlight_repository: DocumentHighlightRepository,
        annotation_entry_repository: AnnotationEntryRepository
    ):
        self.project_repository = project_repository
        self.document_repository = document_repository
        self.annotation_repository = annotation_repository
        self.qa_pair_repository = qa_pair_repository
        self.auto_save_repository = auto_save_repository
        self.aiano_block_repository = aiano_block_repository
        self.project_session_repository = project_session_repository
        self.document_highlight_repository = document_highlight_repository
        self.annotation_entry_repository = annotation_entry_repository

    async def _ensure_user_has_project_access(self, project_id: int, user_id: int) -> Project:
        """Ensure user has access to project, raise exception if not"""
        has_access = await self.project_repository.user_has_access(project_id, user_id)
        if not has_access:
            raise AuthorizationError("User does not have access to this project")
        
        project = await self.project_repository.get_by_id(project_id)
        if not project:
            raise ProjectNotFoundError("Project not found")
        
        return project

    # Project Management
    async def create_project(self, project_data: ProjectCreateRequest, user_id: int) -> Project:
        """Create a new project"""
        project_entity = Project(
            name=project_data.name,
            description=project_data.description,
            config=project_data.config
        )
        
        created_project = await self.project_repository.create(project_entity)
        await self.project_repository.add_user_to_project(created_project.id, user_id)
        return created_project

    async def get_user_projects(self, user_id: int) -> List[Project]:
        """Get all projects for a user"""
        return await self.project_repository.get_by_user_id(user_id)

    async def get_project(self, project_id: int, user_id: int) -> Project:
        """Get a specific project"""
        return await self._ensure_user_has_project_access(project_id, user_id)

    async def update_project(self, project_id: int, project_data: ProjectUpdateRequest, user_id: int) -> Project:
        """Update a project"""
        project = await self._ensure_user_has_project_access(project_id, user_id)
        
        if project_data.name is not None:
            project.name = project_data.name
        if project_data.description is not None:
            project.description = project_data.description
        if project_data.config is not None:
            project.config = project_data.config
        
        return await self.project_repository.update(project)

    async def delete_project(self, project_id: int, user_id: int) -> bool:
        """Delete a project and all related data"""
        try:
            await self._ensure_user_has_project_access(project_id, user_id)
            
            logger.info(f"Starting deletion of project {project_id}")
            
            # Delete all related data in the correct order (child records first)
            # 1. Delete AIANO blocks
            logger.info(f"Deleting AIANO blocks for project {project_id}")
            await self.aiano_block_repository.delete_by_project_id(project_id)
            logger.info(f"Successfully deleted AIANO blocks for project {project_id}")
            
            # 2. Delete annotation entries
            logger.info(f"Deleting annotation entries for project {project_id}")
            await self.annotation_entry_repository.delete_by_project_id(project_id)
            logger.info(f"Successfully deleted annotation entries for project {project_id}")
            
            # 3. Delete project sessions (depends on documents, so delete first)
            logger.info(f"Deleting project sessions for project {project_id}")
            await self.project_session_repository.delete_by_project_id(project_id)
            logger.info(f"Successfully deleted project sessions for project {project_id}")
            
            # 4. Delete document highlights (depends on documents)
            logger.info(f"Deleting document highlights for project {project_id}")
            await self.document_highlight_repository.delete_by_project_id(project_id)
            logger.info(f"Successfully deleted document highlights for project {project_id}")
            
            # 5. Delete annotations (depends on documents)
            logger.info(f"Deleting annotations for project {project_id}")
            await self.annotation_repository.delete_by_project_id(project_id, user_id)
            logger.info(f"Successfully deleted annotations for project {project_id}")
            
            # 6. Delete documents (after all dependent records are deleted)
            logger.info(f"Deleting documents for project {project_id}")
            await self.document_repository.delete_by_project_id(project_id)
            logger.info(f"Successfully deleted documents for project {project_id}")
            
            # 7. Finally delete the project
            logger.info(f"Deleting project {project_id}")
            result = await self.project_repository.delete(project_id)
            logger.info(f"Project deletion completed successfully: {result}")
            return result
            
        except Exception as e:
            logger.error(f"Error deleting project {project_id}: {str(e)}", exc_info=True)
            raise e

    async def get_complete_project_state(self, project_id: int, user_id: int) -> CompleteProjectStateResponse:
        """Get complete project state including all related data"""
        try:
            project = await self._ensure_user_has_project_access(project_id, user_id)
            
            # Get all related data
            documents = await self.document_repository.get_by_project_id(project_id)
            aiano_blocks = await self.aiano_block_repository.get_by_project_id(project_id, user_id)
            highlights = await self.document_highlight_repository.get_by_project_id(project_id, user_id)
            active_session = await self.project_session_repository.get_active_session(project_id, user_id)
            
            # Convert entities to response models
            from src.api.v1.schemas import (
                ProjectResponse, DocumentResponse, AianoBlockResponse,
                DocumentHighlightResponse, ProjectSessionResponse
            )
            
            return CompleteProjectStateResponse(
            project=ProjectResponse(
                id=project.id,
                name=project.name,
                description=project.description,
                config=project.config,
                created_at=project.created_at,
                updated_at=project.updated_at
            ),
            documents=[
                DocumentResponse(
                    id=doc.id,
                    project_id=doc.project_id,
                    subject_id=doc.subject_id,
                    document_id=doc.document_id,
                    category=doc.category,
                    display_name=doc.display_name,
                    date=doc.date,
                    text=doc.text,
                    json_document=doc.json_document,
                    metadata=doc.metadata,  # Document entity has metadata property
                    created_at=doc.created_at,
                    updated_at=doc.updated_at
                ) for doc in documents
            ],
            aiano_blocks=[
                AianoBlockResponse(
                    id=block.id,
                    project_id=block.project_id,
                    user_id=block.user_id,
                    block_type=block.block_type,
                    title=block.title,
                    description=block.description,
                    input_sources=block.input_sources,
                    block_config=block.block_config,
                    block_value=block.block_value,
                    is_generated=block.is_generated,
                    created_at=block.created_at,
                    updated_at=block.updated_at
                ) for block in aiano_blocks
            ],
            highlights=[
                DocumentHighlightResponse(
                    id=highlight.id,
                    document_id=highlight.document_id,
                    user_id=highlight.user_id,
                    project_id=highlight.project_id,
                    text_span=highlight.text_span,
                    relevancy_level_id=highlight.relevancy_level_id,
                    highlight_type=highlight.highlight_type,
                    highlight_metadata=highlight.highlight_metadata,
                    created_at=highlight.created_at,
                    updated_at=highlight.updated_at
                ) for highlight in highlights
            ],
            session=ProjectSessionResponse(
                id=active_session.id,
                project_id=active_session.project_id,
                user_id=active_session.user_id,
                session_name=active_session.session_name,
                selected_document_id=active_session.selected_document_id,
                active_highlights=active_session.active_highlights,
                view_state=active_session.view_state,
                created_at=active_session.created_at,
                updated_at=active_session.updated_at
            ) if active_session else None
            )
        except Exception as e:
            logger.error(f"Error in get_complete_project_state for project {project_id}: {str(e)}", exc_info=True)
            raise

    # Document Management
    async def create_document(self, project_id: int, document_data: DocumentCreateRequest, user_id: int) -> Document:
        """Create a new document in a project"""
        await self._ensure_user_has_project_access(project_id, user_id)
        
        # Check for duplicate document_id in the project
        existing_documents = await self.document_repository.get_by_project_id(project_id)
        duplicate = next(
            (doc for doc in existing_documents if doc.document_id == document_data.document_id),
            None
        )
        
        if duplicate:
            error_logger = logging.getLogger()
            error_logger.error(
                f"Duplicate document detected - project_id={project_id}, "
                f"document_id={document_data.document_id}, user_id={user_id}",
                exc_info=True
            )
            raise ConflictError(f"Document with ID '{document_data.document_id}' already exists in this project")
        
        document_entity = Document(
            project_id=project_id,
            subject_id=document_data.subject_id,
            document_id=document_data.document_id,
            category=document_data.category,
            display_name=document_data.display_name,
            date=document_data.date,
            text=document_data.text,
            json_document=document_data.json_document,
            metadata=document_data.metadata
        )
        
        return await self.document_repository.create(document_entity)

    async def create_documents_bulk(self, project_id: int, documents_data: List[DocumentCreateRequest], user_id: int) -> List[Document]:
        """Create multiple documents in a project at once (bulk upload)"""
        await self._ensure_user_has_project_access(project_id, user_id)
        
        if not documents_data:
            return []
        
        # Get existing documents to check for duplicates
        existing_documents = await self.document_repository.get_by_project_id(project_id)
        existing_doc_ids = {doc.document_id for doc in existing_documents}
        
        # Filter out duplicates and create document entities
        documents_to_create = []
        skipped_duplicates = []
        
        for doc_data in documents_data:
            if doc_data.document_id in existing_doc_ids:
                skipped_duplicates.append(doc_data.document_id)
                continue
            
            document_entity = Document(
                project_id=project_id,
                subject_id=doc_data.subject_id,
                document_id=doc_data.document_id,
                category=doc_data.category,
                display_name=doc_data.display_name,
                date=doc_data.date,
                text=doc_data.text,
                json_document=doc_data.json_document,
                metadata=doc_data.metadata
            )
            documents_to_create.append(document_entity)
            existing_doc_ids.add(doc_data.document_id)  # Add to set to catch duplicates within the batch
        
        # Log skipped duplicates
        if skipped_duplicates:
            error_logger = logging.getLogger()
            error_logger.warning(
                f"Skipped {len(skipped_duplicates)} duplicate documents in project {project_id}: {skipped_duplicates[:10]}"
            )
        
        # Bulk create documents
        if documents_to_create:
            return await self.document_repository.create_bulk(documents_to_create)
        
        return []

    async def get_project_documents(self, project_id: int, user_id: int) -> List[Document]:
        """Get all documents in a project"""
        await self._ensure_user_has_project_access(project_id, user_id)
        return await self.document_repository.get_by_project_and_user(project_id, user_id)

    async def get_document(self, project_id: int, document_id: int, user_id: int) -> Document:
        """Get a specific document"""
        await self._ensure_user_has_project_access(project_id, user_id)
        
        document = await self.document_repository.get_by_id(document_id)
        if not document or document.project_id != project_id:
            raise DocumentNotFoundError("Document not found or does not belong to project")
        
        return document

    async def update_document(self, project_id: int, document_id: int, document_data: DocumentUpdateRequest, user_id: int) -> Document:
        """Update a document"""
        document = await self.get_document(project_id, document_id, user_id)
        
        if document_data.subject_id is not None:
            document.subject_id = document_data.subject_id
        if document_data.document_id is not None:
            document.document_id = document_data.document_id
        if document_data.category is not None:
            document.category = document_data.category
        if document_data.display_name is not None:
            document.display_name = document_data.display_name
        if document_data.date is not None:
            document.date = document_data.date
        if document_data.text is not None:
            document.text = document_data.text
        if document_data.json_document is not None:
            document.json_document = document_data.json_document
        if document_data.metadata is not None:
            document.metadata = document_data.metadata
        
        return await self.document_repository.update(document)

    async def delete_document(self, project_id: int, document_id: int, user_id: int) -> bool:
        """Delete a document"""
        document = await self.get_document(project_id, document_id, user_id)
        
        # Delete related highlights first
        await self.document_highlight_repository.delete_by_document_id(document_id)
        
        return await self.document_repository.delete(document_id)

    async def delete_all_documents(self, project_id: int, user_id: int) -> int:
        """Delete all documents in a project"""
        await self._ensure_user_has_project_access(project_id, user_id)
        
        # Delete related data first
        logger.info(f"Deleting all document highlights for project {project_id}")
        await self.document_highlight_repository.delete_by_project_id(project_id)
        
        # Delete all documents
        logger.info(f"Deleting all documents for project {project_id}")
        deleted_count = await self.document_repository.delete_by_project_id(project_id)
        logger.info(f"Deleted {deleted_count} documents from project {project_id}")
        
        return deleted_count

    # AIANO Block Management
    async def create_aiano_block(self, project_id: int, block_data: AianoBlockCreateRequest, user_id: int) -> AianoBlock:
        """Create a new AIANO block in a project"""
        await self._ensure_user_has_project_access(project_id, user_id)
        
        block_entity = AianoBlock(
            project_id=project_id,
            user_id=user_id,
            block_type=block_data.block_type,
            title=block_data.title,
            description=block_data.description,
            input_sources=block_data.input_sources,
            block_config=block_data.block_config,
            block_value=block_data.block_value
        )
        
        return await self.aiano_block_repository.create(block_entity)

    async def get_project_aiano_blocks(self, project_id: int, user_id: int) -> List[AianoBlock]:
        """Get all AIANO blocks for a project"""
        await self._ensure_user_has_project_access(project_id, user_id)
        return await self.aiano_block_repository.get_by_project_id(project_id, user_id)

    async def update_aiano_block(self, project_id: int, block_id: int, block_data: AianoBlockUpdateRequest, user_id: int) -> AianoBlock:
        """Update an AIANO block"""
        await self._ensure_user_has_project_access(project_id, user_id)
        
        block = await self.aiano_block_repository.get_by_id(block_id)
        if not block or block.project_id != project_id or block.user_id != user_id:
            raise AuthorizationError("AIANO block not found or access denied")
        
        if block_data.title is not None:
            block.title = block_data.title
        if block_data.description is not None:
            block.description = block_data.description
        if block_data.input_sources is not None:
            block.input_sources = block_data.input_sources
        if block_data.block_config is not None:
            block.block_config = block_data.block_config
        if block_data.block_value is not None:
            block.block_value = block_data.block_value
        if block_data.is_generated is not None:
            block.is_generated = block_data.is_generated
        
        return await self.aiano_block_repository.update(block)

    async def delete_aiano_block(self, project_id: int, block_id: int, user_id: int) -> bool:
        """Delete an AIANO block"""
        await self._ensure_user_has_project_access(project_id, user_id)
        
        block = await self.aiano_block_repository.get_by_id(block_id)
        if not block or block.project_id != project_id or block.user_id != user_id:
            raise AuthorizationError("AIANO block not found or access denied")
        
        return await self.aiano_block_repository.delete(block_id)

    # Document Highlight Management
    async def create_document_highlight(self, project_id: int, document_id: int, highlight_data: DocumentHighlightCreateRequest, user_id: int) -> DocumentHighlight:
        """Create a new document highlight"""
        await self._ensure_user_has_project_access(project_id, user_id)
        
        # Verify document belongs to project
        document = await self.document_repository.get_by_id(document_id)
        if not document or document.project_id != project_id:
            raise DocumentNotFoundError("Document not found or does not belong to project")
        
        highlight_entity = DocumentHighlight(
            document_id=document_id,
            user_id=user_id,
            project_id=project_id,
            text_span=highlight_data.text_span,
            relevancy_level_id=highlight_data.relevancy_level_id,
            highlight_type=highlight_data.highlight_type,
            highlight_metadata=highlight_data.highlight_metadata
        )
        
        return await self.document_highlight_repository.create(highlight_entity)

    async def get_document_highlights(self, project_id: int, document_id: int, user_id: int) -> List[DocumentHighlight]:
        """Get all highlights for a document"""
        await self._ensure_user_has_project_access(project_id, user_id)
        
        # Verify document belongs to project
        document = await self.document_repository.get_by_id(document_id)
        if not document or document.project_id != project_id:
            raise DocumentNotFoundError("Document not found or does not belong to project")
        
        return await self.document_highlight_repository.get_by_document_id(document_id, user_id)

    # Project Session Management
    async def create_project_session(self, project_id: int, session_data: ProjectSessionCreateRequest, user_id: int) -> ProjectSession:
        """Create a new project session"""
        await self._ensure_user_has_project_access(project_id, user_id)
        
        session_entity = ProjectSession(
            project_id=project_id,
            user_id=user_id,
            session_name=session_data.session_name,
            selected_document_id=session_data.selected_document_id,
            active_highlights=session_data.active_highlights,
            view_state=session_data.view_state
        )
        
        return await self.project_session_repository.create(session_entity)

    async def get_project_sessions(self, project_id: int, user_id: int) -> List[ProjectSession]:
        """Get all sessions for a project"""
        await self._ensure_user_has_project_access(project_id, user_id)
        return await self.project_session_repository.get_by_project_id(project_id, user_id)

    async def get_active_project_session(self, project_id: int, user_id: int) -> Optional[ProjectSession]:
        """Get the active session for a project"""
        await self._ensure_user_has_project_access(project_id, user_id)
        return await self.project_session_repository.get_active_session(project_id, user_id)

    # Bulk Operations
    async def export_project(self, project_id: int, export_request: ProjectExportRequest, user_id: int) -> ProjectExportResponse:
        """Export complete project data"""
        project = await self._ensure_user_has_project_access(project_id, user_id)
        
        # Convert project to response model
        from src.api.v1.schemas import ProjectResponse
        project_response = ProjectResponse(
            id=project.id,
            name=project.name,
            description=project.description,
            config=project.config,
            created_at=project.created_at,
            updated_at=project.updated_at
        )
        
        export_data = ProjectExportResponse(
            project=project_response,
            export_timestamp=datetime.utcnow()
        )
        
        if export_request.include_documents:
            documents = await self.document_repository.get_by_project_id(project_id)
            from src.api.v1.schemas import DocumentResponse
            export_data.documents = [
                DocumentResponse(
                    id=doc.id,
                    project_id=doc.project_id,
                    subject_id=doc.subject_id,
                    document_id=doc.document_id,
                    category=doc.category,
                    display_name=doc.display_name,
                    date=doc.date,
                    text=doc.text,
                    json_document=doc.json_document,
                    metadata=doc.metadata,
                    created_at=doc.created_at,
                    updated_at=doc.updated_at
                ) for doc in documents
            ]
        
        if export_request.include_annotations:
            annotations = await self.annotation_repository.get_by_project_id(project_id, user_id)
            from src.api.v1.schemas import AnnotationResponse
            export_data.annotations = [
                AnnotationResponse(
                    id=ann.id,
                    project_id=ann.project_id,
                    document_id=ann.document_id,
                    user_id=ann.user_id,
                    annotation_type=ann.annotation_type,
                    text_span=ann.text_span,
                    annotation_data=ann.annotation_data,
                    created_at=ann.created_at,
                    updated_at=ann.updated_at
                ) for ann in annotations
            ]
            
            # Also export annotation entries (annotation history)
            annotation_entries = await self.annotation_entry_repository.get_by_project(project_id, user_id)
            from src.api.v1.schemas import AnnotationEntryResponse
            export_data.annotation_entries = [
                AnnotationEntryResponse(
                    id=entry.id,
                    project_id=entry.project_id,
                    user_id=entry.user_id,
                    document_id=entry.document_id,
                    entry_data=entry.entry_data or {},
                    entry_name=entry.entry_name,
                    entry_notes=entry.entry_notes,
                    created_at=entry.created_at,
                    updated_at=entry.updated_at
                ) for entry in annotation_entries
            ]
        
        if export_request.include_highlights:
            highlights = await self.document_highlight_repository.get_by_project_id(project_id, user_id)
            from src.api.v1.schemas import DocumentHighlightResponse
            export_data.highlights = [
                DocumentHighlightResponse(
                    id=highlight.id,
                    document_id=highlight.document_id,
                    user_id=highlight.user_id,
                    project_id=highlight.project_id,
                    text_span=highlight.text_span,
                    relevancy_level_id=highlight.relevancy_level_id,
                    highlight_type=highlight.highlight_type,
                    highlight_metadata=highlight.highlight_metadata,
                    created_at=highlight.created_at,
                    updated_at=highlight.updated_at
                ) for highlight in highlights
            ]
        
        if export_request.include_aiano_blocks:
            aiano_blocks = await self.aiano_block_repository.get_by_project_id(project_id, user_id)
            from src.api.v1.schemas import AianoBlockResponse
            export_data.aiano_blocks = [
                AianoBlockResponse(
                    id=block.id,
                    project_id=block.project_id,
                    user_id=block.user_id,
                    block_type=block.block_type,
                    title=block.title,
                    description=block.description,
                    input_sources=block.input_sources,
                    block_config=block.block_config,
                    block_value=block.block_value,
                    is_generated=block.is_generated,
                    created_at=block.created_at,
                    updated_at=block.updated_at
                ) for block in aiano_blocks
            ]
        
        if export_request.include_session:
            session = await self.project_session_repository.get_active_session(project_id, user_id)
            if session:
                from src.api.v1.schemas import ProjectSessionResponse
                export_data.session = ProjectSessionResponse(
                    id=session.id,
                    project_id=session.project_id,
                    user_id=session.user_id,
                    session_name=session.session_name,
                    selected_document_id=session.selected_document_id,
                    active_highlights=session.active_highlights,
                    view_state=session.view_state,
                    created_at=session.created_at,
                    updated_at=session.updated_at
                )
        
        return export_data

    async def import_project(self, import_request: ProjectImportRequest, user_id: int) -> ProjectImportResponse:
        """Import complete project data"""
        project_data = import_request.project_data
        imported_items = {}
        
        # Create project
        project = await self.create_project(
            ProjectCreateRequest(
                name=project_data.project_config.get("name", "Imported Project"),
                description=project_data.project_config.get("description"),
                config=project_data.project_config
            ),
            user_id
        )
        
        # Import documents
        if project_data.documents:
            for doc_data in project_data.documents:
                doc_entity = Document(
                    project_id=project.id,
                    subject_id=doc_data.subject_id,
                    document_id=doc_data.document_id,
                    category=doc_data.category,
                    display_name=doc_data.display_name,
                    date=doc_data.date,
                    text=doc_data.text,
                    metadata=doc_data.metadata
                )
                await self.document_repository.create(doc_entity)
            imported_items["documents"] = len(project_data.documents)
        
        # Import AIANO blocks
        if project_data.aiano_blocks:
            for block_data in project_data.aiano_blocks:
                block_entity = AianoBlock(
                    project_id=project.id,
                    user_id=user_id,
                    block_type=block_data.block_type,
                    title=block_data.title,
                    description=block_data.description,
                    input_sources=block_data.input_sources,
                    block_config=block_data.block_config,
                    block_value=block_data.block_value
                )
                await self.aiano_block_repository.create(block_entity)
            imported_items["aiano_blocks"] = len(project_data.aiano_blocks)
        
        # Import highlights
        if project_data.highlights:
            for highlight_data in project_data.highlights:
                highlight_entity = DocumentHighlight(
                    document_id=highlight_data.document_id,
                    user_id=user_id,
                    project_id=project.id,
                    text_span=highlight_data.text_span,
                    relevancy_level_id=highlight_data.relevancy_level_id,
                    highlight_type=highlight_data.highlight_type,
                    highlight_metadata=highlight_data.highlight_metadata
                )
                await self.document_highlight_repository.create(highlight_entity)
            imported_items["highlights"] = len(project_data.highlights)
        
        # Import annotation entries
        if project_data.annotation_entries:
            # Get the first document ID as a placeholder for annotation entries
            first_document_id = None
            if project_data.documents:
                first_document = await self.document_repository.get_by_project_id(project.id)
                if first_document:
                    first_document_id = first_document[0].id
            
            for entry_data in project_data.annotation_entries:
                # Use first document ID as placeholder, or 0 if no documents
                document_id = first_document_id if first_document_id else 0
                
                entry_entity = AnnotationEntry(
                    project_id=project.id,
                    user_id=user_id,
                    document_id=document_id,
                    entry_data=entry_data.entry_data,
                    entry_name=entry_data.entry_name,
                    entry_notes=entry_data.entry_notes
                )
                await self.annotation_entry_repository.create(entry_entity)
            imported_items["annotation_entries"] = len(project_data.annotation_entries)
        
        # Import session
        if project_data.session:
            session_entity = ProjectSession(
                project_id=project.id,
                user_id=user_id,
                session_name=project_data.session.session_name,
                selected_document_id=project_data.session.selected_document_id,
                active_highlights=project_data.session.active_highlights,
                view_state=project_data.session.view_state
            )
            await self.project_session_repository.create(session_entity)
            imported_items["sessions"] = 1
        
        # Convert project entity to ProjectResponse
        project_response = ProjectResponse(
            id=project.id,
            name=project.name,
            description=project.description,
            config=project.config,
            created_at=project.created_at,
            updated_at=project.updated_at
        )
        
        return ProjectImportResponse(
            project=project_response,
            imported_items=imported_items,
            warnings=[],
            import_timestamp=datetime.utcnow()
        )

    # Annotation Entry Management
    async def create_annotation_entry(self, project_id: int, entry_data: AnnotationEntryCreateRequest, user_id: int) -> AnnotationEntry:
        """Create a new annotation entry"""
        await self._ensure_user_has_project_access(project_id, user_id)
        
        # Verify document exists in project
        document = await self.document_repository.get_by_id(entry_data.document_id)
        if not document or document.project_id != project_id:
            raise DocumentNotFoundError(f"Document {entry_data.document_id} not found in project {project_id}")
        
        entry_entity = AnnotationEntry(
            user_id=user_id,
            project_id=project_id,
            document_id=entry_data.document_id,
            entry_data=entry_data.entry_data,
            entry_name=entry_data.entry_name,
            entry_notes=entry_data.entry_notes
        )
        
        return await self.annotation_entry_repository.create(entry_entity)

    async def get_project_annotation_entries(self, project_id: int, user_id: int) -> List[AnnotationEntry]:
        """Get all annotation entries for a project"""
        await self._ensure_user_has_project_access(project_id, user_id)
        return await self.annotation_entry_repository.get_by_project(project_id, user_id)

    async def get_annotation_entry(self, entry_id: int, user_id: int) -> Optional[AnnotationEntry]:
        """Get a specific annotation entry"""
        entry = await self.annotation_entry_repository.get_by_id(entry_id)
        if entry and entry.user_id == user_id:
            return entry
        return None

    async def delete_annotation_entry(self, entry_id: int, user_id: int) -> bool:
        """Delete an annotation entry"""
        entry = await self.annotation_entry_repository.get_by_id(entry_id)
        if not entry or entry.user_id != user_id:
            return False
        
        return await self.annotation_entry_repository.delete(entry_id)

    async def delete_all_annotation_entries(self, project_id: int, user_id: int) -> int:
        """Delete all annotation entries in a project"""
        await self._ensure_user_has_project_access(project_id, user_id)
        
        logger.info(f"Deleting all annotation entries for project {project_id}")
        deleted_count = await self.annotation_entry_repository.delete_by_project_id(project_id)
        logger.info(f"Deleted {deleted_count} annotation entries from project {project_id}")
        
        return deleted_count
