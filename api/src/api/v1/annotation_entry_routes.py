from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated, List
import logging
from src.core.services.annotation_service import AnnotationService
from src.api.v1.dependencies import get_current_user, get_annotation_service
from src.core.domain.entities import User
from src.api.v1.schemas import (
    AnnotationEntryCreateRequest,
    AnnotationEntryUpdateRequest,
    AnnotationEntryResponse
)
from src.core.exceptions import ProjectNotFoundError, AuthorizationError

logger = logging.getLogger("app")
error_logger = logging.getLogger()  # Root logger goes to error.log
router = APIRouter(prefix="/projects", tags=["annotation-entries"])

# Annotation Entry Management
@router.post("/{project_id}/entries", response_model=AnnotationEntryResponse, status_code=status.HTTP_201_CREATED)
async def create_annotation_entry(
    project_id: int,
    entry_data: AnnotationEntryCreateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[AnnotationService, Depends(get_annotation_service)]
):
    """Create a new annotation entry"""
    try:
        entry = await service.create_annotation_entry(
            project_id=project_id,
            entry_data=entry_data,
            user_id=current_user.id
        )
        # Database logging is handled in repository layer
        return AnnotationEntryResponse(
            id=entry.id,
            user_id=entry.user_id,
            project_id=entry.project_id,
            document_id=entry.document_id,
            entry_data=entry.entry_data,
            entry_name=entry.entry_name,
            entry_notes=entry.entry_notes,
            created_at=entry.created_at,
            updated_at=entry.updated_at
        )
    except ProjectNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
    except AuthorizationError:
        raise HTTPException(status_code=403, detail="Access denied")
    except Exception as e:
        error_logger.error(f"Error creating annotation entry in project {project_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{project_id}/entries", response_model=List[AnnotationEntryResponse])
async def list_annotation_entries(
    project_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[AnnotationService, Depends(get_annotation_service)]
):
    """List all annotation entries for a project"""
    try:
        entries = await service.get_project_annotation_entries(project_id, current_user.id)
        return [
            AnnotationEntryResponse(
                id=entry.id,
                user_id=entry.user_id,
                project_id=entry.project_id,
                document_id=entry.document_id,
                entry_data=entry.entry_data,
                entry_name=entry.entry_name,
                entry_notes=entry.entry_notes,
                created_at=entry.created_at,
                updated_at=entry.updated_at
            )
            for entry in entries
        ]
    except ProjectNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
    except AuthorizationError:
        raise HTTPException(status_code=403, detail="Access denied")
    except Exception as e:
        error_logger.error(f"Error creating annotation entry in project {project_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{project_id}/entries/{entry_id}", response_model=AnnotationEntryResponse)
async def get_annotation_entry(
    project_id: int,
    entry_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[AnnotationService, Depends(get_annotation_service)]
):
    """Get a specific annotation entry"""
    try:
        entry = await service.get_annotation_entry(entry_id, current_user.id)
        if not entry:
            raise HTTPException(status_code=404, detail="Annotation entry not found")
        return AnnotationEntryResponse(
            id=entry.id,
            user_id=entry.user_id,
            project_id=entry.project_id,
            document_id=entry.document_id,
            entry_data=entry.entry_data,
            entry_name=entry.entry_name,
            entry_notes=entry.entry_notes,
            created_at=entry.created_at,
            updated_at=entry.updated_at
        )
    except ProjectNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
    except AuthorizationError:
        raise HTTPException(status_code=403, detail="Access denied")
    except Exception as e:
        error_logger.error(f"Error creating annotation entry in project {project_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{project_id}/entries/{entry_id}")
async def delete_annotation_entry(
    project_id: int,
    entry_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[AnnotationService, Depends(get_annotation_service)]
):
    """Delete an annotation entry"""
    try:
        await service.delete_annotation_entry(entry_id, current_user.id)
        return {"message": "Annotation entry deleted successfully"}
    except ProjectNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
    except AuthorizationError:
        raise HTTPException(status_code=403, detail="Access denied")
    except Exception as e:
        error_logger.error(f"Error creating annotation entry in project {project_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{project_id}/entries")
async def delete_all_annotation_entries(
    project_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[AnnotationService, Depends(get_annotation_service)]
):
    """Delete all annotation entries in a project"""
    try:
        deleted_count = await service.delete_all_annotation_entries(project_id, current_user.id)
        return {"deleted_count": deleted_count, "message": f"Deleted {deleted_count} annotation entries"}
    except ProjectNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
    except AuthorizationError:
        raise HTTPException(status_code=403, detail="Access denied")
    except Exception as e:
        error_logger.error(f"Error deleting all annotation entries in project {project_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")
