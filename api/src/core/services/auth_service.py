from typing import Optional
from datetime import datetime, timedelta
import os
from jose import JWTError, jwt
from passlib.context import CryptContext
from src.core.domain.entities import User, RefreshToken
from src.core.domain.repositories import UserRepository, RefreshTokenRepository
from src.core.exceptions import AuthenticationError, UserNotFoundError, InvalidCredentialsError

class AuthService:
    def __init__(
        self, 
        user_repository: UserRepository, 
        refresh_token_repository: RefreshTokenRepository
    ):
        self.user_repository = user_repository
        self.refresh_token_repository = refresh_token_repository
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        
        # Configuration
        self.secret_key = os.getenv("SECRET_KEY")
        if not self.secret_key:
            if os.getenv("ENVIRONMENT") == "production":
                raise RuntimeError("SECRET_KEY environment variable is mandatory in production")
            self.secret_key = "development-only-insecure-key"
        self.algorithm = "HS256"
        self.access_token_expire_minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # Default 24 hours
        self.refresh_token_expire_days = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))  # Default 30 days

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return self.pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        """Hash a password"""
        return self.pwd_context.hash(password)

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        
        to_encode.update({"exp": expire, "type": "access"})
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)

    def create_refresh_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT refresh token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(days=self.refresh_token_expire_days)
        
        to_encode.update({"exp": expire, "type": "refresh"})
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)

    def verify_token(self, token: str, token_type: str = "access") -> dict:
        """Verify and decode a JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            user_id: int = payload.get("sub")
            token_type_from_payload: str = payload.get("type")
            
            if user_id is None or token_type_from_payload != token_type:
                raise AuthenticationError("Invalid token")
                
            return {"user_id": user_id}
        except JWTError:
            raise AuthenticationError("Could not validate credentials")

    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate a user with email and password"""
        user = await self.user_repository.get_by_email(email)
        if not user:
            return None
        if not self.verify_password(password, user.hashed_password):
            return None
        return user

    async def create_user_tokens(self, user: User) -> dict:
        """Create access and refresh tokens for a user"""
        # Create access token
        access_token_expires = timedelta(minutes=self.access_token_expire_minutes)
        access_token = self.create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        )
        
        # Create refresh token
        refresh_token_expires = timedelta(days=self.refresh_token_expire_days)
        refresh_token = self.create_refresh_token(
            data={"sub": str(user.id)}, expires_delta=refresh_token_expires
        )
        
        # Store refresh token in database
        db_refresh_token = RefreshToken(
            user_id=user.id,
            token=refresh_token,
            expires_at=datetime.utcnow() + refresh_token_expires
        )
        await self.refresh_token_repository.create(db_refresh_token)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }

    async def refresh_access_token(self, refresh_token: str) -> dict:
        """Refresh an access token using a refresh token"""
        # Verify refresh token
        token_data = self.verify_token(refresh_token, "refresh")
        
        # Check if refresh token exists in database and is not revoked
        db_token = await self.refresh_token_repository.get_by_token(refresh_token)
        
        if not db_token or db_token.is_revoked or db_token.expires_at < datetime.utcnow():
            raise AuthenticationError("Invalid refresh token")
        
        # Get user
        user = await self.user_repository.get_by_id(token_data["user_id"])
        if not user:
            raise UserNotFoundError("User not found")
        
        # Create new access token
        access_token_expires = timedelta(minutes=self.access_token_expire_minutes)
        access_token = self.create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,  # Keep the same refresh token
            "token_type": "bearer"
        }

    async def revoke_refresh_token(self, refresh_token: str) -> bool:
        """Revoke a refresh token"""
        return await self.refresh_token_repository.revoke_token(refresh_token)

    async def get_current_user(self, token: str) -> User:
        """Get current user from access token"""
        token_data = self.verify_token(token, "access")
        user = await self.user_repository.get_by_id(token_data["user_id"])
        if user is None:
            raise UserNotFoundError("User not found")
        return user

    async def register_user(self, email: str, username: str, password: str) -> User:
        """Register a new user"""
        # Check if user already exists
        existing_user = await self.user_repository.get_by_email(email)
        if existing_user:
            raise AuthenticationError("Email already registered")
        
        existing_username = await self.user_repository.get_by_username(username)
        if existing_username:
            raise AuthenticationError("Username already taken")
        
        # Create new user
        hashed_password = self.get_password_hash(password)
        user = User(
            email=email,
            username=username,
            hashed_password=hashed_password
        )
        
        return await self.user_repository.create(user)
