from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated, List, Optional
from datetime import datetime
import logging
from src.core.services.annotation_service import AnnotationService
from src.api.v1.dependencies import get_current_user, get_annotation_service
from src.core.domain.entities import User
from src.api.v1.schemas import (
    # Existing schemas
    ProjectCreateRequest, ProjectResponse, ProjectUpdateRequest,
    DocumentCreateRequest, DocumentResponse, DocumentUpdateRequest,
    AnnotationCreateRequest, AnnotationResponse, AnnotationUpdateRequest,
    QAPairCreateRequest, QAPairResponse, QAPairUpdateRequest,
    AutoSaveDataRequest, AutoSaveDataResponse,
    
    # Schemas
    AianoBlockCreateRequest, AianoBlockResponse, AianoBlockUpdateRequest,
    ProjectSessionCreateRequest, ProjectSessionResponse, ProjectSessionUpdateRequest,
    DocumentHighlightCreateRequest, DocumentHighlightResponse, DocumentHighlightUpdateRequest,
    CompleteProjectStateRequest, CompleteProjectStateResponse,
    ProjectExportRequest, ProjectExportResponse, ProjectImportRequest, ProjectImportResponse
)
from src.core.exceptions import (
    ProjectNotFoundError, DocumentNotFoundError, 
    AnnotationNotFoundError, QAPairNotFoundError, AuthorizationError, ConflictError
)

logger = logging.getLogger("app")
error_logger = logging.getLogger()  # Root logger goes to error.log
router = APIRouter(prefix="/projects", tags=["projects"])

# Project Management Endpoints
@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[AnnotationService, Depends(get_annotation_service)]
):
    """Create a new project"""
    try:
        project = await service.create_project(
            project_data=project_data,
            user_id=current_user.id
        )
        return ProjectResponse(
            id=project.id,
            name=project.name,
            description=project.description,
            config=project.config,
            created_at=project.created_at,
            updated_at=project.updated_at
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/", response_model=List[ProjectResponse])
async def list_projects(
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[AnnotationService, Depends(get_annotation_service)]
):
    """List all projects for the current user"""
    try:
        projects = await service.get_user_projects(current_user.id)
        return [
            ProjectResponse(
                id=project.id,
                name=project.name,
                description=project.description,
                config=project.config,
                created_at=project.created_at,
                updated_at=project.updated_at
            )
            for project in projects
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{project_id}", response_model=CompleteProjectStateResponse)
async def get_complete_project_state(
    project_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[AnnotationService, Depends(get_annotation_service)]
):
    """Get complete project state including all related data"""
    try:
        project_state = await service.get_complete_project_state(project_id, current_user.id)
        return project_state
    except ProjectNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
    except AuthorizationError:
        raise HTTPException(status_code=403, detail="Access denied")
    except Exception as e:
        error_logger.error(f"Error creating document in project {project_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    project_data: ProjectUpdateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[AnnotationService, Depends(get_annotation_service)]
):
    """Update a project"""
    try:
        project = await service.update_project(
            project_id=project_id,
            project_data=project_data,
            user_id=current_user.id
        )
        return ProjectResponse(
            id=project.id,
            name=project.name,
            description=project.description,
            config=project.config,
            created_at=project.created_at,
            updated_at=project.updated_at
        )
    except ProjectNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
    except AuthorizationError:
        raise HTTPException(status_code=403, detail="Access denied")
    except Exception as e:
        error_logger.error(f"Error creating document in project {project_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[AnnotationService, Depends(get_annotation_service)]
):
    """Delete a project and all related data"""
    try:
        logger.info(f"DELETE /api/v1/projects/{project_id} - Starting deletion for user {current_user.id}")
        await service.delete_project(project_id, current_user.id)
        logger.info(f"DELETE /api/v1/projects/{project_id} - Deletion completed successfully")
    except ProjectNotFoundError:
        logger.warning(f"DELETE /api/v1/projects/{project_id} - Project not found")
        raise HTTPException(status_code=404, detail="Project not found")
    except AuthorizationError:
        logger.warning(f"DELETE /api/v1/projects/{project_id} - Access denied")
        raise HTTPException(status_code=403, detail="Access denied")
    except Exception as e:
        logger.error(f"DELETE /api/v1/projects/{project_id} - Error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

# Document Management
@router.post("/{project_id}/documents", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document(
    project_id: int,
    document_data: DocumentCreateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[AnnotationService, Depends(get_annotation_service)]
):
    """Create a new document in a project"""
    try:
        document = await service.create_document(
            project_id=project_id,
            document_data=document_data,
            user_id=current_user.id
        )
        # Database logging is handled in repository layer
        return DocumentResponse(
            id=document.id,
            project_id=document.project_id,
            subject_id=document.subject_id,
            document_id=document.document_id,
            category=document.category,
            display_name=document.display_name,
            date=document.date,
            text=document.text,
            json_document=document.json_document,
            metadata=document.metadata,
            created_at=document.created_at,
            updated_at=document.updated_at
        )
    except ProjectNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
    except AuthorizationError:
        raise HTTPException(status_code=403, detail="Access denied")
    except ConflictError as e:
        error_logger.error(f"Conflict creating document in project {project_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=409, detail="Internal server error")
    except Exception as e:
        error_logger.error(f"Error creating document in project {project_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/{project_id}/documents/bulk", response_model=List[DocumentResponse], status_code=status.HTTP_201_CREATED)
async def create_documents_bulk(
    project_id: int,
    documents_data: List[DocumentCreateRequest],
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[AnnotationService, Depends(get_annotation_service)]
):
    """Create multiple documents in a project at once (bulk upload)"""
    try:
        documents = await service.create_documents_bulk(
            project_id=project_id,
            documents_data=documents_data,
            user_id=current_user.id
        )
        return [
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
            )
            for doc in documents
        ]
    except ProjectNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
    except AuthorizationError:
        raise HTTPException(status_code=403, detail="Access denied")
    except ConflictError as e:
        error_logger.error(f"Conflict creating documents in project {project_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=409, detail="Internal server error")
    except Exception as e:
        error_logger.error(f"Error creating documents in project {project_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{project_id}/documents", response_model=List[DocumentResponse])
async def list_documents(
    project_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[AnnotationService, Depends(get_annotation_service)]
):
    """List all documents in a project"""
    try:
        documents = await service.get_project_documents(project_id, current_user.id)
        return [
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
            )
            for doc in documents
        ]
    except ProjectNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
    except AuthorizationError:
        raise HTTPException(status_code=403, detail="Access denied")
    except Exception as e:
        error_logger.error(f"Error creating document in project {project_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{project_id}/documents/{document_id}", response_model=DocumentResponse)
async def get_document(
    project_id: int,
    document_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[AnnotationService, Depends(get_annotation_service)]
):
    """Get a specific document"""
    try:
        document = await service.get_document(project_id, document_id, current_user.id)
        return DocumentResponse(
            id=document.id,
            project_id=document.project_id,
            subject_id=document.subject_id,
            document_id=document.document_id,
            category=document.category,
            display_name=document.display_name,
            date=document.date,
            text=document.text,
            json_document=document.json_document,
            metadata=document.metadata,
            created_at=document.created_at,
            updated_at=document.updated_at
        )
    except ProjectNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
    except DocumentNotFoundError:
        raise HTTPException(status_code=404, detail="Document not found")
    except AuthorizationError:
        raise HTTPException(status_code=403, detail="Access denied")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/{project_id}/documents/{document_id}", response_model=DocumentResponse)
async def update_document(
    project_id: int,
    document_id: int,
    document_data: DocumentUpdateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[AnnotationService, Depends(get_annotation_service)]
):
    """Update a document"""
    try:
        document = await service.update_document(
            project_id=project_id,
            document_id=document_id,
            document_data=document_data,
            user_id=current_user.id
        )
        return DocumentResponse(
            id=document.id,
            project_id=document.project_id,
            subject_id=document.subject_id,
            document_id=document.document_id,
            category=document.category,
            display_name=document.display_name,
            date=document.date,
            text=document.text,
            json_document=document.json_document,
            metadata=document.metadata,
            created_at=document.created_at,
            updated_at=document.updated_at
        )
    except ProjectNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
    except DocumentNotFoundError:
        raise HTTPException(status_code=404, detail="Document not found")
    except AuthorizationError:
        raise HTTPException(status_code=403, detail="Access denied")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{project_id}/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    project_id: int,
    document_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[AnnotationService, Depends(get_annotation_service)]
):
    """Delete a document"""
    try:
        await service.delete_document(project_id, document_id, current_user.id)
    except ProjectNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
    except DocumentNotFoundError:
        raise HTTPException(status_code=404, detail="Document not found")
    except AuthorizationError:
        raise HTTPException(status_code=403, detail="Access denied")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{project_id}/documents", status_code=status.HTTP_200_OK)
async def delete_all_documents(
    project_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[AnnotationService, Depends(get_annotation_service)]
):
    """Delete all documents in a project"""
    try:
        deleted_count = await service.delete_all_documents(project_id, current_user.id)
        return {"deleted_count": deleted_count, "message": f"Deleted {deleted_count} documents"}
    except ProjectNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
    except AuthorizationError:
        raise HTTPException(status_code=403, detail="Access denied")
    except Exception as e:
        error_logger.error(f"Error deleting all documents for project {project_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

# AIANO Block Management
@router.post("/{project_id}/aiano-blocks", response_model=AianoBlockResponse, status_code=status.HTTP_201_CREATED)
async def create_aiano_block(
    project_id: int,
    block_data: AianoBlockCreateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[AnnotationService, Depends(get_annotation_service)]
):
    """Create a new AIANO block in a project"""
    try:
        block = await service.create_aiano_block(
            project_id=project_id,
            block_data=block_data,
            user_id=current_user.id
        )
        return AianoBlockResponse(
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
        )
    except ProjectNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
    except AuthorizationError:
        raise HTTPException(status_code=403, detail="Access denied")
    except Exception as e:
        error_logger.error(f"Error creating document in project {project_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{project_id}/aiano-blocks", response_model=List[AianoBlockResponse])
async def list_aiano_blocks(
    project_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[AnnotationService, Depends(get_annotation_service)]
):
    """List all AIANO blocks in a project"""
    try:
        blocks = await service.get_project_aiano_blocks(project_id, current_user.id)
        return [
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
            )
            for block in blocks
        ]
    except ProjectNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
    except AuthorizationError:
        raise HTTPException(status_code=403, detail="Access denied")
    except Exception as e:
        error_logger.error(f"Error creating document in project {project_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/{project_id}/aiano-blocks/{block_id}", response_model=AianoBlockResponse)
async def update_aiano_block(
    project_id: int,
    block_id: int,
    block_data: AianoBlockUpdateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[AnnotationService, Depends(get_annotation_service)]
):
    """Update an AIANO block"""
    try:
        block = await service.update_aiano_block(
            project_id=project_id,
            block_id=block_id,
            block_data=block_data,
            user_id=current_user.id
        )
        return AianoBlockResponse(
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
        )
    except ProjectNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
    except AuthorizationError:
        raise HTTPException(status_code=403, detail="Access denied")
    except Exception as e:
        error_logger.error(f"Error creating document in project {project_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{project_id}/aiano-blocks/{block_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_aiano_block(
    project_id: int,
    block_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[AnnotationService, Depends(get_annotation_service)]
):
    """Delete an AIANO block"""
    try:
        await service.delete_aiano_block(project_id, block_id, current_user.id)
    except ProjectNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
    except AuthorizationError:
        raise HTTPException(status_code=403, detail="Access denied")
    except Exception as e:
        error_logger.error(f"Error creating document in project {project_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

# Document Highlight Management
@router.post("/{project_id}/documents/{document_id}/highlights", response_model=DocumentHighlightResponse, status_code=status.HTTP_201_CREATED)
async def create_document_highlight(
    project_id: int,
    document_id: int,
    highlight_data: DocumentHighlightCreateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[AnnotationService, Depends(get_annotation_service)]
):
    """Create a new document highlight"""
    try:
        highlight = await service.create_document_highlight(
            project_id=project_id,
            document_id=document_id,
            highlight_data=highlight_data,
            user_id=current_user.id
        )
        return DocumentHighlightResponse(
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
        )
    except ProjectNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
    except DocumentNotFoundError:
        raise HTTPException(status_code=404, detail="Document not found")
    except AuthorizationError:
        raise HTTPException(status_code=403, detail="Access denied")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{project_id}/documents/{document_id}/highlights", response_model=List[DocumentHighlightResponse])
async def list_document_highlights(
    project_id: int,
    document_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[AnnotationService, Depends(get_annotation_service)]
):
    """List all highlights for a document"""
    try:
        highlights = await service.get_document_highlights(project_id, document_id, current_user.id)
        return [
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
            )
            for highlight in highlights
        ]
    except ProjectNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
    except DocumentNotFoundError:
        raise HTTPException(status_code=404, detail="Document not found")
    except AuthorizationError:
        raise HTTPException(status_code=403, detail="Access denied")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

# Project Session Management
@router.post("/{project_id}/sessions", response_model=ProjectSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_project_session(
    project_id: int,
    session_data: ProjectSessionCreateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[AnnotationService, Depends(get_annotation_service)]
):
    """Create a new project session"""
    try:
        session = await service.create_project_session(
            project_id=project_id,
            session_data=session_data,
            user_id=current_user.id
        )
        return ProjectSessionResponse(
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
    except ProjectNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
    except AuthorizationError:
        raise HTTPException(status_code=403, detail="Access denied")
    except Exception as e:
        error_logger.error(f"Error creating document in project {project_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{project_id}/sessions", response_model=List[ProjectSessionResponse])
async def list_project_sessions(
    project_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[AnnotationService, Depends(get_annotation_service)]
):
    """List all sessions for a project"""
    try:
        sessions = await service.get_project_sessions(project_id, current_user.id)
        return [
            ProjectSessionResponse(
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
            for session in sessions
        ]
    except ProjectNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
    except AuthorizationError:
        raise HTTPException(status_code=403, detail="Access denied")
    except Exception as e:
        error_logger.error(f"Error creating document in project {project_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{project_id}/sessions/active", response_model=ProjectSessionResponse)
async def get_active_project_session(
    project_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[AnnotationService, Depends(get_annotation_service)]
):
    """Get the active session for a project"""
    try:
        session = await service.get_active_project_session(project_id, current_user.id)
        if not session:
            raise HTTPException(status_code=404, detail="No active session found")
        
        return ProjectSessionResponse(
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
    except ProjectNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
    except AuthorizationError:
        raise HTTPException(status_code=403, detail="Access denied")
    except Exception as e:
        error_logger.error(f"Error creating document in project {project_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

# Bulk Operations
@router.post("/{project_id}/export", response_model=ProjectExportResponse)
async def export_project(
    project_id: int,
    export_request: ProjectExportRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[AnnotationService, Depends(get_annotation_service)]
):
    """Export complete project data"""
    try:
        export_data = await service.export_project(
            project_id=project_id,
            export_request=export_request,
            user_id=current_user.id
        )
        return export_data
    except ProjectNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
    except AuthorizationError:
        raise HTTPException(status_code=403, detail="Access denied")
    except Exception as e:
        error_logger.error(f"Error creating document in project {project_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/import", response_model=ProjectImportResponse, status_code=status.HTTP_201_CREATED)
async def import_project(
    import_request: ProjectImportRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[AnnotationService, Depends(get_annotation_service)]
):
    """Import complete project data"""
    try:
        import_result = await service.import_project(
            import_request=import_request,
            user_id=current_user.id
        )
        return import_result
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
