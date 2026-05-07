from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
import logging
from src.core.services.auth_service import AuthService
from src.api.v1.dependencies import get_auth_service, get_current_user
from src.api.v1.schemas import (
    UserCreateRequest, UserResponse, TokenResponse, 
    RefreshTokenRequest, LoginRequest
)
from src.core.exceptions import AuthenticationError, ConflictError, DatabaseError
from src.core.domain.entities import User

logger = logging.getLogger("app")
error_logger = logging.getLogger()  # Root logger goes to error.log

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreateRequest,
    auth_service: Annotated[AuthService, Depends(get_auth_service)]
):
    """Register a new user"""
    try:
        user = await auth_service.register_user(
            email=user_data.email,
            username=user_data.username,
            password=user_data.password
        )
        # Database logging is handled in repository layer
        logger.info(f"User registered successfully: {user.email} (ID: {user.id})")
        return UserResponse(
            id=user.id,
            email=user.email,
            username=user.username,
            is_active=user.is_active,
            is_verified=user.is_verified,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
    except ConflictError as e:
        error_logger.error(f"Conflict during registration: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email or username already exists."
        )
    except AuthenticationError as e:
        error_logger.error(f"Authentication error during registration: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Authentication failed during registration."
        )
    except DatabaseError as e:
        error_logger.error(f"Database error during registration: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="A database error occurred."
        )
    except Exception as e:
        error_logger.error(f"Registration error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred."
        )

@router.post("/login", response_model=TokenResponse)
async def login(
    login_data: LoginRequest,
    auth_service: Annotated[AuthService, Depends(get_auth_service)]
):
    """Login user and return access and refresh tokens"""
    try:
        user = await auth_service.authenticate_user(login_data.email, login_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )
        
        tokens = await auth_service.create_user_tokens(user)
        logger.info(f"User logged in successfully: {user.email} (ID: {user.id})")
        return TokenResponse(**tokens)
    except HTTPException:
        raise
    except DatabaseError as e:
        error_logger.error(f"Database error during login: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="A database error occurred during login."
        )
    except Exception as e:
        error_logger.error(f"Login error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred during login."
        )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    token_data: RefreshTokenRequest,
    auth_service: Annotated[AuthService, Depends(get_auth_service)]
):
    """Refresh access token using refresh token"""
    try:
        tokens = await auth_service.refresh_access_token(token_data.refresh_token)
        return TokenResponse(**tokens)
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token."
        )
    except Exception as e:
        error_logger.error(f"Token refresh error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal error occurred during token refresh."
        )

@router.post("/logout")
async def logout(
    token_data: RefreshTokenRequest,
    auth_service: Annotated[AuthService, Depends(get_auth_service)]
):
    """Logout user by revoking refresh token"""
    try:
        success = await auth_service.revoke_refresh_token(token_data.refresh_token)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid refresh token"
            )
        logger.info("User logged out successfully")
        return {"message": "Successfully logged out"}
    except HTTPException:
        raise
    except Exception as e:
        error_logger.error(f"Logout error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal error occurred during logout."
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Get current user information"""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )
